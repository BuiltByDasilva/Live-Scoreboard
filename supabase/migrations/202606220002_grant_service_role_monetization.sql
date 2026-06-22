grant usage on schema public to service_role;
grant select, insert, update on public.purchase_entitlements to service_role;
grant select, insert, update on public.purchase_events to service_role;
grant usage, select on sequence public.purchase_events_id_seq to service_role;
grant execute on function public.redeem_skin_credit(text, text) to service_role;
grant execute on function public.apply_purchase_event(text, text, text, text, integer, text, jsonb) to service_role;
