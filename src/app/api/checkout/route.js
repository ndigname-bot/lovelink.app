import { NextResponse } from "next/server";
import Stripe from "stripe";

const isInvalidKey = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("mk_");
const stripe = !isInvalidKey ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(req) {
  try {
    const body = await req.json();
    const { giftId, recipientName } = body;

    if (!giftId) {
      return NextResponse.json({ error: "Missing giftId" }, { status: 400 });
    }

    // BYPASS FOR TESTING: If the user provided an invalid or missing Stripe key, skip checkout so they aren't blocked.
    if (isInvalidKey) {
      console.warn("Using Stripe Bypass Mode because of invalid/missing STRIPE_SECRET_KEY.");
      return NextResponse.json({ url: `${req.headers.get("origin")}/success?giftId=${giftId}` });
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `LoveLink Gift for ${recipientName || "your partner"}`,
              description: "A permanent, cinematic digital love letter.",
              images: ["https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=500&q=80"], // Generic romance image
            },
            unit_amount: 1500, // $15.00 in cents
          },
          quantity: 1,
        },
      ],
      // We pass the giftId in the metadata so we know which gift was paid for
      metadata: {
        giftId: giftId,
      },
      // Redirect back to our site after success/cancel
      success_url: `${req.headers.get("origin")}/success?giftId=${giftId}`,
      cancel_url: `${req.headers.get("origin")}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
