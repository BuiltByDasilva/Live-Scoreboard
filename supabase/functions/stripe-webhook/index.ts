import Stripe from "https://esm.sh/stripe@18.2.1?target=deno";
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { offers } from "../_shared/offers.ts";
import { getServiceClient, toEntitlementPayload } from "../_shared/supabase.ts";

function getStripe() {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripe = getStripe();
  if (!stripe || !webhookSecret) return jsonResponse({ error: "payment_config_incomplete" }, { status: 503 });
  if (!signature) return jsonResponse({ error: "missing_signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), signature, webhookSecret);
  } catch {
    return jsonResponse({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") return jsonResponse({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") return jsonResponse({ received: true });

  const licenseId = session.metadata?.license_id || session.client_reference_id || "";
  const sku = session.metadata?.sku || "";
  const skinId = session.metadata?.skin_id || "";
  if (!licenseId || !Object.hasOwn(offers, sku)) return jsonResponse({ error: "invalid_metadata" }, { status: 400 });

  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("apply_purchase_event", {
    p_stripe_session_id: session.id,
    p_license_id: licenseId,
    p_sku: sku,
    p_skin_id: skinId,
    p_amount_cents: Number(session.amount_total || offers[sku as keyof typeof offers].amountCents),
    p_currency: session.currency || "usd",
    p_raw_event: event,
  });
  if (error) return jsonResponse({ error: error.message }, { status: 500 });

  return jsonResponse({ received: true, entitlements: toEntitlementPayload(data) });
});
