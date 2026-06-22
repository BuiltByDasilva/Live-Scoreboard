import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

export function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) throw new Error("Missing Supabase service credentials.");
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export function toEntitlementPayload(row: Record<string, unknown> | null) {
  return {
    skins: Array.isArray(row?.unlocked_skin_ids) ? row.unlocked_skin_ids : ["default"],
    credits: Number(row?.skin_credits || 0),
    all2026: Boolean(row?.all_2026),
    updatedAt: row?.updated_at || null,
  };
}

