import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Admin dashboard
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage events and review every booking.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            href="/admin/events"
            className="block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-violet-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Events
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Create, edit, or remove events.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/bookings"
            className="block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-violet-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Bookings
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              See all reservations across events.
            </p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
