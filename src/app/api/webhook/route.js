import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function isExpectedAmount(tier, amountPaid, gateway) {
  const isVip = tier === "vip";
  const expected = gateway === "paystack" ? (isVip ? 24900 : 9900) : (isVip ? 2499 : 999);
  return typeof amountPaid === "number" && amountPaid >= expected;
}

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
        const amountTotal = event.data?.object?.amount_total;
        if (giftId) {
          const giftRef = doc(db, "gifts", giftId);
          const giftSnap = await getDoc(giftRef);
          const giftTier = giftSnap.exists() ? (giftSnap.data().tier || "standard") : "standard";
          if (!isExpectedAmount(giftTier, amountTotal, "stripe")) {
            console.warn(`[SECURITY ALERT] Stripe amount mismatch for giftId=${giftId}: got ${amountTotal} for tier=${giftTier}`);
            return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
          }
          console.log(`[STRIPE CONFIRMED] Payment verified for giftId: ${giftId}. Marking paid...`);
          await updateDoc(giftRef, { paid: true, paymentGateway: "stripe", paidAt: new Date().toISOString() });
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
        const amountPaid = event.data?.amount;
        if (giftId) {
          const giftRef = doc(db, "gifts", giftId);
          const giftSnap = await getDoc(giftRef);
          const giftTier = giftSnap.exists() ? (giftSnap.data().tier || "standard") : "standard";
          if (!isExpectedAmount(giftTier, amountPaid, "paystack")) {
            console.warn(`[SECURITY ALERT] Paystack amount mismatch for giftId=${giftId}: got ${amountPaid} for tier=${giftTier}`);
            return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
          }
          console.log(`[PAYSTACK CONFIRMED] Payment verified for giftId: ${giftId}. Marking paid...`);
          await updateDoc(giftRef, { paid: true, paymentGateway: "paystack", paidAt: new Date().toISOString() });
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
