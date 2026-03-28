-- Stripe Checkout: store session id on paid bookings; RPC for webhook (service_role only).

alter table public.bookings
  add column if not exists stripe_checkout_session_id text;

create unique index if not exists bookings_stripe_checkout_session_id_key
  on public.bookings (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

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
