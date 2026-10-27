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

    // FAIL-CLOSED SECURITY: Reject any webhook without an authentic provider signature
    if (!stripeSignature && !paystackSignature) {
      console.warn("[SECURITY ALERT] Webhook called without signature headers. Blocked forgery attempt.");
      return NextResponse.json({ error: "Missing authentic signature header" }, { status: 401 });
    }

    // 1. HANDLE STRIPE WEBHOOK (Cryptographically Verified Only)
    if (stripeSignature) {
      if (!stripeWebhookSecret) {
        console.error("[SECURITY] STRIPE_WEBHOOK_SECRET is not configured on server.");
        return NextResponse.json({ error: "Server webhook configuration error" }, { status: 500 });
      }

      // Verify Stripe Signature
      try {
        const parts = stripeSignature.split(",");
        let timestamp = "";
        let sig = "";
        for (const part of parts) {
          const [k, v] = part.split("=");
          if (k.trim() === "t") timestamp = v;
          if (k.trim() === "v1") sig = v;
        }

        if (!timestamp || !sig) {
          return NextResponse.json({ error: "Malformed Stripe signature" }, { status: 400 });
        }

        const signedPayload = `${timestamp}.${payload}`;
        const expectedSig = crypto
          .createHmac("sha256", stripeWebhookSecret)
          .update(signedPayload)
          .digest("hex");

        if (expectedSig !== sig) {
          console.warn("[SECURITY ALERT] Invalid Stripe signature detected. Blocked.");
          return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
        }
      } catch (err) {
        console.error("Stripe signature validation failed:", err);
        return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
      }

      const event = JSON.parse(payload);
      if (event.type === "checkout.session.completed") {
        const giftId = event.data?.object?.client_reference_id || event.data?.object?.metadata?.giftId;
        if (giftId) {
          console.log(`[STRIPE CONFIRMED] Payment verified for giftId: ${giftId}. Marking paid...`);
          const giftRef = doc(db, "gifts", giftId);
          await updateDoc(giftRef, { paid: true });
        }
      }

      return NextResponse.json({ received: true, gateway: "stripe" });
    }

    // 2. HANDLE PAYSTACK WEBHOOK (Cryptographically Verified Only)
    if (paystackSignature) {
      if (!paystackSecret) {
        console.error("[SECURITY] PAYSTACK_SECRET_KEY is not configured on server.");
        return NextResponse.json({ error: "Server webhook configuration error" }, { status: 500 });
      }

      const hash = crypto.createHmac("sha512", paystackSecret).update(payload).digest("hex");
      if (hash !== paystackSignature) {
        console.warn("[SECURITY ALERT] Invalid Paystack signature detected. Blocked.");
        return NextResponse.json({ error: "Invalid Paystack signature" }, { status: 400 });
      }

      const event = JSON.parse(payload);
      if (event.event === "charge.success") {
        const giftId = event.data?.metadata?.giftId;
        if (giftId) {
          console.log(`[PAYSTACK CONFIRMED] Payment verified for giftId: ${giftId}. Marking paid...`);
          const giftRef = doc(db, "gifts", giftId);
          await updateDoc(giftRef, { paid: true });
        }
      }

      return NextResponse.json({ received: true, gateway: "paystack" });
    }

    return NextResponse.json({ error: "Unhandled event" }, { status: 400 });
  } catch (error) {
    console.error("Webhook Security Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
