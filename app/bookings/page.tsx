import Link from "next/link";
import { redirect } from "next/navigation";
import { finalizeStripeCheckout } from "@/app/actions/bookings";
import { createClient } from "@/lib/supabase/server";
import { FlashMessage } from "@/components/FlashMessage";
import type { BookingWithEvent, EventRow } from "@/types";

function firstQueryValue(
  v: string | string[] | undefined
): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

type Props = {
  searchParams: { stripe?: string; session_id?: string | string[] };
};

export default async function BookingsPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const checkoutSessionId = firstQueryValue(searchParams.session_id);
  let finalizeError: string | undefined;
  if (checkoutSessionId) {
    const result = await finalizeStripeCheckout(checkoutSessionId);
    if (result.ok) {
      redirect("/bookings?stripe=success");
    } else {
      finalizeError = result.error;
    }
  }

  const { data: rows, error } = await supabase
    .from("bookings")
    .select("id, user_id, event_id, quantity, created_at, events (*)")
    .order("created_at", { ascending: false });

  const list = (rows ?? []) as unknown as BookingWithEvent[];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        My bookings
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Events you have reserved seats for.
      </p>
      {finalizeError && (
        <div className="mt-6">
          <FlashMessage error={finalizeError} />
        </div>
      )}
      {searchParams.stripe === "success" && (
        <div className="mt-6">
          <FlashMessage success="Payment successful — your booking is confirmed." />
        </div>
      )}
      {error && (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
      {!error && list.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          You have no bookings yet.{" "}
          <Link href="/" className="font-medium text-violet-600 dark:text-violet-400">
            Browse events
          </Link>
          .
        </p>
      )}
      {!error && list.length > 0 && (
        <ul className="mt-8 space-y-4">
          {list.map((b) => {
            const ev = b.events as EventRow | null;
            return (
              <li
                key={b.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    {ev ? (
                      <Link
                        href={`/events/${ev.id}`}
                        className="hover:text-violet-600 dark:hover:text-violet-400"
                      >
                        {ev.title}
                      </Link>
                    ) : (
                      "Event removed"
                    )}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {b.quantity} seat{b.quantity === 1 ? "" : "s"} · booked{" "}
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(b.created_at))}
                  </p>
                </div>
                {ev && (
                  <Link
                    href={`/events/${ev.id}`}
                    className="shrink-0 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
                  >
                    View event
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
