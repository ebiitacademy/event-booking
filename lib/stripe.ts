import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripe;
}

export function getAppBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set (e.g. https://localhost:3000)"
    );
  }
  return url;
}

/** Expected Checkout total in cents for USD line item (unit_amount * quantity). */
export function expectedCheckoutAmountCents(
  unitPriceUsd: number,
  quantity: number
): number {
  const unitCents = Math.round(Number(unitPriceUsd) * 100);
  return unitCents * quantity;
}
