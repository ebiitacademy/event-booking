export type Profile = {
  id: string;
  role: "admin" | "user";
  created_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  date: string;
  price: number;
  seats: number;
  created_at: string;
};

export type BookingRow = {
  id: string;
  user_id: string;
  event_id: string;
  quantity: number;
  stripe_checkout_session_id: string | null;
  created_at: string;
};

export type EventWithRemaining = EventRow & {
  booked: number;
  remaining: number;
};

export type BookingWithEvent = BookingRow & {
  events: EventRow | null;
};

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export type BookEventResult =
  | { ok: true; message?: string; checkoutUrl?: string }
  | { ok: false; error: string };
