-- Al Noor booking engine: inventory, rates and bookings (pay at hotel).
--
-- Access model: the website calls these functions from the SERVER with the
-- Supabase service-role key. Row Level Security is enabled with no policies and
-- all function/table privileges are revoked from anon/authenticated, so nothing
-- is reachable from the browser or with the public anon key.

create table if not exists public.room_types (
  id          uuid primary key default gen_random_uuid(),
  hotel_slug  text        not null,
  name        text        not null,
  total_rooms integer     not null check (total_rooms >= 0),
  base_rate   integer     not null check (base_rate > 0),   -- INR per room per night
  max_guests  integer     not null check (max_guests > 0),  -- per room
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (hotel_slug, name)
);

create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  reference      text        not null unique,
  hotel_slug     text        not null,
  room_type_id   uuid        not null references public.room_types (id),
  room_type      text        not null,                       -- name snapshot
  check_in       date        not null,
  check_out      date        not null,
  nights         integer     not null,
  rooms          integer     not null check (rooms between 1 and 10),
  adults         integer     not null check (adults >= 1),
  children       integer     not null default 0 check (children >= 0),
  guest_name     text        not null,
  guest_phone    text        not null,                       -- 10 digits
  guest_email    text,
  notes          text,
  corporate      boolean     not null default false,
  nightly_rate   integer     not null,
  subtotal       integer     not null,
  discount       integer     not null default 0,
  total          integer     not null,
  status         text        not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  payment_method text        not null default 'pay_at_hotel',
  created_at     timestamptz not null default now(),
  cancelled_at   timestamptz,
  cancelled_by   text,
  check (check_out > check_in)
);

create index if not exists bookings_room_dates_idx
  on public.bookings (room_type_id, check_in, check_out) where status = 'confirmed';
create index if not exists bookings_phone_idx on public.bookings (guest_phone);
create index if not exists bookings_created_idx on public.bookings (created_at desc);

alter table public.room_types enable row level security;
alter table public.bookings   enable row level security;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Most rooms of one type in use on any single night of [p_in, p_out).
create or replace function public._peak_usage(p_rt uuid, p_in date, p_out date)
returns integer language sql stable as $$
  select coalesce(max(day_used), 0)::integer
  from (
    select coalesce(sum(b.rooms), 0) as day_used
    from generate_series(p_in, p_out - 1, interval '1 day') g(d)
    left join public.bookings b
      on b.room_type_id = p_rt
     and b.status = 'confirmed'
     and b.check_in <= g.d::date
     and b.check_out > g.d::date
    group by g.d
  ) x
$$;

create or replace function public._booking_json(b public.bookings)
returns jsonb language sql immutable as $$
  select jsonb_build_object(
    'reference', b.reference, 'hotel', b.hotel_slug, 'room_type', b.room_type,
    'check_in', b.check_in, 'check_out', b.check_out, 'nights', b.nights,
    'rooms', b.rooms, 'adults', b.adults, 'children', b.children,
    'guest_name', b.guest_name, 'guest_phone', b.guest_phone, 'guest_email', b.guest_email,
    'notes', b.notes, 'corporate', b.corporate, 'nightly_rate', b.nightly_rate,
    'subtotal', b.subtotal, 'discount', b.discount, 'total', b.total,
    'status', b.status, 'payment_method', b.payment_method,
    'created_at', b.created_at, 'cancelled_at', b.cancelled_at, 'cancelled_by', b.cancelled_by
  )
$$;

create or replace function public._phone_digits(t text)
returns text language sql immutable as $$
  select right(regexp_replace(coalesce(t, ''), '\D', '', 'g'), 10)
$$;

-- ---------------------------------------------------------------------------
-- Availability: p = { hotel, check_in, check_out }
-- ---------------------------------------------------------------------------
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
  where rt.hotel_slug = p->>'hotel' and rt.active
$$;

-- ---------------------------------------------------------------------------
-- Create a booking atomically.
-- p = { hotel, room_type, check_in, check_out, rooms, adults, children,
--       guest_name, guest_phone, guest_email, notes, corporate, discount_pct }
-- The room_types row is locked (FOR UPDATE) so concurrent bookings for the same
-- room type are serialised: the availability check and the insert cannot race.
-- Price is read from room_types here, never from the caller.
-- ---------------------------------------------------------------------------
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

  select * into rt
  from public.room_types
  where hotel_slug = p->>'hotel' and name = p->>'room_type' and active
  for update;

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
-- Guest self-service: p = { reference, phone }
-- ---------------------------------------------------------------------------
create or replace function public.get_booking(p jsonb)
returns jsonb language plpgsql stable as $$
declare b public.bookings;
begin
  select * into b from public.bookings
  where reference = upper(trim(p->>'reference'))
    and guest_phone = public._phone_digits(p->>'phone');
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true, 'booking', public._booking_json(b));
end;
$$;

-- p = { reference, phone?, admin?, today }
-- Guests must match the phone and cannot cancel a stay that has already started.
create or replace function public.cancel_booking(p jsonb)
returns jsonb language plpgsql as $$
declare
  b        public.bookings;
  v_admin  boolean := coalesce((p->>'admin')::boolean, false);
  v_today  date    := coalesce((p->>'today')::date, current_date);
begin
  select * into b from public.bookings
  where reference = upper(trim(p->>'reference'))
    and (v_admin or guest_phone = public._phone_digits(p->>'phone'))
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if b.status = 'cancelled' then
    return jsonb_build_object('ok', true, 'already_cancelled', true, 'booking', public._booking_json(b));
  end if;
  if not v_admin and b.check_in < v_today then
    return jsonb_build_object('ok', false, 'error', 'stay_started');
  end if;

  update public.bookings
     set status = 'cancelled', cancelled_at = now(),
         cancelled_by = case when v_admin then 'admin' else 'guest' end
   where id = b.id
   returning * into b;

  return jsonb_build_object('ok', true, 'booking', public._booking_json(b));
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin (called only after the site verifies the admin session)
-- ---------------------------------------------------------------------------
-- p = { hotel?, status?, from?, to?, q?, limit? }
create or replace function public.admin_list_bookings(p jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(public._booking_json(x) order by x.created_at desc), '[]'::jsonb)
  from (
    select * from public.bookings b
    where (nullif(p->>'hotel', '')  is null or b.hotel_slug = p->>'hotel')
      and (nullif(p->>'status', '') is null or b.status = p->>'status')
      and (nullif(p->>'from', '')   is null or b.check_in >= (p->>'from')::date)
      and (nullif(p->>'to', '')     is null or b.check_in <= (p->>'to')::date)
      and (nullif(p->>'q', '')      is null
           or b.reference ilike '%' || (p->>'q') || '%'
           or b.guest_name ilike '%' || (p->>'q') || '%'
           or (regexp_replace(p->>'q', '\D', '', 'g') <> ''
               and b.guest_phone like '%' || regexp_replace(p->>'q', '\D', '', 'g') || '%'))
    order by b.created_at desc
    limit least(coalesce((p->>'limit')::integer, 200), 500)
  ) x
$$;

create or replace function public.admin_list_room_types(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'hotel', hotel_slug, 'name', name, 'total_rooms', total_rooms,
    'base_rate', base_rate, 'max_guests', max_guests, 'active', active
  ) order by hotel_slug, base_rate, name), '[]'::jsonb)
  from public.room_types
$$;

-- p = { id, total_rooms, base_rate, active }
create or replace function public.admin_update_room_type(p jsonb)
returns jsonb language plpgsql as $$
declare r public.room_types;
begin
  update public.room_types
     set total_rooms = coalesce((p->>'total_rooms')::integer, total_rooms),
         base_rate   = coalesce((p->>'base_rate')::integer, base_rate),
         active      = coalesce((p->>'active')::boolean, active),
         updated_at  = now()
   where id = (p->>'id')::uuid
   returning * into r;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true, 'room_type', jsonb_build_object(
    'id', r.id, 'hotel', r.hotel_slug, 'name', r.name, 'total_rooms', r.total_rooms,
    'base_rate', r.base_rate, 'max_guests', r.max_guests, 'active', r.active));
exception when check_violation or invalid_text_representation then
  return jsonb_build_object('ok', false, 'error', 'invalid');
end;
$$;

-- ---------------------------------------------------------------------------
-- Lock everything down to the service role (Supabase roles may not exist
-- locally, so this is conditional).
-- ---------------------------------------------------------------------------
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('_peak_usage', '_booking_json', '_phone_digits', 'room_availability',
                        'create_booking', 'get_booking', 'cancel_booking',
                        'admin_list_bookings', 'admin_list_room_types', 'admin_update_room_type')
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
    revoke all on public.room_types, public.bookings from anon, authenticated;
  end if;
end $$;
