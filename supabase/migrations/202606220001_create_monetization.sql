create table if not exists public.purchase_entitlements (
  license_id text primary key,
  unlocked_skin_ids text[] not null default array['default']::text[],
  skin_credits integer not null default 0 check (skin_credits >= 0),
  all_2026 boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_events (
  id bigint generated always as identity primary key,
  stripe_session_id text not null unique,
  license_id text not null references public.purchase_entitlements(license_id) on delete cascade,
  sku text not null check (sku in ('skin_single', 'skin_five', 'skins_all_2026')),
  skin_id text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  raw_event jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists purchase_events_license_id_idx
  on public.purchase_events (license_id, created_at desc);

alter table public.purchase_entitlements enable row level security;
alter table public.purchase_events enable row level security;

revoke all on public.purchase_entitlements from anon, authenticated;
revoke all on public.purchase_events from anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists purchase_entitlements_touch_updated_at on public.purchase_entitlements;
create trigger purchase_entitlements_touch_updated_at
before update on public.purchase_entitlements
for each row execute function public.touch_updated_at();

create or replace function public.redeem_skin_credit(p_license_id text, p_skin_id text)
returns public.purchase_entitlements
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.purchase_entitlements;
begin
  if p_skin_id is null or length(trim(p_skin_id)) = 0 then
    raise exception 'skin_id_required';
  end if;

  update public.purchase_entitlements
  set unlocked_skin_ids = array_append(unlocked_skin_ids, p_skin_id),
      skin_credits = skin_credits - 1
  where license_id = p_license_id
    and all_2026 = false
    and skin_credits > 0
    and not p_skin_id = any(unlocked_skin_ids)
  returning * into result;

  if result.license_id is not null then
    return result;
  end if;

  select * into result
  from public.purchase_entitlements
  where license_id = p_license_id;

  if result.license_id is null then
    raise exception 'license_not_found';
  end if;

  if result.all_2026 = true or p_skin_id = any(result.unlocked_skin_ids) then
    return result;
  end if;

  raise exception 'no_skin_credits_available';
end;
$$;

create or replace function public.apply_purchase_event(
  p_stripe_session_id text,
  p_license_id text,
  p_sku text,
  p_skin_id text,
  p_amount_cents integer,
  p_currency text,
  p_raw_event jsonb
)
returns public.purchase_entitlements
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_event_id bigint;
  result public.purchase_entitlements;
begin
  if p_sku not in ('skin_single', 'skin_five', 'skins_all_2026') then
    raise exception 'invalid_sku';
  end if;

  insert into public.purchase_entitlements (license_id)
  values (p_license_id)
  on conflict (license_id) do nothing;

  insert into public.purchase_events (
    stripe_session_id,
    license_id,
    sku,
    skin_id,
    amount_cents,
    currency,
    raw_event
  ) values (
    p_stripe_session_id,
    p_license_id,
    p_sku,
    nullif(p_skin_id, ''),
    p_amount_cents,
    coalesce(nullif(p_currency, ''), 'usd'),
    coalesce(p_raw_event, '{}'::jsonb)
  ) on conflict (stripe_session_id) do nothing
  returning id into inserted_event_id;

  if inserted_event_id is null then
    select * into result
    from public.purchase_entitlements
    where license_id = p_license_id;
    return result;
  end if;

  if p_sku = 'skin_single' then
    update public.purchase_entitlements
    set unlocked_skin_ids = (
      select array_agg(distinct skin order by skin)
      from unnest(unlocked_skin_ids || array['default', nullif(p_skin_id, '')]) as skin
      where skin is not null and length(skin) > 0
    )
    where license_id = p_license_id
    returning * into result;
  elsif p_sku = 'skin_five' then
    update public.purchase_entitlements
    set skin_credits = skin_credits + 5
    where license_id = p_license_id
    returning * into result;
  else
    update public.purchase_entitlements
    set all_2026 = true
    where license_id = p_license_id
    returning * into result;
  end if;

  return result;
end;
$$;
