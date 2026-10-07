-- Photos: a gallery for every hotel and photos for every room type.
-- Safe to run more than once. Run it after 20260102000000_hotel_management.sql.

alter table public.hotels     add column if not exists images text[] not null default '{}';
alter table public.room_types add column if not exists images text[] not null default '{}';

do $$ begin
  alter table public.hotels     add constraint hotels_images_max     check (coalesce(array_length(images, 1), 0) <= 12);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.room_types add constraint room_types_images_max check (coalesce(array_length(images, 1), 0) <= 8);
exception when duplicate_object then null; end $$;

create or replace function public.public_hotels(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', h.slug, 'name', h.name, 'city', h.city, 'state', h.state,
    'tagline', h.tagline, 'description', h.description, 'phone', h.phone,
    'lat', h.lat, 'lng', h.lng, 'image', h.image, 'images', to_jsonb(h.images), 'amenities', to_jsonb(h.amenities),
    'rooms', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', r.name, 'price', r.base_rate, 'beds', r.beds, 'baths', r.baths, 'maxGuests', r.max_guests, 'images', to_jsonb(r.images)
      ) order by r.base_rate, r.name)
      from public.room_types r where r.hotel_slug = h.slug and r.active
    ), '[]'::jsonb)
  ) order by h.sort_order, h.name), '[]'::jsonb)
  from public.hotels h
  where h.active
$$;

create or replace function public._admin_hotel_json(h public.hotels)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'slug', h.slug, 'name', h.name, 'city', h.city, 'state', h.state,
    'tagline', h.tagline, 'description', h.description, 'phone', h.phone,
    'lat', h.lat, 'lng', h.lng, 'image', h.image, 'images', to_jsonb(h.images), 'amenities', to_jsonb(h.amenities),
    'active', h.active, 'sort_order', h.sort_order,
    'room_types', (select count(*) from public.room_types r where r.hotel_slug = h.slug),
    'bookings', (select count(*) from public.bookings b where b.hotel_slug = h.slug)
  )
$$;

create or replace function public.admin_save_hotel(p jsonb)
returns jsonb language plpgsql as $$
declare
  h        public.hotels;
  v_slug   text := p->>'slug';
  v_order  integer;
begin
  if p->>'mode' = 'create' then
    if exists (select 1 from public.hotels where slug = v_slug) then
      return jsonb_build_object('ok', false, 'error', 'slug_taken');
    end if;
    v_order := coalesce((p->>'sort_order')::integer, (select coalesce(max(sort_order), 0) + 1 from public.hotels));
    insert into public.hotels (slug, name, city, state, tagline, description, phone, lat, lng, image, images, amenities, active, sort_order)
    values (
      v_slug, p->>'name', p->>'city', coalesce(p->>'state', ''), coalesce(p->>'tagline', ''),
      coalesce(p->>'description', ''), coalesce(p->>'phone', ''),
      nullif(p->>'lat', '')::numeric, nullif(p->>'lng', '')::numeric,
      coalesce(nullif(p->>'image', ''), '/img/lobby.webp'),
      coalesce(array(select jsonb_array_elements_text(p->'images')), '{}'),
      coalesce(array(select jsonb_array_elements_text(p->'amenities')), '{}'),
      coalesce((p->>'active')::boolean, true), v_order
    ) returning * into h;
  else
    update public.hotels set
      name        = coalesce(p->>'name', name),
      city        = coalesce(p->>'city', city),
      state       = coalesce(p->>'state', state),
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
  end if;
  return jsonb_build_object('ok', true, 'hotel', public._admin_hotel_json(h));
exception when check_violation or invalid_text_representation or numeric_value_out_of_range or not_null_violation then
  return jsonb_build_object('ok', false, 'error', 'invalid');
end;
$$;

create or replace function public._room_type_json(r public.room_types)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', r.id, 'hotel', r.hotel_slug, 'name', r.name, 'total_rooms', r.total_rooms,
    'base_rate', r.base_rate, 'max_guests', r.max_guests, 'beds', r.beds, 'baths', r.baths,
    'active', r.active, 'images', to_jsonb(r.images),
    'bookings', (select count(*) from public.bookings b where b.room_type_id = r.id)
  )
$$;

create or replace function public.admin_save_room_type(p jsonb)
returns jsonb language plpgsql as $$
declare r public.room_types;
begin
  if nullif(p->>'id', '') is null then
    insert into public.room_types (hotel_slug, name, total_rooms, base_rate, max_guests, beds, baths, active, images)
    values (
      p->>'hotel', p->>'name',
      coalesce((p->>'total_rooms')::integer, 1), (p->>'base_rate')::integer,
      coalesce((p->>'max_guests')::integer, 2), coalesce((p->>'beds')::integer, 1),
      coalesce((p->>'baths')::integer, 1), coalesce((p->>'active')::boolean, true),
      coalesce(array(select jsonb_array_elements_text(p->'images')), '{}')
    ) returning * into r;
  else
    update public.room_types set
      name        = coalesce(p->>'name', name),
      total_rooms = coalesce((p->>'total_rooms')::integer, total_rooms),
      base_rate   = coalesce((p->>'base_rate')::integer, base_rate),
      max_guests  = coalesce((p->>'max_guests')::integer, max_guests),
      beds        = coalesce((p->>'beds')::integer, beds),
      baths       = coalesce((p->>'baths')::integer, baths),
      active      = coalesce((p->>'active')::boolean, active),
      images      = case when p ? 'images' then coalesce(array(select jsonb_array_elements_text(p->'images')), '{}') else images end,
      updated_at  = now()
    where id = (p->>'id')::uuid
    returning * into r;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'not_found');
    end if;
  end if;
  return jsonb_build_object('ok', true, 'room_type', public._room_type_json(r));
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'name_taken');
  when foreign_key_violation then
    return jsonb_build_object('ok', false, 'error', 'hotel_not_found');
  when check_violation or invalid_text_representation or not_null_violation or numeric_value_out_of_range then
    return jsonb_build_object('ok', false, 'error', 'invalid');
end;
$$;

-- Is this photo URL still used by any hotel or room type? (used before deleting the stored file)
create or replace function public.admin_image_in_use(p jsonb)
returns jsonb language sql stable as $$
  select to_jsonb(
    exists (select 1 from public.hotels h where h.image = p->>'url' or (p->>'url') = any(h.images))
    or exists (select 1 from public.room_types r where (p->>'url') = any(r.images))
  )
$$;

-- Keep the new function locked down like the others.
do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'admin_image_in_use'
  loop
    execute format('revoke all on function %s from public', fn.sig);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on function %s from anon, authenticated', fn.sig);
    end if;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant execute on function %s to service_role', fn.sig);
    end if;
  end loop;
end $$;
