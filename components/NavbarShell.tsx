"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";

type Props = {
  isLoggedIn: boolean;
  isAdmin: boolean;
};

const linkBase =
  "rounded-lg px-3 py-2.5 text-sm font-medium transition sm:py-2";

function navLinkClass(activeTone = false) {
  if (activeTone) {
    return `${linkBase} text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/50`;
  }
  return `${linkBase} text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white`;
}

export function NavbarShell({ isLoggedIn, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="relative z-50 mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white"
          onClick={close}
        >
          EventBook
        </Link>

        {/* Desktop */}
        <nav
          className="hidden items-center gap-1 md:flex md:gap-2"
          aria-label="Main"
        >
          <Link href="/" className={navLinkClass()}>
            Events
          </Link>
          {isLoggedIn && (
            <Link href="/bookings" className={navLinkClass()}>
              My bookings
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className={navLinkClass(true)}>
              Admin
            </Link>
          )}
          {isLoggedIn ? (
            <LogoutButton />
          ) : (
            <>
              <Link href="/login" className={navLinkClass()}>
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100 md:hidden dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-zinc-900/40 md:hidden"
            onClick={close}
          />
          <div
            id={panelId}
            className="relative z-50 max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto border-t border-zinc-200 bg-white px-4 py-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 md:hidden"
          >
            <nav
              className="flex flex-col gap-1"
              aria-label="Mobile main"
            >
              <Link
                href="/"
                className={`${navLinkClass()} block w-full`}
                onClick={close}
              >
                Events
              </Link>
              {isLoggedIn && (
                <Link
                  href="/bookings"
                  className={`${navLinkClass()} block w-full`}
                  onClick={close}
                >
                  My bookings
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`${navLinkClass(true)} block w-full`}
                  onClick={close}
                >
                  Admin
                </Link>
              )}
              {isLoggedIn ? (
                <div className="pt-1">
                  <LogoutButton className="w-full justify-center text-center" />
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`${navLinkClass()} block w-full`}
                    onClick={close}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="mt-1 block w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    onClick={close}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
