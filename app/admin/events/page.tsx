import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEventsWithRemaining } from "@/lib/queries";

export default async function AdminEventsPage() {
  const events = await getEventsWithRemaining();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Events
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Signed in as <span className="font-mono text-sm">{user?.email}</span>
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          New event
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="mt-10 text-zinc-600 dark:text-zinc-400">
          No events yet. Create one to get started.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80">
              <tr>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">
                  Title
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">
                  Date
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">
                  Seats
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">
                  Left
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                    {e.title}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(e.date))}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {e.seats}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {e.remaining}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/events/${e.id}/edit`}
                      className="font-medium text-violet-600 hover:underline dark:text-violet-400"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
