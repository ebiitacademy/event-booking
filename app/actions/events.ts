"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import {
  removeEventImageIfStored,
  uploadEventImage,
} from "@/lib/event-image-storage";
import type { ActionResult } from "@/types";

function parseEventFields(
  formData: FormData
):
  | { error: string }
  | {
      values: {
        title: string;
        description: string;
        date: string;
        price: number;
        seats: number;
      };
    } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const seatsRaw = String(formData.get("seats") ?? "").trim();

  const price = Number(priceRaw);
  const seats = Number.parseInt(seatsRaw, 10);

  if (!title) return { error: "Title is required" };
  if (!dateRaw) return { error: "Date is required" };
  if (!Number.isFinite(price) || price < 0)
    return { error: "Valid price is required" };
  if (!Number.isInteger(seats) || seats < 0)
    return { error: "Valid seats count is required" };

  return {
    values: {
      title,
      description,
      date: new Date(dateRaw).toISOString(),
      price,
      seats,
    },
  };
}

function getImageFile(formData: FormData): File | null {
  const raw = formData.get("image");
  if (raw instanceof File && raw.size > 0) return raw;
  return null;
}

function isClearImage(formData: FormData): boolean {
  return formData.get("clear_image") === "on";
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: "Unauthorized" };

  const parsed = parseEventFields(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const supabase = createClient();
  let image_url: string | null = null;

  const file = getImageFile(formData);
  if (file) {
    const up = await uploadEventImage(supabase, file);
    if ("error" in up) return { ok: false, error: up.error };
    image_url = up.url;
  }

  const { error } = await supabase
    .from("events")
    .insert({ ...parsed.values, image_url });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  return { ok: true, message: "Event created" };
}

export async function updateEvent(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: "Unauthorized" };

  const parsed = parseEventFields(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const supabase = createClient();

  const { data: current, error: fetchErr } = await supabase
    .from("events")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !current) {
    return { ok: false, error: fetchErr?.message ?? "Event not found" };
  }

  const clear = isClearImage(formData);
  const file = getImageFile(formData);

  const payload: Record<string, unknown> = { ...parsed.values };

  if (file) {
    const up = await uploadEventImage(supabase, file);
    if ("error" in up) return { ok: false, error: up.error };
    await removeEventImageIfStored(supabase, current.image_url);
    payload.image_url = up.url;
  } else if (clear) {
    payload.image_url = null;
    await removeEventImageIfStored(supabase, current.image_url);
  }

  const { error } = await supabase.from("events").update(payload).eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/admin/events");
  return { ok: true, message: "Event updated" };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: "Unauthorized" };

  const supabase = createClient();

  const { data: row } = await supabase
    .from("events")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (row?.image_url) {
    await removeEventImageIfStored(supabase, row.image_url);
  }

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/events");
  revalidatePath("/admin/bookings");
  return { ok: true, message: "Event deleted" };
}

export async function createEventAndRedirect(formData: FormData) {
  const res = await createEvent(formData);
  if (!res.ok) {
    redirect(
      `/admin/events/new?error=${encodeURIComponent(res.error)}`
    );
  }
  redirect("/admin/events");
}

export async function updateEventAndRedirect(
  id: string,
  formData: FormData
) {
  const res = await updateEvent(id, formData);
  if (!res.ok) {
    redirect(
      `/admin/events/${id}/edit?error=${encodeURIComponent(res.error)}`
    );
  }
  redirect(`/admin/events/${id}/edit?ok=1`);
}
