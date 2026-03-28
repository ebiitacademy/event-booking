import type { SupabaseClient } from "@supabase/supabase-js";

export const EVENT_IMAGES_BUCKET = "event-images";

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isAllowedImageType(type: string): type is keyof typeof MIME_TO_EXT {
  return type in MIME_TO_EXT;
}

export async function uploadEventImage(
  supabase: SupabaseClient,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_BYTES) {
    return { error: "Image must be 5MB or smaller." };
  }
  if (!isAllowedImageType(file.type)) {
    return { error: "Use a JPEG, PNG, WebP, or GIF image." };
  }

  const ext = MIME_TO_EXT[file.type];
  const path = `${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(EVENT_IMAGES_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage
    .from(EVENT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl };
}

/** Extract object path within our bucket from a public object URL, or null. */
export function publicUrlToEventImagePath(
  publicUrl: string | null | undefined
): string | null {
  if (!publicUrl) return null;
  const marker = `/object/public/${EVENT_IMAGES_BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  try {
    return decodeURIComponent(publicUrl.slice(i + marker.length));
  } catch {
    return null;
  }
}

export async function removeEventImageIfStored(
  supabase: SupabaseClient,
  publicUrl: string | null | undefined
): Promise<void> {
  const path = publicUrlToEventImagePath(publicUrl);
  if (!path) return;
  await supabase.storage.from(EVENT_IMAGES_BUCKET).remove([path]);
}
