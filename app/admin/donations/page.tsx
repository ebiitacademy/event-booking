import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export default async function AdminDonationsPage() {
  const stripe = getStripe();
  // Fetch recent fully paid checkout sessions specifically tagged as donations
  let donationSessions: Stripe.Checkout.Session[] = [];
  try {
    const sessions = await stripe.checkout.sessions.list({ 
      limit: 100,
    });
    // Normally, filtering via Stripe Search API is optimal. 
    // Here we filter by metadata matching our donation integration in-memory.
    donationSessions = sessions.data.filter((s) => {
      const isPaid = s.payment_status === "paid";
      const isExplicitDonation = s.metadata?.type === "donation";
      // Legacy test donations lacked metadata entirely, while bookings always have 'event_id'
      const isLegacyTestDonation = !s.metadata?.type && !s.metadata?.event_id;

      return isPaid && (isExplicitDonation || isLegacyTestDonation);
    });
  } catch (error) {
    console.error("Failed to fetch Stripe sessions", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Donations
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        All successfully processed Stripe donations from your platform.
      </p>

      <div className="mt-8 overflow-hidden overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {donationSessions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center text-zinc-500 dark:text-zinc-400">
            <svg
              className="mb-4 h-12 w-12 text-zinc-400 dark:text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No donations found.</p>
            <p className="mt-1 text-sm">Once users make a payment via the homepage, it will appear here securely.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-200">Date</th>
                <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-200">Email</th>
                <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-200">User ID</th>
                <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-200">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {donationSessions.map((session) => {
                const date = session.created ? new Date(session.created * 1000).toLocaleString() : "Unknown";
                const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";
                return (
                  <tr key={session.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="whitespace-nowrap px-6 py-4 text-zinc-600 dark:text-zinc-300">
                      {date}
                    </td>
                    <td className="px-6 py-4 text-zinc-900 dark:text-zinc-200 font-medium whitespace-nowrap">
                      {session.customer_details?.email || "Guest/Unknown"}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs max-w-xs truncate">
                      {session.client_reference_id || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                      ${amount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
