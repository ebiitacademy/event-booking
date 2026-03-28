-- Event Booking System — run in Supabase SQL Editor (or migrations)
-- 1) Run this entire file once on a fresh project.

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text,
  date timestamptz not null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  seats integer not null check (seats >= 0),
  created_at timestamptz not null default now()
);

-- Bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  stripe_checkout_session_id text,
  created_at timestamptz not null default now()
);

create index bookings_event_id_idx on public.bookings (event_id);
create index bookings_user_id_idx on public.bookings (user_id);

create unique index bookings_stripe_checkout_session_id_key
  on public.bookings (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- New user → profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic booking with row lock (prevents overbooking under concurrency)
create or replace function public.create_booking(p_event_id uuid, p_quantity integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_booked integer;
  v_seats integer;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_quantity is null or p_quantity < 1 then
    raise exception 'Invalid quantity';
  end if;

  select seats into v_seats
  from public.events
  where id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found';
  end if;

  select coalesce(sum(quantity), 0) into v_booked
  from public.bookings
  where event_id = p_event_id;

  if v_booked + p_quantity > v_seats then
    raise exception 'Not enough seats available';
  end if;

  insert into public.bookings (user_id, event_id, quantity)
  values (v_uid, p_event_id, p_quantity)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_booking(uuid, integer) to authenticated;

-- Paid bookings via Stripe webhook (service_role only; never expose to clients)
create or replace function public.create_booking_for_stripe(
  p_event_id uuid,
  p_user_id uuid,
  p_quantity integer,
  p_stripe_checkout_session_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_booked integer;
  v_seats integer;
begin
  if p_stripe_checkout_session_id is null
     or length(btrim(p_stripe_checkout_session_id)) < 1 then
    raise exception 'Invalid session id';
  end if;

  select b.id into v_id
  from public.bookings b
  where b.stripe_checkout_session_id = p_stripe_checkout_session_id
  limit 1;

  if v_id is not null then
    return v_id;
  end if;

  if p_user_id is null then
    raise exception 'Invalid user';
  end if;
  if p_quantity is null or p_quantity < 1 then
    raise exception 'Invalid quantity';
  end if;

  select e.seats into v_seats
  from public.events e
  where e.id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found';
  end if;

  select coalesce(sum(b2.quantity), 0) into v_booked
  from public.bookings b2
  where b2.event_id = p_event_id;

  if v_booked + p_quantity > v_seats then
    raise exception 'Not enough seats available';
  end if;

  insert into public.bookings (user_id, event_id, quantity, stripe_checkout_session_id)
  values (p_user_id, p_event_id, p_quantity, p_stripe_checkout_session_id)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_booking_for_stripe(uuid, uuid, integer, text) from public;
revoke execute on function public.create_booking_for_stripe(uuid, uuid, integer, text) from anon;
revoke execute on function public.create_booking_for_stripe(uuid, uuid, integer, text) from authenticated;
grant execute on function public.create_booking_for_stripe(uuid, uuid, integer, text) to service_role;

-- RLS
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.bookings enable row level security;

-- Helper: current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Inserts only via handle_new_user trigger (security definer; bypasses RLS)

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Promote a user to admin: update profiles set role = 'admin' where id = '...' as service role or from SQL editor with sufficient privilege.

-- events
create policy "events_select_all"
  on public.events for select
  using (true);

create policy "events_insert_admin"
  on public.events for insert
  with check (public.is_admin());

create policy "events_update_admin"
  on public.events for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "events_delete_admin"
  on public.events for delete
  using (public.is_admin());

-- bookings
create policy "bookings_select_own_or_admin"
  on public.bookings for select
  using (user_id = auth.uid() or public.is_admin());

-- Direct INSERT disabled — use create_booking() only
create policy "bookings_no_direct_insert"
  on public.bookings for insert
  with check (false);

create policy "bookings_delete_admin"
  on public.bookings for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: public event images (upload/delete = admins only)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do update set public = excluded.public;

create policy "event_images_select_public"
  on storage.objects for select
  using (bucket_id = 'event-images');

create policy "event_images_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and (select public.is_admin())
  );

create policy "event_images_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'event-images' and (select public.is_admin()))
  with check (bucket_id = 'event-images' and (select public.is_admin()));

create policy "event_images_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-images' and (select public.is_admin()));
