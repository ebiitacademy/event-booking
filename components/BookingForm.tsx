"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bookEvent } from "@/app/actions/bookings";

type Props = {
  eventId: string;
  maxQuantity: number;
  disabled?: boolean;
  alreadyBooked?: boolean;
  /** When true, user is sent to Stripe Checkout; booking is finalized when they return to /bookings. */
  requiresPayment?: boolean;
};

export function BookingForm({
  eventId,
  maxQuantity,
  disabled,
  alreadyBooked = false,
  requiresPayment = false,
}: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const canBook = !disabled && maxQuantity > 0 && !alreadyBooked;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (alreadyBooked || !canBook) return;
    setMessage(null);
    startTransition(async () => {
      const res = await bookEvent(eventId, quantity);
      if (res.ok && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      if (res.ok) {
        setMessage({ type: "ok", text: res.message ?? "Booked." });
        router.refresh();
      } else {
        setMessage({ type: "err", text: res.error });
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Book seats
      </h2>
      {alreadyBooked && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You already have a booking for this event.{" "}
          <Link
            href="/bookings"
            className="font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            View my bookings
          </Link>
        </p>
      )}
      {!alreadyBooked && !canBook && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This event has no seats available.
        </p>
      )}
      {canBook && (
        <>
          <div>
            <label
              htmlFor="qty"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Quantity
            </label>
            <select
              id="qty"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(
                (n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                )
              )}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              Up to {maxQuantity} seat{maxQuantity === 1 ? "" : "s"} available.
            </p>
          </div>
          {requiresPayment && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              You will pay securely with Stripe, then return here to confirm your
              booking.
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {isPending
              ? requiresPayment
                ? "Redirecting…"
                : "Booking…"
              : requiresPayment
                ? "Pay with card"
                : "Confirm booking"}
          </button>
        </>
      )}
      {alreadyBooked && (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full cursor-not-allowed rounded-xl bg-violet-400/60 px-4 py-2.5 text-sm font-semibold text-white dark:bg-violet-800/50 dark:text-violet-200"
        >
          Confirm booking
        </button>
      )}
      {message?.type === "ok" && (
        <p
          role="status"
          className="text-sm font-medium text-emerald-700 dark:text-emerald-400"
        >
          {message.text}
        </p>
      )}
      {message?.type === "err" && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {message.text}
        </p>
      )}
    </form>
  );
}
