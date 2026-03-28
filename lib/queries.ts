import { createClient } from "@/lib/supabase/server";
import type { EventRow, EventWithRemaining } from "@/types";

type EventRowWithBookings = EventRow & {
  bookings: { quantity: number }[] | null;
};

function mapEvent(row: EventRowWithBookings): EventWithRemaining {
  const parts = row.bookings ?? [];
  const booked = parts.reduce((sum, b) => sum + b.quantity, 0);
  return {
    ...row,
    booked,
    remaining: Math.max(0, row.seats - booked),
  };
}

export async function getEventsWithRemaining(): Promise<EventWithRemaining[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, bookings(quantity)")
    .order("date", { ascending: true });

  if (error || !data) return [];
  return (data as EventRowWithBookings[]).map(mapEvent);
}

export async function getEventWithRemaining(
  id: string
): Promise<EventWithRemaining | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, bookings(quantity)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapEvent(data as EventRowWithBookings);
}

export async function getEventById(id: string): Promise<EventRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as EventRow;
}

/** True if this user already has at least one booking row for the event. */
export async function hasUserBookingForEvent(
  eventId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) return false;
  return data != null;
}
