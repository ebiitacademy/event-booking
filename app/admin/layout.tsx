import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, getSessionUser } from "@/lib/auth";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/bookings", label: "All bookings" },
  { href: "/admin/donations", label: "Donations" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin-login");
  }

  const gate = await requireAdmin();
  if (!gate.ok) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row px-8 py-8">
      <aside className="shrink-0 lg:w-52">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          Admin
        </p>
        <nav className="mt-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {l.label}
            </Link>
          ))}
          
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <AdminLogoutButton />
          </div>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
