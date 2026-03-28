import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/bookings", label: "All bookings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
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
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
