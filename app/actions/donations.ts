"use server";

import { getSessionUser } from "@/lib/auth";
import { getStripe, getAppBaseUrl } from "@/lib/stripe";

export async function createDonationCheckout(amountInDollars: number) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { error: "Please log in to make a donation." };
    }

    if (amountInDollars <= 0) {
      return { error: "Invalid donation amount." };
    }

    const stripe = getStripe();
    const appUrl = getAppBaseUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to EventBook",
              description: "Thank you for your generous support!",
            },
            unit_amount: Math.round(amountInDollars * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      client_reference_id: user.id,
      metadata: {
        type: "donation",
      },
      success_url: `${appUrl}/?donation=success`,
      cancel_url: `${appUrl}/?donation=canceled`,
    });

    if (!session.url) {
      return { error: "Failed to create checkout session." };
    }

    return { url: session.url };
  } catch (error) {
    console.error("Donation checkout error:", error);
    return { error: "An unexpected error occurred." };
  }
}
