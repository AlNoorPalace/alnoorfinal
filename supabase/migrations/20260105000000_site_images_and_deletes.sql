-- Website pictures you can change in the admin, a photo library, and deleting bookings.
-- Safe to run more than once. Run it after 20260104000000_room_descriptions.sql.

-- ---------------------------------------------------------------------------
-- Website pictures (home page banner, About section, etc.): one row per picture slot.
-- A slot without a row uses the picture bundled with the site.
-- ---------------------------------------------------------------------------
create table if not exists public.site_images (
  slot       text primary key check (slot ~ '^[a-z][a-z0-9_]{1,39}$'),
  url        text not null,
  updated_at timestamptz not null default now()
);
alter table public.site_images enable row level security;

create or replace function public.site_images(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_object_agg(slot, url), '{}'::jsonb) from public.site_images
$$;

-- p = { slot, url }. An empty url puts the bundled picture back. Returns the previous url.
create or replace function public.admin_set_site_image(p jsonb)
returns jsonb language plpgsql as $$
declare v_prev text;
begin
  select url into v_prev from public.site_images where slot = p->>'slot';
  if nullif(p->>'url', '') is null then
    delete from public.site_images where slot = p->>'slot';
  else
    insert into public.site_images (slot, url) values (p->>'slot', p->>'url')
    on conflict (slot) do update set url = excluded.url, updated_at = now();
  end if;
  return jsonb_build_object('ok', true, 'previous', v_prev);
exception when check_violation then
  return jsonb_build_object('ok', false, 'error', 'invalid');
end;
$$;

create or replace function public.admin_list_site_images(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select public.site_images('{}'::jsonb)
$$;

-- Every picture URL in use, and where (for the photo library).
create or replace function public.admin_image_usage(p jsonb default '{}'::jsonb)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object('url', u.url, 'used_by', u.used_by)), '[]'::jsonb)
  from (
    select url, array_agg(label order by label) as used_by
    from (
      select h.image as url, h.name || ' (cover)' as label from public.hotels h
      union all
      select g.url, h.name || ' (gallery)' from public.hotels h, unnest(h.images) as g(url)
      union all
      select g.url, h.name || ' / ' || r.name || ' (room)'
        from public.room_types r join public.hotels h on h.slug = r.hotel_slug, unnest(r.images) as g(url)
      union all
      select s.url, 'Website picture: ' || s.slot from public.site_images s
    ) x
    group by url
  ) u
$$;

create or replace function public.admin_image_in_use(p jsonb)
returns jsonb language sql stable as $$
  select to_jsonb(
    exists (select 1 from public.hotels h where h.image = p->>'url' or (p->>'url') = any(h.images))
    or exists (select 1 from public.room_types r where (p->>'url') = any(r.images))
    or exists (select 1 from public.site_images s where s.url = p->>'url')
  )
$$;

-- ---------------------------------------------------------------------------
-- Deleting bookings, and deleting hotels/rooms together with their bookings.
-- ---------------------------------------------------------------------------
create or replace function public.admin_delete_booking(p jsonb)
returns jsonb language plpgsql as $$
begin
  delete from public.bookings where reference = upper(trim(p->>'reference'));
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- p = { slug, force? }. Without force a hotel that has bookings is refused.
-- With force=true its bookings are deleted permanently first.
create or replace function public.admin_delete_hotel(p jsonb)
returns jsonb language plpgsql as $$
declare v_n integer; v_force boolean := coalesce((p->>'force')::boolean, false);
begin
  select count(*) into v_n from public.bookings where hotel_slug = p->>'slug';
  if v_n > 0 and not v_force then
    return jsonb_build_object('ok', false, 'error', 'has_bookings', 'bookings', v_n);
  end if;
  delete from public.bookings where hotel_slug = p->>'slug';
  delete from public.room_types where hotel_slug = p->>'slug';   -- closures cascade
  delete from public.hotels where slug = p->>'slug';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true, 'deleted_bookings', v_n);
end;
$$;

create or replace function public.admin_delete_room_type(p jsonb)
returns jsonb language plpgsql as $$
declare v_n integer; v_force boolean := coalesce((p->>'force')::boolean, false);
begin
  select count(*) into v_n from public.bookings where room_type_id = (p->>'id')::uuid;
  if v_n > 0 and not v_force then
    return jsonb_build_object('ok', false, 'error', 'has_bookings', 'bookings', v_n);
  end if;
  delete from public.bookings where room_type_id = (p->>'id')::uuid;
  delete from public.room_types where id = (p->>'id')::uuid;   -- closures cascade
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true, 'deleted_bookings', v_n);
end;
$$;

-- Same lock-down as every other function.
do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('site_images', 'admin_set_site_image', 'admin_list_site_images', 'admin_image_usage',
                        'admin_image_in_use', 'admin_delete_booking', 'admin_delete_hotel', 'admin_delete_room_type')
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
    revoke all on public.site_images from anon, authenticated;
  end if;
end $$;
