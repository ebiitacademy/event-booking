import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { FlashMessage } from "@/components/FlashMessage";
import { getSessionUser } from "@/lib/auth";
import { getEventWithRemaining, hasUserBookingForEvent } from "@/lib/queries";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

type Props = {
  params: { id: string };
  searchParams: { stripe?: string };
};

export default async function EventDetailPage({ params, searchParams }: Props) {
  const event = await getEventWithRemaining(params.id);
  if (!event) notFound();

  const user = await getSessionUser();
  const alreadyBooked =
    user != null &&
    (await hasUserBookingForEvent(event.id, user.id));

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/"
        className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
      >
        ← All events
      </Link>
      <header className="mt-6">
        {event.image_url && (
          <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              unoptimized
            />
          </div>
        )}
        <p className="text-sm font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400">
          {formatDate(event.date)}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {event.title}
        </h1>
        <dl className="mt-6 flex flex-wrap gap-8 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-500">Price</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {formatPrice(Number(event.price))}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-500">Capacity</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {event.seats} total
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-500">Remaining</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {event.remaining <= 0 ? (
                <span className="text-red-600 dark:text-red-400">Sold out</span>
              ) : (
                `${event.remaining} seats`
              )}
            </dd>
          </div>
        </dl>
      </header>
      <div className="mt-8">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          {event.description || "No description provided."}
        </p>
      </div>
      <div className="mt-10 space-y-4">
        {searchParams.stripe === "cancel" && (
          <FlashMessage error="Checkout was canceled. You have not been charged." />
        )}
        {user ? (
          <BookingForm
            eventId={event.id}
            maxQuantity={event.remaining}
            disabled={event.remaining <= 0}
            alreadyBooked={alreadyBooked}
            requiresPayment={Number(event.price) > 0}
          />
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <Link
                href={`/login?next=/events/${event.id}`}
                className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                Log in
              </Link>{" "}
              or{" "}
              <Link
                href="/register"
                className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                register
              </Link>{" "}
              to book this event.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
