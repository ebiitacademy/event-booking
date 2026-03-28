"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEventById } from "@/lib/queries";
import {
  expectedCheckoutAmountCents,
  getAppBaseUrl,
  getStripe,
} from "@/lib/stripe";
import type { BookEventResult } from "@/types";
import type Stripe from "stripe";

export type FinalizeStripeResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * After Stripe redirects back with ?session_id=…, verify the Checkout Session
 * server-side and create the booking (no webhooks).
 */
export async function finalizeStripeCheckout(
  checkoutSessionId: string
): Promise<FinalizeStripeResult> {
  const trimmed = checkoutSessionId.trim();
  if (!trimmed.startsWith("cs_")) {
    return { ok: false, error: "Invalid checkout reference." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sign in to finish confirming your booking.",
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { ok: false, error: "Payments are not configured." };
  }

  const stripe = getStripe();
  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(trimmed);
  } catch {
    return { ok: false, error: "Could not verify this checkout session." };
  }

  if (session.mode !== "payment" || session.payment_status !== "paid") {
    return {
      ok: false,
      error: "This checkout is not completed or was not paid.",
    };
  }

  const eventId = session.metadata?.event_id;
  const metaUserId = session.metadata?.user_id;
  const qtyRaw = session.metadata?.quantity;

  if (!eventId || !metaUserId || qtyRaw == null) {
    return { ok: false, error: "Checkout data is incomplete." };
  }

  if (metaUserId !== user.id) {
    return {
      ok: false,
      error: "This payment belongs to a different account.",
    };
  }

  const quantity = Number.parseInt(String(qtyRaw), 10);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, error: "Invalid quantity in checkout." };
  }

  const admin = createAdminClient();
  const { data: ev, error: evErr } = await admin
    .from("events")
    .select("id, price")
    .eq("id", eventId)
    .maybeSingle();

  if (evErr || !ev) {
    return { ok: false, error: "Event not found." };
  }

  const expected = expectedCheckoutAmountCents(Number(ev.price), quantity);
  if (session.amount_total == null || session.amount_total !== expected) {
    return {
      ok: false,
      error: "Payment amount does not match the event price.",
    };
  }

  const { error: rpcErr } = await admin.rpc("create_booking_for_stripe", {
    p_event_id: eventId,
    p_user_id: user.id,
    p_quantity: quantity,
    p_stripe_checkout_session_id: trimmed,
  });

  if (rpcErr) {
    const msg =
      rpcErr.message.includes("Not enough seats") ||
      rpcErr.message.includes("seats available")
        ? "Not enough seats available. Contact support if you were charged."
        : rpcErr.message;
    return { ok: false, error: msg };
  }

  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/bookings");
  revalidatePath("/admin/bookings");
  return { ok: true };
}

export async function bookEvent(
  eventId: string,
  quantity: number
): Promise<BookEventResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be signed in to book." };

  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, error: "Choose a valid quantity." };
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      ok: false,
      error: "You already have a booking for this event.",
    };
  }

  const event = await getEventById(eventId);
  if (!event) return { ok: false, error: "Event not found." };

  const priceUsd = Number(event.price);

  if (priceUsd <= 0) {
    const { error } = await supabase.rpc("create_booking", {
      p_event_id: eventId,
      p_quantity: quantity,
    });

    if (error) {
      const msg =
        error.message.includes("Not enough seats") ||
        error.message.includes("seats available")
          ? "Not enough seats available for this booking."
          : error.message;
      return { ok: false, error: msg };
    }

    revalidatePath("/");
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/bookings");
    revalidatePath("/admin/bookings");
    return { ok: true, message: "Your booking is confirmed." };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      ok: false,
      error: "Card payments are not configured (missing STRIPE_SECRET_KEY).",
    };
  }

  let appUrl: string;
  try {
    appUrl = getAppBaseUrl();
  } catch {
    return {
      ok: false,
      error:
        "Checkout cannot start: set NEXT_PUBLIC_APP_URL (e.g. https://localhost:3000).",
    };
  }

  const unitCents = Math.round(priceUsd * 100);
  if (unitCents < 1) {
    return { ok: false, error: "This event price is too low for card checkout." };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: unitCents,
          product_data: {
            name: event.title,
            description: event.description
              ? event.description.slice(0, 450)
              : undefined,
          },
        },
      },
    ],
    metadata: {
      event_id: eventId,
      user_id: user.id,
      quantity: String(quantity),
    },
    success_url: `${appUrl}/bookings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/events/${eventId}?stripe=cancel`,
  });

  if (!session.url) {
    return { ok: false, error: "Could not start payment checkout." };
  }

  return { ok: true, checkoutUrl: session.url };
}
