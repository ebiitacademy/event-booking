import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white">
              EventBook
            </span>
          </div>

          <nav className="flex gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="transition-colors hover:text-indigo-400">
              Home
            </Link>
            <Link href="#events" className="transition-colors hover:text-indigo-400">
              Events
            </Link>
            <Link href="/admin" className="transition-colors hover:text-indigo-400">
              Admin
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-sm text-zinc-400">
            © {new Date().getFullYear()} EventBook. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-zinc-400">
            <a href="#" className="hover:text-indigo-400">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
