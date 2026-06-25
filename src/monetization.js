export const LICENSE_STORAGE_KEY = "liveScoreboardLicenseId";
export const PURCHASE_STATUS = {
  idle: "idle",
  pending: "pending",
  paid: "paid",
  cancelled: "cancelled",
  restored: "restored",
  error: "error",
};

export const PURCHASE_OFFERS = {
  skin_single: {
    sku: "skin_single",
    label: "Single Team Skin",
    priceLabel: "$0.99",
    amountCents: 99,
    currency: "usd",
    description: "Unlock one original 2026 country-inspired skin.",
  },
  skin_five: {
    sku: "skin_five",
    label: "5 Skin Pack",
    priceLabel: "$2.99",
    amountCents: 299,
    currency: "usd",
    description: "Unlock any five original 2026 country-inspired skins.",
  },
  skins_all_2026: {
    sku: "skins_all_2026",
    label: "All Skins Unlock",
    priceLabel: "$9.99",
    amountCents: 999,
    currency: "usd",
    description: "Unlock every current 2026 skin in the collection.",
  },
};

export const MONETIZATION_API_BASE = "https://kmtpuvtswatkilvkffqb.supabase.co/functions/v1";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdHB1dnRzd2F0a2lsdmtmZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDEyOTIsImV4cCI6MjA5NzY3NzI5Mn0.h-OM4NcU08_bZWEtGTKGdbjBMOIxNwQ9XSgvCrOQiJ8";

export function getOffer(sku) {
  return PURCHASE_OFFERS[sku] || PURCHASE_OFFERS.skin_single;
}

export function getCheckoutCopy(sku) {
  const offer = getOffer(sku);
  return `${offer.label} · ${offer.priceLabel}`;
}

export function normalizeEntitlements(value = {}) {
  const skins = Array.isArray(value.skins) ? value.skins : [];
  return {
    skins: [...new Set(skins.filter(Boolean))],
    credits: Number.isFinite(value.credits) ? value.credits : 0,
    all2026: Boolean(value.all2026),
    updatedAt: value.updatedAt || null,
  };
}
