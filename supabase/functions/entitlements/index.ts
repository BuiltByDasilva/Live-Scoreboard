import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient, toEntitlementPayload } from "../_shared/supabase.ts";

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

      const { data, error } = await supabase
        .from("purchase_entitlements")
        .select("unlocked_skin_ids, skin_credits, all_2026, updated_at")
        .eq("license_id", licenseId)
        .maybeSingle();
      if (error) return jsonResponse({ error: error.message }, { status: 500 });
      return jsonResponse(toEntitlementPayload(data));
    }

    return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
  } catch {
    return jsonResponse({ error: "entitlements_failed" }, { status: 500 });
  }
});

