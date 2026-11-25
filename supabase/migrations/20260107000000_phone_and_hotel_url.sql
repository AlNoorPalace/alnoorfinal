-- One phone number for every hotel, and a hotel's web address (URL name) can now be changed.
-- Safe to run more than once. Run it after 20260106000000_hotel_address.sql.

-- Columns from earlier files, repeated (harmless if present) so this file works even if one was skipped.
alter table public.hotels add column if not exists images  text[] not null default '{}';
alter table public.hotels add column if not exists address text   not null default '';

-- Every hotel's phone number (call and WhatsApp links use it).
update public.hotels set phone = '9600158529';

-- Renaming a hotel's URL name must carry its rooms and bookings along.
do $$ begin
  alter table public.room_types drop constraint if exists room_types_hotel_fk;
  alter table public.room_types
    add constraint room_types_hotel_fk foreign key (hotel_slug) references public.hotels (slug) on update cascade;
  alter table public.bookings drop constraint if exists bookings_hotel_fk;
  alter table public.bookings
    add constraint bookings_hotel_fk foreign key (hotel_slug) references public.hotels (slug) on update cascade;
end $$;

-- Old addresses keep working: /hotels/<old> redirects to /hotels/<new>.
create table if not exists public.hotel_redirects (
  old_slug   text primary key,
  new_slug   text not null,
  created_at timestamptz not null default now()
);
alter table public.hotel_redirects enable row level security;

-- p = { slug } -> the hotel's current URL name if `slug` is an old one, otherwise null.
create or replace function public.hotel_redirect(p jsonb)
returns jsonb language sql stable as $$
  select to_jsonb(r.new_slug)
  from public.hotel_redirects r
  where r.old_slug = p->>'slug'
    and exists (select 1 from public.hotels h where h.slug = r.new_slug and h.active)
$$;

create or replace function public.admin_save_hotel(p jsonb)
returns jsonb language plpgsql as $$
declare
  h        public.hotels;
  v_slug   text := p->>'slug';
  v_order  integer;
  v_new    text := nullif(p->>'new_slug', '');
begin
  if p->>'mode' = 'create' then
    if exists (select 1 from public.hotels where slug = v_slug) then
      return jsonb_build_object('ok', false, 'error', 'slug_taken');
    end if;
    v_order := coalesce((p->>'sort_order')::integer, (select coalesce(max(sort_order), 0) + 1 from public.hotels));
    insert into public.hotels (slug, name, city, state, address, tagline, description, phone, lat, lng, image, images, amenities, active, sort_order)
    values (
      v_slug, p->>'name', p->>'city', coalesce(p->>'state', ''), coalesce(p->>'address', ''), coalesce(p->>'tagline', ''),
      coalesce(p->>'description', ''), coalesce(p->>'phone', ''),
      nullif(p->>'lat', '')::numeric, nullif(p->>'lng', '')::numeric,
      coalesce(nullif(p->>'image', ''), '/img/lobby.webp'),
      coalesce(array(select jsonb_array_elements_text(p->'images')), '{}'),
      coalesce(array(select jsonb_array_elements_text(p->'amenities')), '{}'),
      coalesce((p->>'active')::boolean, true), v_order
    ) returning * into h;
  else
    if v_new is not null and v_new <> v_slug then
      if exists (select 1 from public.hotels where slug = v_new) then
        return jsonb_build_object('ok', false, 'error', 'slug_taken');
      end if;
    end if;
    update public.hotels set
      slug        = coalesce(v_new, slug),
      name        = coalesce(p->>'name', name),
      city        = coalesce(p->>'city', city),
      state       = coalesce(p->>'state', state),
      address     = coalesce(p->>'address', address),
      tagline     = coalesce(p->>'tagline', tagline),
      description = coalesce(p->>'description', description),
      phone       = coalesce(p->>'phone', phone),
      lat         = case when p ? 'lat' then nullif(p->>'lat', '')::numeric else lat end,
      lng         = case when p ? 'lng' then nullif(p->>'lng', '')::numeric else lng end,
      image       = coalesce(nullif(p->>'image', ''), image),
      images      = case when p ? 'images' then coalesce(array(select jsonb_array_elements_text(p->'images')), '{}') else images end,
      amenities   = case when p ? 'amenities' then coalesce(array(select jsonb_array_elements_text(p->'amenities')), '{}') else amenities end,
      active      = coalesce((p->>'active')::boolean, active),
      sort_order  = coalesce((p->>'sort_order')::integer, sort_order),
      updated_at  = now()
    where slug = v_slug
    returning * into h;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'not_found');
    end if;
    if v_new is not null and v_new <> v_slug then
      -- the old web address keeps working: it redirects to the new one
      delete from public.hotel_redirects where old_slug = v_new;
      update public.hotel_redirects set new_slug = v_new where new_slug = v_slug;
      insert into public.hotel_redirects (old_slug, new_slug) values (v_slug, v_new)
        on conflict (old_slug) do update set new_slug = excluded.new_slug;
    end if;
  end if;
  return jsonb_build_object('ok', true, 'hotel', public._admin_hotel_json(h));
exception when check_violation or invalid_text_representation or numeric_value_out_of_range or not_null_violation then
  return jsonb_build_object('ok', false, 'error', 'invalid');
end;
$$;

do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('hotel_redirect', 'admin_save_hotel')
  loop
    execute format('revoke all on function %s from public', fn.sig);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on function %s from anon, authenticated', fn.sig);
    end if;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant execute on function %s to service_role', fn.sig);
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.hotel_redirects from anon, authenticated;
  end if;
end $$;
