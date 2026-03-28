# Event Booking System

Next.js 14 (App Router) + Supabase (Auth, Postgres, RLS) + Tailwind CSS + TypeScript.

## Run locally

1. **Install dependencies**

   ```bash
   cd event-booking
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL (Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key (Settings → API)
   - `NEXT_PUBLIC_APP_URL` — Site base URL with no trailing slash (e.g. `http://localhost:3000`); required for Stripe redirects
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server only); used when confirming paid Stripe checkouts
   - `STRIPE_SECRET_KEY` — see **Stripe payments** below

3. **Supabase database**

   In the Supabase dashboard: **SQL Editor** → New query → paste the contents of `supabase/schema.sql` → Run.

   This creates:

   - Tables: `profiles`, `events` (with optional `image_url`), `bookings` (optional `stripe_checkout_session_id` for paid bookings)
   - Trigger on `auth.users` to insert a `profiles` row with `role = 'user'`
   - Functions `create_booking(uuid, int)` (free events) and `create_booking_for_stripe(...)` (paid; **service_role** only)
   - Row Level Security policies
   - Storage bucket `event-images` (public read, admin upload/delete)

   If your project was created before storage was added to `schema.sql`, run `supabase/migrations/storage_event_images.sql` in the SQL Editor.

   For **Stripe**, if `bookings` has no `stripe_checkout_session_id` / `create_booking_for_stripe` yet, run `supabase/migrations/add_stripe_checkout.sql` once.

4. **Create an admin user**

   After you register once in the app (or create a user under Authentication → Users), copy that user’s UUID, then in SQL Editor run:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = 'PASTE_USER_UUID_HERE';
   ```

   Use the **service role** only in trusted environments; in the dashboard SQL Editor you already act with sufficient privileges.

5. **Auth settings (optional)**

   Under Authentication → Providers, keep Email enabled. If **Confirm email** is on, users must verify before signing in; the register screen explains that.

6. **Existing database?** If you created `events` before `image_url` existed, run `supabase/migrations/add_events_image_url.sql` once in the SQL Editor.

7. **Event images** — Admins upload cover images in the event form; files go to the **`event-images`** bucket and the public URL is stored in `events.image_url`. Ensure the storage SQL above has been applied so uploads succeed.

8. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project layout

| Path | Purpose |
|------|---------|
| `app/` | Routes: home, events, bookings, auth, admin |
| `app/actions/` | Server actions (events CRUD, booking + Stripe finalize) |
| `components/` | Navbar, cards, forms, flash messages |
| `lib/supabase/` | Browser + server Supabase clients, middleware helper |
| `lib/auth.ts` | Session + profile helpers |
| `lib/queries.ts` | Event reads with remaining seats |
| `lib/stripe.ts` | Stripe client + checkout amount helpers |
| `lib/supabase/admin.ts` | Service-role Supabase client (server-only) |
| `types/` | Shared TypeScript types |
| `supabase/schema.sql` | Tables, RLS, triggers, `create_booking` |
| `middleware.ts` | Refreshes session; requires auth for `/bookings` |

## Stripe payments

- **Free events** (`price` = 0): booking stays instant via `create_booking` (no Stripe).
- **Paid events** (`price` greater than 0): **Stripe Checkout** opens in a new flow; after payment, Stripe redirects to `/bookings?session_id={CHECKOUT_SESSION_ID}`. The app **verifies the session with the Stripe API** on the server (metadata, paid status, amount vs event price × quantity), then calls `create_booking_for_stripe` using the **service role** key. **No Stripe webhooks** are required.

**Local testing**

1. Use test card `4242 4242 4242 4242` with any future expiry and any CVC.
2. You only need `STRIPE_SECRET_KEY` in `.env.local` (no `STRIPE_WEBHOOK_SECRET`).

**Production**

- Set `NEXT_PUBLIC_APP_URL` to your public origin (e.g. `https://your-domain.com`).
- **Limitation (no webhooks):** the user must open the success redirect so the server can finalize the booking. If they close the browser before that page loads, you would need either webhooks or a manual reconciliation flow.

## Security notes

- **RLS** enforces who can read/write `events`, `bookings`, and `profiles`.
- **Bookings** are inserted through `create_booking` (free) or `finalizeStripeCheckout` + `create_booking_for_stripe` (paid); direct client inserts remain blocked by RLS.
- **`/admin`** is gated in `app/admin/layout.tsx` (profile `role = 'admin'`).
- **`/bookings`** is gated in middleware (must be signed in).
- **`SUPABASE_SERVICE_ROLE_KEY`** is only used on the server; never commit it or expose it to the client.

## Production

- Set the same public env vars on your host (e.g. Vercel).
- Never expose the service role key in the browser or in `NEXT_PUBLIC_*` variables.
