import { createClient } from "@/lib/supabase/server";
import type { BookingWithEvent, EventRow } from "@/types";

export default async function AdminBookingsPage() {
  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from("bookings")
    .select("id, user_id, event_id, quantity, created_at, events (*)")
    .order("created_at", { ascending: false });

  const list = (rows ?? []) as unknown as BookingWithEvent[];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        All bookings
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Every reservation in the system (admin only).
      </p>
      {error && (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
      {!error && list.length === 0 && (
        <p className="mt-10 text-zinc-600 dark:text-zinc-400">
          No bookings yet.
        </p>
      )}
      {!error && list.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80">
              <tr>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">
                  Event
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">
                  User ID
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">
                  Qty
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">
                  Booked at
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {list.map((b) => {
                const ev = b.events as EventRow | null;
                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                      {ev?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {b.user_id}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {b.quantity}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(b.created_at))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
