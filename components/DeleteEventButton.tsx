"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteEvent } from "@/app/actions/events";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("Delete this event? All bookings for it will be removed.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteEvent(eventId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/events");
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950"
      >
        {isPending ? "Deleting…" : "Delete event"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
