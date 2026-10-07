-- Hotel management: hotels in the database, room closures, and admin functions.
--
-- Run AFTER 20260101000000_booking_engine.sql. Safe to run on a fresh project or
-- on one that already has bookings and edited room counts/rates: existing data
-- is kept (everything here is idempotent / "do nothing on conflict").
--
-- This also loads your 7 current hotels and their 19 room types, so
-- supabase/seed.sql is no longer needed. Room counts are a PLACEHOLDER of 3 per
-- room type: set the real numbers in /admin before accepting bookings.

-- ---------------------------------------------------------------------------
-- Hotels
-- ---------------------------------------------------------------------------
create table if not exists public.hotels (
  slug        text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 40),
  name        text    not null check (length(trim(name)) between 2 and 80),
  city        text    not null check (length(trim(city)) between 2 and 60),
  state       text    not null default '' check (length(state) <= 60),
  tagline     text    not null default '' check (length(tagline) <= 160),
  description text    not null default '' check (length(description) <= 1500),
  phone       text    not null default '' check (phone = '' or phone ~ '^[0-9]{10}$'),
  lat         numeric(9, 6) check (lat between -90 and 90),
  lng         numeric(9, 6) check (lng between -180 and 180),
  image       text    not null default '/img/lobby.webp',
  amenities   text[]  not null default '{}',
  active      boolean not null default true,      -- shown on the website and bookable
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.hotels enable row level security;

-- Your current hotels (never overwrites hotels you've already edited).
insert into public.hotels
  (slug, name, city, state, tagline, description, phone, lat, lng, image, amenities, sort_order)
values
  ('triplicane', 'Al Noor Triplicane', 'Chennai', 'Tamil Nadu', 'Heritage Chennai, minutes from Marina Beach', 'Nestled in the heart of Chennai, our Triplicane location offers a perfect blend of traditional charm and modern comfort, with easy access to the city''s cultural landmarks and business districts.', '7338944222', 13.0665, 80.2789, '/img/facade-close.webp', array['Wi-Fi', 'Parking', 'Restaurant', '24h Room Service', 'Power Backup', 'Laundry'], 1),
  ('parrys', 'Al Noor Parrys', 'Chennai', 'Tamil Nadu', 'Commercial hub, seamless city connectivity', 'Located in the bustling commercial hub of Parrys, our hotel suits business and leisure travellers alike, with prime access to major transportation hubs across the city.', '7338944222', 13.0855, 80.2822, '/img/entrance.webp', array['Wi-Fi', 'Parking', 'Restaurant', '24h Room Service', 'Power Backup', 'Laundry'], 2),
  ('koyambedu', 'Al Noor Koyambedu', 'Chennai', 'Tamil Nadu', 'Modern stays, also known as Smart Homes', 'Also known as Smart Homes, our Koyambedu location offers modern accommodation in the heart of Chennai, perfect for business and leisure travellers seeking comfort and convenience.', '7338944222', 13.0665, 80.2043, '/img/night-facade.webp', array['Wi-Fi', 'Parking', 'Restaurant', '24h Room Service', 'Power Backup', 'Laundry'], 3),
  ('electronic-city', 'Al Noor Electronic City', 'Bengaluru', 'Karnataka', 'In Bengaluru''s thriving tech corridor', 'Situated in Bengaluru''s tech corridor, our Electronic City branch caters to the modern professional, close to major IT parks and corporate offices.', '7338944222', 12.8456, 77.6634, '/img/lobby.webp', array['Wi-Fi', 'Parking', 'Restaurant', '24h Room Service', 'Power Backup', 'Laundry'], 4),
  ('koramangala', 'Al Noor Koramangala', 'Bengaluru', 'Karnataka', 'One of Bengaluru''s most vibrant neighbourhoods', 'Premium hospitality in one of Bengaluru''s most vibrant neighbourhoods, combining contemporary design with warm service for business travellers and families.', '7338944222', 12.9352, 77.6245, '/img/night-grids.webp', array['Wi-Fi', 'Parking', 'Restaurant', '24h Room Service', 'Power Backup', 'Laundry'], 5),
  ('hyderabad', 'Al Noor Hyderabad', 'Hyderabad', 'Telangana', 'Luxury and convenience in the City of Pearls', 'Whether you''re visiting for business or exploring the city''s rich heritage, our Hyderabad hotel offers a comfortable retreat with attentive service and complete amenities.', '7338944222', 17.385, 78.4867, '/img/corridor.webp', array['Wi-Fi', 'Parking', 'Restaurant', '24h Room Service', 'Power Backup', 'Laundry'], 6),
  ('ooty', 'Al Noor Ooty', 'Ooty', 'Tamil Nadu', 'A peaceful retreat in the Nilgiri hills', 'Escape to the serene hills of Ooty. Surrounded by tea gardens and cool mountain air, this hotel is a peaceful retreat with every modern comfort for a delightful stay.', '7338944222', 11.4102, 76.695, '/img/pool-dusk.webp', array['Wi-Fi', 'Parking', 'Restaurant', '24h Room Service', 'Power Backup', 'Laundry'], 7)
on conflict (slug) do nothing;

-- Any hotel referenced by older rows but missing above gets a placeholder so the
-- foreign keys below can be added.
insert into public.hotels (slug, name, city)
select distinct s.slug, initcap(replace(s.slug, '-', ' ')), 'Unknown'
from (select hotel_slug as slug from public.room_types
      union select hotel_slug from public.bookings) s
where s.slug not in (select slug from public.hotels)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Room types: bed/bath details, link to hotels
-- ---------------------------------------------------------------------------
alter table public.room_types add column if not exists beds  integer not null default 1 check (beds  between 1 and 20);
alter table public.room_types add column if not exists baths integer not null default 1 check (baths between 1 and 20);

-- Your current room types. Existing rows keep their edited stock and rates; only
-- untouched bed/bath defaults are filled in.
insert into public.room_types (hotel_slug, name, total_rooms, base_rate, max_guests, beds, baths)
values
('triplicane', 'Deluxe', 3, 899, 2, 1, 1),
  ('triplicane', 'Triple', 3, 1499, 3, 2, 1),
  ('triplicane', 'Quadruple', 3, 1999, 5, 2, 1),
  ('triplicane', 'Suite', 3, 2999, 2, 1, 1),
  ('parrys', 'Standard', 3, 799, 2, 1, 1),
  ('parrys', 'Deluxe', 3, 1499, 4, 2, 2),
  ('koyambedu', 'Deluxe', 3, 899, 2, 1, 1),
  ('koyambedu', 'Deluxe Quad', 3, 1999, 4, 2, 1),
  ('electronic-city', 'Deluxe', 3, 899, 2, 1, 1),
  ('electronic-city', 'Deluxe Twin', 3, 1499, 3, 2, 1),
  ('electronic-city', 'Deluxe Fam', 3, 1999, 4, 2, 1),
  ('koramangala', 'Deluxe Double', 3, 899, 2, 1, 1),
  ('koramangala', 'Deluxe Twin', 3, 1499, 3, 2, 1),
  ('koramangala', 'Junior Suite', 3, 1999, 2, 1, 1),
  ('hyderabad', 'Classic', 3, 899, 2, 1, 1),
  ('hyderabad', 'Deluxe', 3, 1499, 2, 1, 1),
  ('hyderabad', 'Suite', 3, 1999, 2, 1, 1),
  ('ooty', 'Standard', 3, 899, 2, 1, 1),
  ('ooty', 'Deluxe', 3, 1499, 4, 2, 2)
on conflict (hotel_slug, name) do update
  set beds = excluded.beds, baths = excluded.baths
  where public.room_types.beds = 1 and public.room_types.baths = 1;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'room_types_hotel_fk') then
    alter table public.room_types
      add constraint room_types_hotel_fk foreign key (hotel_slug) references public.hotels (slug);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bookings_hotel_fk') then
    alter table public.bookings
      add constraint bookings_hotel_fk foreign key (hotel_slug) references public.hotels (slug);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Room closures (maintenance, blackout dates, holding rooms back).
-- from_date..to_date are INCLUSIVE nights; `rooms` rooms are taken off sale.
-- ---------------------------------------------------------------------------
create table if not exists public.room_blocks (
  id           uuid primary key default gen_random_uuid(),
  room_type_id uuid    not null references public.room_types (id) on delete cascade,
  from_date    date    not null,
  to_date      date    not null,
  rooms        integer not null check (rooms >= 1),
  reason       text    not null default '' check (length(reason) <= 200),
  created_at   timestamptz not null default now(),
  check (to_date >= from_date)
);
create index if not exists room_blocks_room_dates_idx on public.room_blocks (room_type_id, from_date, to_date);
alter table public.room_blocks enable row level security;

-- Rooms in use (bookings + closures) on the busiest night of [p_in, p_out).
create or replace function public._peak_usage(p_rt uuid, p_in date, p_out date)
returns integer language sql stable as $$
  select coalesce(max(day_used), 0)::integer
  from (
    select
      coalesce((select sum(b.rooms) from public.bookings b
                 where b.room_type_id = p_rt and b.status = 'confirmed'
                   and b.check_in <= g.d::date and b.check_out > g.d::date), 0)
    + coalesce((select sum(k.rooms) from public.room_blocks k
                 where k.room_type_id = p_rt
                   and k.from_date <= g.d::date and k.to_date >= g.d::date), 0) as day_used
    from generate_series(p_in, p_out - 1, interval '1 day') g(d)
  ) x
$$;

-- Booking JSON now carries the hotel's current name.
create or replace function public._booking_json(b public.bookings)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'reference', b.reference, 'hotel', b.hotel_slug,
    'hotel_name', (select h.name from public.hotels h where h.slug = b.hotel_slug),
    'room_type', b.room_type,
    'check_in', b.check_in, 'check_out', b.check_out, 'nights', b.nights,
    'rooms', b.rooms, 'adults', b.adults, 'children', b.children,
    'guest_name', b.guest_name, 'guest_phone', b.guest_phone, 'guest_email', b.guest_email,
    'notes', b.notes, 'corporate', b.corporate, 'nightly_rate', b.nightly_rate,
    'subtotal', b.subtotal, 'discount', b.discount, 'total', b.total,
    'status', b.status, 'payment_method', b.payment_method,
    'created_at', b.created_at, 'cancelled_at', b.cancelled_at, 'cancelled_by', b.cancelled_by
  )
$$;

-- Availability: only active room types of active hotels.
create or replace function public.room_availability(p jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'room_type',   rt.name,
      'total_rooms', rt.total_rooms,
      'available',   greatest(rt.total_rooms - public._peak_usage(rt.id, (p->>'check_in')::date, (p->>'check_out')::date), 0),
      'rate',        rt.base_rate,
      'max_guests',  rt.max_guests
    ) order by rt.base_rate, rt.name
  ), '[]'::jsonb)
  from public.room_types rt
  join public.hotels h on h.slug = rt.hotel_slug and h.active
  where rt.hotel_slug = p->>'hotel' and rt.active
$$;

-- Same atomic booking as before, but the hotel must be active.
create or replace function public.create_booking(p jsonb)
returns jsonb language plpgsql as $$
declare
  rt        public.room_types;
  b         public.bookings;
  v_in      date;
  v_out     date;
  v_nights  integer;
  v_rooms   integer;
  v_adults  integer;
  v_kids    integer;
  v_avail   integer;
  v_sub     integer;
  v_disc    integer;
  v_pct     numeric;
  v_ref     text;
  v_tries   integer := 0;
  v_alpha   constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  v_in     := (p->>'check_in')::date;
  v_out    := (p->>'check_out')::date;
  v_nights := v_out - v_in;
  v_rooms  := coalesce((p->>'rooms')::integer, 1);
  v_adults := coalesce((p->>'adults')::integer, 1);
  v_kids   := coalesce((p->>'children')::integer, 0);
  v_pct    := least(greatest(coalesce((p->>'discount_pct')::numeric, 0), 0), 100);

  if v_nights < 1 or v_nights > 365 then
    return jsonb_build_object('ok', false, 'error', 'invalid_dates');
  end if;
  if v_rooms < 1 or v_rooms > 6 or v_adults < 1 or v_kids < 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_guests');
  end if;

  select rt_.* into rt
  from public.room_types rt_
  join public.hotels h on h.slug = rt_.hotel_slug and h.active
  where rt_.hotel_slug = p->>'hotel' and rt_.name = p->>'room_type' and rt_.active
  for update of rt_;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'room_not_found');
  end if;

  if v_adults + v_kids > rt.max_guests * v_rooms then
    return jsonb_build_object('ok', false, 'error', 'over_capacity', 'max_guests', rt.max_guests * v_rooms);
  end if;

  v_avail := rt.total_rooms - public._peak_usage(rt.id, v_in, v_out);
  if v_avail < v_rooms then
    return jsonb_build_object('ok', false, 'error', 'sold_out', 'available', greatest(v_avail, 0));
  end if;

  v_sub  := rt.base_rate * v_nights * v_rooms;
  v_disc := round(v_sub * v_pct / 100.0)::integer;

  loop
    v_ref := 'ALN-' || (
      select string_agg(substr(v_alpha, 1 + floor(random() * length(v_alpha))::integer, 1), '')
      from generate_series(1, 6)
    );
    begin
      insert into public.bookings (
        reference, hotel_slug, room_type_id, room_type, check_in, check_out, nights, rooms,
        adults, children, guest_name, guest_phone, guest_email, notes, corporate,
        nightly_rate, subtotal, discount, total
      ) values (
        v_ref, rt.hotel_slug, rt.id, rt.name, v_in, v_out, v_nights, v_rooms,
        v_adults, v_kids, p->>'guest_name', public._phone_digits(p->>'guest_phone'),
        nullif(p->>'guest_email', ''), nullif(p->>'notes', ''), coalesce((p->>'corporate')::boolean, false),
        rt.base_rate, v_sub, v_disc, v_sub - v_disc
      ) returning * into b;
      exit;
    exception when unique_violation then
      v_tries := v_tries + 1;
      if v_tries > 8 then raise; end if;
    end;
  end loop;

  return jsonb_build_object('ok', true, 'booking', public._booking_json(b));
end;
$$;

-- ---------------------------------------------------------------------------
-- Public read for the website: active hotels with their active room types.
-- ---------------------------------------------------------------------------
create or replace function public.public_hotels(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', h.slug, 'name', h.name, 'city', h.city, 'state', h.state,
    'tagline', h.tagline, 'description', h.description, 'phone', h.phone,
    'lat', h.lat, 'lng', h.lng, 'image', h.image, 'amenities', to_jsonb(h.amenities),
    'rooms', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', r.name, 'price', r.base_rate, 'beds', r.beds, 'baths', r.baths, 'maxGuests', r.max_guests
      ) order by r.base_rate, r.name)
      from public.room_types r where r.hotel_slug = h.slug and r.active
    ), '[]'::jsonb)
  ) order by h.sort_order, h.name), '[]'::jsonb)
  from public.hotels h
  where h.active
$$;

-- ---------------------------------------------------------------------------
-- Admin: hotels
-- ---------------------------------------------------------------------------
create or replace function public._admin_hotel_json(h public.hotels)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'slug', h.slug, 'name', h.name, 'city', h.city, 'state', h.state,
    'tagline', h.tagline, 'description', h.description, 'phone', h.phone,
    'lat', h.lat, 'lng', h.lng, 'image', h.image, 'amenities', to_jsonb(h.amenities),
    'active', h.active, 'sort_order', h.sort_order,
    'room_types', (select count(*) from public.room_types r where r.hotel_slug = h.slug),
    'bookings', (select count(*) from public.bookings b where b.hotel_slug = h.slug)
  )
$$;

create or replace function public.admin_list_hotels(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(public._admin_hotel_json(h) order by h.sort_order, h.name), '[]'::jsonb)
  from public.hotels h
$$;

-- p = { mode: 'create'|'update', slug, name, city, state, tagline, description,
--       phone, lat, lng, image, amenities[], active, sort_order }
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
    insert into public.hotels (slug, name, city, state, tagline, description, phone, lat, lng, image, amenities, active, sort_order)
    values (
      v_slug, p->>'name', p->>'city', coalesce(p->>'state', ''), coalesce(p->>'tagline', ''),
      coalesce(p->>'description', ''), coalesce(p->>'phone', ''),
      nullif(p->>'lat', '')::numeric, nullif(p->>'lng', '')::numeric,
      coalesce(nullif(p->>'image', ''), '/img/lobby.webp'),
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

-- Hotels with any booking (even cancelled) can't be deleted: hide them instead.
create or replace function public.admin_delete_hotel(p jsonb)
returns jsonb language plpgsql as $$
declare v_n integer;
begin
  select count(*) into v_n from public.bookings where hotel_slug = p->>'slug';
  if v_n > 0 then
    return jsonb_build_object('ok', false, 'error', 'has_bookings', 'bookings', v_n);
  end if;
  delete from public.room_types where hotel_slug = p->>'slug';   -- closures cascade
  delete from public.hotels where slug = p->>'slug';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: room types (replaces admin_update_room_type)
-- ---------------------------------------------------------------------------
create or replace function public._room_type_json(r public.room_types)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', r.id, 'hotel', r.hotel_slug, 'name', r.name, 'total_rooms', r.total_rooms,
    'base_rate', r.base_rate, 'max_guests', r.max_guests, 'beds', r.beds, 'baths', r.baths,
    'active', r.active,
    'bookings', (select count(*) from public.bookings b where b.room_type_id = r.id)
  )
$$;

create or replace function public.admin_list_room_types(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(public._room_type_json(r) order by r.hotel_slug, r.base_rate, r.name), '[]'::jsonb)
  from public.room_types r
$$;

-- p = { id?, hotel, name, total_rooms, base_rate, max_guests, beds, baths, active }
-- With an id it updates that room type; without one it creates a new room type.
create or replace function public.admin_save_room_type(p jsonb)
returns jsonb language plpgsql as $$
declare r public.room_types;
begin
  if nullif(p->>'id', '') is null then
    insert into public.room_types (hotel_slug, name, total_rooms, base_rate, max_guests, beds, baths, active)
    values (
      p->>'hotel', p->>'name',
      coalesce((p->>'total_rooms')::integer, 1), (p->>'base_rate')::integer,
      coalesce((p->>'max_guests')::integer, 2), coalesce((p->>'beds')::integer, 1),
      coalesce((p->>'baths')::integer, 1), coalesce((p->>'active')::boolean, true)
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

create or replace function public.admin_delete_room_type(p jsonb)
returns jsonb language plpgsql as $$
declare v_n integer;
begin
  select count(*) into v_n from public.bookings where room_type_id = (p->>'id')::uuid;
  if v_n > 0 then
    return jsonb_build_object('ok', false, 'error', 'has_bookings', 'bookings', v_n);
  end if;
  delete from public.room_types where id = (p->>'id')::uuid;   -- closures cascade
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: availability calendar and closures
-- ---------------------------------------------------------------------------
-- p = { room_type_id, month: 'YYYY-MM' }  ->  one row per day of the month
create or replace function public.admin_calendar(p jsonb)
returns jsonb language plpgsql stable as $$
declare
  r       public.room_types;
  v_first date;
  v_days  jsonb;
begin
  v_first := ((p->>'month') || '-01')::date;   -- inside BEGIN so a bad month is caught below
  select * into r from public.room_types where id = (p->>'room_type_id')::uuid;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  select jsonb_agg(jsonb_build_object(
      'date', g.d::date,
      'booked', bk.n, 'blocked', blk.n,
      'available', greatest(r.total_rooms - bk.n - blk.n, 0)
    ) order by g.d)
  into v_days
  from generate_series(v_first, (v_first + interval '1 month - 1 day')::date, interval '1 day') g(d)
  cross join lateral (
    select coalesce(sum(b.rooms), 0)::integer n from public.bookings b
    where b.room_type_id = r.id and b.status = 'confirmed'
      and b.check_in <= g.d::date and b.check_out > g.d::date) bk
  cross join lateral (
    select coalesce(sum(k.rooms), 0)::integer n from public.room_blocks k
    where k.room_type_id = r.id and k.from_date <= g.d::date and k.to_date >= g.d::date) blk;
  return jsonb_build_object('ok', true, 'room_type', public._room_type_json(r), 'days', v_days);
exception when invalid_datetime_format or datetime_field_overflow then
  return jsonb_build_object('ok', false, 'error', 'invalid');
end;
$$;

-- p = { room_type_id?, hotel? }  ->  current and upcoming closures
create or replace function public.admin_list_blocks(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', k.id, 'room_type_id', k.room_type_id, 'hotel', r.hotel_slug, 'room_type', r.name,
    'from', k.from_date, 'to', k.to_date, 'rooms', k.rooms, 'reason', k.reason
  ) order by k.from_date, r.hotel_slug, r.name), '[]'::jsonb)
  from public.room_blocks k
  join public.room_types r on r.id = k.room_type_id
  where k.to_date >= coalesce((p->>'today')::date, current_date)
    and (nullif(p->>'room_type_id', '') is null or k.room_type_id = (p->>'room_type_id')::uuid)
    and (nullif(p->>'hotel', '') is null or r.hotel_slug = p->>'hotel')
$$;

-- p = { room_type_id, from, to, rooms, reason }
-- Returns how many nights end up over capacity (guests already booked), so the
-- admin can be warned. Existing bookings are never cancelled by a closure.
create or replace function public.admin_add_block(p jsonb)
returns jsonb language plpgsql as $$
declare
  r       public.room_types;
  k       public.room_blocks;
  v_from  date := (p->>'from')::date;
  v_to    date := (p->>'to')::date;
  v_over  integer;
begin
  select * into r from public.room_types where id = (p->>'room_type_id')::uuid;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if v_to < v_from or v_to - v_from > 366 then
    return jsonb_build_object('ok', false, 'error', 'invalid_dates');
  end if;

  insert into public.room_blocks (room_type_id, from_date, to_date, rooms, reason)
  values (r.id, v_from, v_to, coalesce((p->>'rooms')::integer, r.total_rooms), coalesce(p->>'reason', ''))
  returning * into k;

  select count(*) into v_over
  from generate_series(v_from, v_to, interval '1 day') g(d)
  where public._peak_usage(r.id, g.d::date, g.d::date + 1) > r.total_rooms;

  return jsonb_build_object('ok', true, 'overbooked_nights', v_over, 'block', jsonb_build_object(
    'id', k.id, 'from', k.from_date, 'to', k.to_date, 'rooms', k.rooms, 'reason', k.reason));
exception when check_violation or invalid_text_representation or invalid_datetime_format then
  return jsonb_build_object('ok', false, 'error', 'invalid');
end;
$$;

create or replace function public.admin_delete_block(p jsonb)
returns jsonb language plpgsql as $$
begin
  delete from public.room_blocks where id = (p->>'id')::uuid;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- admin_update_room_type is replaced by admin_save_room_type.
drop function if exists public.admin_update_room_type(jsonb);

-- ---------------------------------------------------------------------------
-- Photo storage bucket (Supabase only; skipped where the storage schema is absent).
-- Public read; writes only through the server with the service-role key.
-- ---------------------------------------------------------------------------
do $$ begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public) values ('hotel-images', 'hotel-images', true)
    on conflict (id) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Lock everything to the service role.
-- ---------------------------------------------------------------------------
do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('_peak_usage', '_booking_json', '_admin_hotel_json', '_room_type_json',
                        'room_availability', 'create_booking', 'public_hotels',
                        'admin_list_hotels', 'admin_save_hotel', 'admin_delete_hotel',
                        'admin_list_room_types', 'admin_save_room_type', 'admin_delete_room_type',
                        'admin_calendar', 'admin_list_blocks', 'admin_add_block', 'admin_delete_block')
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
    revoke all on public.hotels, public.room_blocks from anon, authenticated;
  end if;
end $$;
