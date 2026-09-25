import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } else {
      // For local testing without a webhook secret
      event = JSON.parse(payload);
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // Get the giftId from the metadata we passed in checkout route
    const giftId = session.metadata.giftId;
    
    if (giftId) {
      try {
        console.log(`Payment successful for giftId: ${giftId}. Marking as paid in DB...`);
        const giftRef = doc(db, "gifts", giftId);
        await updateDoc(giftRef, { paid: true });
        console.log("Successfully updated gift!");
      } catch (dbErr) {
        console.error("Error updating Firestore:", dbErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
