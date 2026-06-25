import Stripe from "https://esm.sh/stripe@18.2.1?target=deno";
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { offers } from "../_shared/offers.ts";
import { getServiceClient, toEntitlementPayload } from "../_shared/supabase.ts";

function getStripe() {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });
}

function hasEntitlements(row: Record<string, unknown> | null) {
  const skins = Array.isArray(row?.unlocked_skin_ids) ? row.unlocked_skin_ids : [];
  return Boolean(
    row?.all_2026
    || Number(row?.skin_credits || 0) > 0
    || skins.some((skinId) => skinId !== "default")
  );
}

async function readEntitlements(supabase: ReturnType<typeof getServiceClient>, licenseId: string) {
  return await supabase
    .from("purchase_entitlements")
    .select("unlocked_skin_ids, skin_credits, all_2026, updated_at")
    .eq("license_id", licenseId)
    .maybeSingle();
}

async function recoverPaidStripeSessions(supabase: ReturnType<typeof getServiceClient>, licenseId: string) {
  const stripe = getStripe();
  if (!stripe) return null;

  const sessions = await stripe.checkout.sessions.list({ limit: 100 });
  let recovered = null;

  for (const session of sessions.data) {
    const sessionLicenseId = session.metadata?.license_id || session.client_reference_id || "";
    const sku = session.metadata?.sku || "";
    const skinId = session.metadata?.skin_id || "";

    if (session.payment_status !== "paid" || sessionLicenseId !== licenseId || !Object.hasOwn(offers, sku)) {
      continue;
    }

    const { data, error } = await supabase.rpc("apply_purchase_event", {
      p_stripe_session_id: session.id,
      p_license_id: licenseId,
      p_sku: sku,
      p_skin_id: skinId,
      p_amount_cents: Number(session.amount_total || offers[sku as keyof typeof offers].amountCents),
      p_currency: session.currency || "usd",
      p_raw_event: session,
    });

    if (error) throw error;
    recovered = data;
  }

  return recovered;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const tail = parts[parts.length - 1];
  const supabase = getServiceClient();

  try {
    if (req.method === "POST" && tail === "redeem") {
      const { licenseId, skinId } = await req.json();
      if (!licenseId || !skinId) return jsonResponse({ error: "invalid_redeem_request" }, { status: 400 });

      const { data, error } = await supabase.rpc("redeem_skin_credit", {
        p_license_id: licenseId,
        p_skin_id: skinId,
      });
      if (error) return jsonResponse({ error: error.message }, { status: 400 });
      return jsonResponse(toEntitlementPayload(data));
    }

    if (req.method === "GET") {
      const licenseId = tail;
      if (!licenseId || licenseId === "entitlements") return jsonResponse({ error: "license_id_required" }, { status: 400 });

      let { data, error } = await readEntitlements(supabase, licenseId);
      if (error) return jsonResponse({ error: error.message }, { status: 500 });

      if (!hasEntitlements(data)) {
        const recovered = await recoverPaidStripeSessions(supabase, licenseId);
        if (recovered) {
          data = recovered;
        } else {
          const refreshed = await readEntitlements(supabase, licenseId);
          if (refreshed.error) return jsonResponse({ error: refreshed.error.message }, { status: 500 });
          data = refreshed.data;
        }
      }

      return jsonResponse(toEntitlementPayload(data));
    }

    return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
  } catch {
    return jsonResponse({ error: "entitlements_failed" }, { status: 500 });
  }
});
