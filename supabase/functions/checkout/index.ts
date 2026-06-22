import Stripe from "https://esm.sh/stripe@18.2.1?target=deno";
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getPriceId, isOfferSku } from "../_shared/offers.ts";

function getStripe() {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, { status: 405 });

  try {
    const stripe = getStripe();
    if (!stripe) return jsonResponse({ error: "payment_config_incomplete" }, { status: 503 });

    const { licenseId, sku, skinId } = await req.json();
    if (!licenseId || !isOfferSku(sku)) return jsonResponse({ error: "invalid_checkout_request" }, { status: 400 });
    if (sku === "skin_single" && !skinId) return jsonResponse({ error: "skin_id_required" }, { status: 400 });

    const origin = Deno.env.get("CHECKOUT_RETURN_URL") || "https://livescoreboard.app/checkout";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: getPriceId(sku), quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancelled`,
      client_reference_id: licenseId,
      metadata: {
        license_id: licenseId,
        sku,
        skin_id: skinId || "",
      },
    });

    return jsonResponse({ checkoutUrl: session.url });
  } catch {
    return jsonResponse({ error: "checkout_failed" }, { status: 500 });
  }
});
