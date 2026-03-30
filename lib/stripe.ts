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
  let url = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  
  if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    url = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }

  if (!url) {
    url = "http://localhost:3000";
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
