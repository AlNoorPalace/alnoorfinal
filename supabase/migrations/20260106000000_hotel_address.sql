-- Street address for each hotel (shown on its page and in search results markup).
-- Safe to run more than once. Run it after 20260105000000_site_images_and_deletes.sql.


-- Columns added by earlier files, repeated here (harmless if they already exist) so this file
-- also works if an earlier one was skipped.
alter table public.hotels     add column if not exists images      text[] not null default '{}';
alter table public.room_types add column if not exists images      text[] not null default '{}';
alter table public.room_types add column if not exists description text   not null default '';

alter table public.hotels add column if not exists address text not null default '';

do $$ begin
  alter table public.hotels add constraint hotels_address_max check (char_length(address) <= 200);
exception when duplicate_object then null; end $$;

-- Addresses for the two branches that have a verified listing address (only where still empty).
update public.hotels set address = '2nd Floor, 221/222, NSC Bose Road, Parry''s Corner, George Town, Chennai, Tamil Nadu 600001'
  where slug = 'parrys' and address = '';
update public.hotels set address = '158, Westbury Road, 175 B4, Ooty Club Road, Hill Bunk, Ooty, Tamil Nadu 643001'
  where slug = 'ooty' and address = '';

create or replace function public.public_hotels(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', h.slug, 'name', h.name, 'city', h.city, 'state', h.state,
    'address', h.address, 'tagline', h.tagline, 'description', h.description, 'phone', h.phone,
    'lat', h.lat, 'lng', h.lng, 'image', h.image, 'images', to_jsonb(h.images), 'amenities', to_jsonb(h.amenities),
    'rooms', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', r.name, 'price', r.base_rate, 'beds', r.beds, 'baths', r.baths, 'maxGuests', r.max_guests,
        'images', to_jsonb(r.images), 'description', r.description
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
    'address', h.address, 'tagline', h.tagline, 'description', h.description, 'phone', h.phone,
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
    update public.hotels set
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
  end if;
  return jsonb_build_object('ok', true, 'hotel', public._admin_hotel_json(h));
exception when check_violation or invalid_text_representation or numeric_value_out_of_range or not_null_violation then
  return jsonb_build_object('ok', false, 'error', 'invalid');
end;
$$;
