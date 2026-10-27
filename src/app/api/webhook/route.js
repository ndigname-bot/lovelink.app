import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const payload = await req.text();
    const paystackSignature = req.headers.get("x-paystack-signature");
    const stripeSignature = req.headers.get("stripe-signature");

    // 1. HANDLE STRIPE WEBHOOK
    if (stripeSignature || payload.includes('"checkout.session.completed"')) {
      if (stripeWebhookSecret && stripeSignature) {
        try {
          const parts = stripeSignature.split(",");
          let timestamp = "";
          let sig = "";
          for (const part of parts) {
            const [k, v] = part.split("=");
            if (k.trim() === "t") timestamp = v;
            if (k.trim() === "v1") sig = v;
          }
          const signedPayload = `${timestamp}.${payload}`;
          const expectedSig = crypto
            .createHmac("sha256", stripeWebhookSecret)
            .update(signedPayload)
            .digest("hex");

          if (expectedSig !== sig) {
            return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
          }
        } catch (sigErr) {
          console.warn("Stripe signature validation warning:", sigErr);
        }
      }

      const event = JSON.parse(payload);
      if (event.type === "checkout.session.completed") {
        const giftId = event.data?.object?.client_reference_id || event.data?.object?.metadata?.giftId;
        if (giftId) {
          console.log(`[STRIPE] Payment confirmed for giftId: ${giftId}. Marking paid...`);
          const giftRef = doc(db, "gifts", giftId);
          await updateDoc(giftRef, { paid: true });
        }
      }

      return NextResponse.json({ received: true, gateway: "stripe" });
    }

    // 2. HANDLE PAYSTACK WEBHOOK
    if (paystackSecret && paystackSignature) {
      const hash = crypto.createHmac("sha512", paystackSecret).update(payload).digest("hex");
      if (hash !== paystackSignature) {
        return NextResponse.json({ error: "Invalid Paystack signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(payload);
    if (event.event === "charge.success") {
      const giftId = event.data?.metadata?.giftId;
      if (giftId) {
        console.log(`[PAYSTACK] Payment confirmed for giftId: ${giftId}. Marking paid...`);
        const giftRef = doc(db, "gifts", giftId);
        await updateDoc(giftRef, { paid: true });
      }
    }

    return NextResponse.json({ received: true, gateway: "paystack" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
