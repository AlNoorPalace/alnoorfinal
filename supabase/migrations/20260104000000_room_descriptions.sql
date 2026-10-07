-- Room descriptions: shown on each room's own page on the website.
-- Safe to run more than once. Run it after 20260103000000_photos.sql.

alter table public.room_types add column if not exists description text not null default '';

do $$ begin
  alter table public.room_types add constraint room_types_description_max check (char_length(description) <= 600);
exception when duplicate_object then null; end $$;

create or replace function public.public_hotels(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', h.slug, 'name', h.name, 'city', h.city, 'state', h.state,
    'tagline', h.tagline, 'description', h.description, 'phone', h.phone,
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

create or replace function public._room_type_json(r public.room_types)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', r.id, 'hotel', r.hotel_slug, 'name', r.name, 'total_rooms', r.total_rooms,
    'base_rate', r.base_rate, 'max_guests', r.max_guests, 'beds', r.beds, 'baths', r.baths,
    'active', r.active, 'images', to_jsonb(r.images), 'description', r.description,
    'bookings', (select count(*) from public.bookings b where b.room_type_id = r.id)
  )
$$;

create or replace function public.admin_save_room_type(p jsonb)
returns jsonb language plpgsql as $$
declare r public.room_types;
begin
  if nullif(p->>'id', '') is null then
    insert into public.room_types (hotel_slug, name, total_rooms, base_rate, max_guests, beds, baths, active, images, description)
    values (
      p->>'hotel', p->>'name',
      coalesce((p->>'total_rooms')::integer, 1), (p->>'base_rate')::integer,
      coalesce((p->>'max_guests')::integer, 2), coalesce((p->>'beds')::integer, 1),
      coalesce((p->>'baths')::integer, 1), coalesce((p->>'active')::boolean, true),
      coalesce(array(select jsonb_array_elements_text(p->'images')), '{}'),
      coalesce(p->>'description', '')
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
      description = coalesce(p->>'description', description),
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
