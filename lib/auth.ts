import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getSessionUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, created_at")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false as const, profile: null };
  }
  return { ok: true as const, profile };
}
