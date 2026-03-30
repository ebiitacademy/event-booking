import { EventCard } from "@/components/EventCard";
import { getEventsWithRemaining } from "@/lib/queries";

export const metadata = {
  title: "All Events | EventBook",
  description: "Browse all upcoming events properly structured without limit.",
};

export default async function AllEventsPage() {
  const events = await getEventsWithRemaining();

  return (
    <div className="mx-auto max-w-6xl py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          All Upcoming Events
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Browse our full directory of experiences, check availability, and secure your spot today.
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
