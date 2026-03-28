import Link from "next/link";
import { EventForm } from "@/components/EventForm";
import { FlashMessage } from "@/components/FlashMessage";
import { createEventAndRedirect } from "@/app/actions/events";

type Props = {
  searchParams: { error?: string };
};

export default function AdminNewEventPage({ searchParams }: Props) {
  return (
    <div>
      <Link
        href="/admin/events"
        className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
      >
        ← Events
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        New event
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Add a title, schedule, price, and capacity.
      </p>
      <div className="mt-6">
        <FlashMessage error={searchParams.error} />
      </div>
      <div className="mt-8">
        <EventForm action={createEventAndRedirect} submitLabel="Create event" />
      </div>
    </div>
  );
}
