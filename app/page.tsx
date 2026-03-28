import { EventCard } from "@/components/EventCard";
import { getEventsWithRemaining } from "@/lib/queries";

export default async function HomePage() {
  const events = await getEventsWithRemaining();

  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Upcoming events
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Discover experiences, check availability, and book seats in a few
          clicks.
        </p>
      </div>
      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          No events yet. An admin can add events from the admin panel.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
