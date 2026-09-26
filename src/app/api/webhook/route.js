import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const secret = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req) {
  try {
    const payload = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Only verify if we have a secret configured
    if (secret && signature) {
      const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex");
      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(payload);

    // Handle Paystack successful transaction
    if (event.event === "charge.success") {
      const giftId = event.data?.metadata?.giftId;
      
      if (giftId) {
        console.log(`Payment successful for giftId: ${giftId}. Marking as paid in DB...`);
        const giftRef = doc(db, "gifts", giftId);
        await updateDoc(giftRef, { paid: true });
        console.log("Successfully updated gift!");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
