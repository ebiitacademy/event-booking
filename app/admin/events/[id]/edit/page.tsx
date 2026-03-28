import Link from "next/link";
import { notFound } from "next/navigation";
import { updateEventAndRedirect } from "@/app/actions/events";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { EventForm } from "@/components/EventForm";
import { FlashMessage } from "@/components/FlashMessage";
import { getEventById } from "@/lib/queries";

type Props = {
  params: { id: string };
  searchParams: { error?: string; ok?: string };
};

export default async function AdminEditEventPage({ params, searchParams }: Props) {
  const event = await getEventById(params.id);
  if (!event) notFound();

  const boundUpdate = updateEventAndRedirect.bind(null, event.id);

  return (
    <div>
      <Link
        href="/admin/events"
        className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
      >
        ← Events
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Edit event
      </h1>
      <div className="mt-6 space-y-4">
        <FlashMessage
          success={searchParams.ok ? "Event saved successfully." : null}
          error={searchParams.error}
        />
      </div>
      <div className="mt-8">
        <EventForm
          event={event}
          action={boundUpdate}
          submitLabel="Save changes"
        />
      </div>
      <div className="mx-auto mt-12 max-w-lg border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Deleting removes the event and related bookings.
        </p>
        <div className="mt-4">
          <DeleteEventButton eventId={event.id} />
        </div>
      </div>
    </div>
  );
}
