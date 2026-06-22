export const offers = {
  skin_single: {
    priceEnv: "STRIPE_PRICE_SKIN_SINGLE",
    amountCents: 99,
  },
  skin_five: {
    priceEnv: "STRIPE_PRICE_SKIN_FIVE",
    amountCents: 299,
  },
  skins_all_2026: {
    priceEnv: "STRIPE_PRICE_SKINS_ALL_2026",
    amountCents: 999,
  },
} as const;

export type OfferSku = keyof typeof offers;

export function isOfferSku(value: unknown): value is OfferSku {
  return typeof value === "string" && Object.hasOwn(offers, value);
}

export function getPriceId(sku: OfferSku) {
  const priceId = Deno.env.get(offers[sku].priceEnv);
  if (!priceId) throw new Error(`Missing Stripe price env var: ${offers[sku].priceEnv}`);
  return priceId;
}

