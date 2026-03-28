import { getProfile, getSessionUser } from "@/lib/auth";
import { NavbarShell } from "@/components/NavbarShell";

export async function Navbar() {
  const user = await getSessionUser();
  const profile = user ? await getProfile() : null;

  return (
    <NavbarShell
      isLoggedIn={!!user}
      isAdmin={profile?.role === "admin"}
    />
  );
}
