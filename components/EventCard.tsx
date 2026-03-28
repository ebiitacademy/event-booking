import Link from "next/link";
import { EventImage } from "@/components/EventImage";
import type { EventWithRemaining } from "@/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function EventCard({ event }: { event: EventWithRemaining }) {
  const soldOut = event.remaining <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      {event.image_url ? (
        <Link href={`/events/${event.id}`} className="block shrink-0">
          <EventImage
            src={event.image_url}
            alt={event.title}
            aspectClassName="aspect-[16/10]"
          />
        </Link>
      ) : (
        <Link
          href={`/events/${event.id}`}
          className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-violet-100 to-zinc-100 dark:from-violet-950/50 dark:to-zinc-900"
        >
          <span className="text-sm font-medium text-violet-700/70 dark:text-violet-300/60">
            No image
          </span>
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <time
          dateTime={event.date}
          className="text-xs font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400"
        >
          {formatDate(event.date)}
        </time>
        <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
          <Link
            href={`/events/${event.id}`}
            className="hover:text-violet-600 dark:hover:text-violet-400"
          >
            {event.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
          {event.description || "No description."}
        </p>
        <dl className="mt-4 flex flex-wrap gap-4 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-500">Price</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatPrice(Number(event.price))}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-500">Seats left</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              {soldOut ? (
                <span className="text-red-600 dark:text-red-400">Sold out</span>
              ) : (
                `${event.remaining} / ${event.seats}`
              )}
            </dd>
          </div>
        </dl>
        <Link
          href={`/events/${event.id}`}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition group-hover:bg-violet-600 dark:bg-white dark:text-zinc-900 dark:group-hover:bg-violet-400 dark:group-hover:text-zinc-900"
        >
          View & book
        </Link>
      </div>
    </article>
  );
}
