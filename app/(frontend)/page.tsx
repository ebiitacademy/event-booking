import { EventCard } from "@/components/EventCard";
import { getEventsWithRemaining } from "@/lib/queries";
import Link from "next/link";
import { DonationSection } from "@/components/DonationSection";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { donation?: string };
}) {
  const events = await getEventsWithRemaining(6);

  return (
    <div>
      {/* 🔥 HERO BANNER */}
      <section className="relative w-screen -ml-[50vw] left-1/2 right-1/2 -mt-8 mb-12 overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-20 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl flex flex-col items-center relative z-10">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none sm:text-5xl lg:text-6xl">
            Discover Amazing Events 🎉
          </h1>
          <p className="mb-8 text-lg font-normal text-indigo-100 sm:px-16 lg:px-48 lg:text-xl">
            Book tickets for the best experiences around you — fast, easy, and secure.
          </p>

          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <a
              href="#events"
              className="inline-flex justify-center items-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow hover:bg-indigo-50"
            >
              Browse Events
            </a>

          </div>
        </div>

        {/* Optional decorative blur */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/20 blur-3xl lg:h-96 lg:w-96 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-white/20 blur-3xl lg:h-96 lg:w-96 pointer-events-none"></div>
      </section>

      {searchParams.donation === "success" && (
        <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          <p className="text-center font-medium">🎉 Thank you so much for your generous donation!</p>
        </div>
      )}

      {/* 🔽 EXISTING CONTENT */}
      <div id="events" className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Upcoming events
        </h2>
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
        <div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>

          <div className="mt-10 flex justify-center">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              View all events
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-20 mb-8">
        <DonationSection />
      </div>
    </div>
  );
}