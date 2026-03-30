"use client";

import { useState } from "react";
import { createDonationCheckout } from "@/app/actions/donations";
import { useRouter } from "next/navigation";

const PRESET_AMOUNTS = [100, 500, 1000];

export function DonationSection() {
  const [amount, setAmount] = useState<number | "custom">(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDonate = async () => {
    setError(null);
    setIsLoading(true);

    const finalAmount = amount === "custom" ? parseFloat(customAmount) : amount;

    if (isNaN(finalAmount) || finalAmount <= 0) {
      setError("Please enter a valid amount.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createDonationCheckout(finalAmount);
      if (result.error) {
        if (result.error.toLowerCase().includes("log in")) {
          router.push("/login");
        } else {
          setError(result.error);
        }
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Support Our Platform
        </h2>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Your donations help us keep the servers running and continue building new features for our platform.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-lg space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset);
                setError(null);
              }}
              className={`rounded-xl border px-4 py-3 text-lg font-semibold transition ${
                amount === preset
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              ${preset}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setAmount("custom");
              setError(null);
            }}
            className={`rounded-xl border px-4 py-3 text-lg font-semibold transition ${
              amount === "custom"
                ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            }`}
          >
            Custom
          </button>
        </div>

        {amount === "custom" && (
          <div className="relative animate-in fade-in slide-in-from-top-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 dark:text-zinc-400">
              $
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter custom amount"
              className="block w-full rounded-xl border border-zinc-300 bg-white py-3 pl-8 pr-4 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}

        {error && <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={handleDonate}
          disabled={isLoading}
          className="flex w-full items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {isLoading && (
            <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{isLoading ? "Processing..." : `Donate ${amount === "custom" ? (customAmount ? `$${customAmount}` : "") : `$${amount}`}`}</span>
        </button>
      </div>
    </section>
  );
}
