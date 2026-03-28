"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import type { EventRow } from "@/types";

function SubmitLabel({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return <>{pending ? "Saving…" : idle}</>;
}

type Props = {
  action: (formData: FormData) => Promise<void>;
  event?: EventRow;
  submitLabel: string;
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function EventForm({ action, event, submitLabel }: Props) {
  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="mx-auto max-w-lg space-y-5"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={event?.title ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={event?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Cover image
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-1 block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-violet-900 hover:file:bg-violet-200 dark:text-zinc-400 dark:file:bg-violet-950 dark:file:text-violet-100 dark:hover:file:bg-violet-900"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          JPEG, PNG, WebP, or GIF. Max 5MB. Stored in Supabase Storage; the public
          URL is saved on the event.
        </p>
        {event?.image_url && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
              Current image
            </p>
            <div className="relative aspect-[16/10] w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 448px) 100vw, 448px"
                unoptimized
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                name="clear_image"
                id="clear_image"
                className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600"
              />
              Remove current image
            </label>
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Date & time
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          defaultValue={event ? toDatetimeLocal(event.date) : ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Price (USD)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={event?.price ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label
            htmlFor="seats"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Total seats
          </label>
          <input
            id="seats"
            name="seats"
            type="number"
            min={0}
            required
            defaultValue={event?.seats ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
      >
        <SubmitLabel idle={submitLabel} />
      </button>
    </form>
  );
}
