import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getSafeAppOrigin } from "../../../lib/security";

export async function POST(req) {
  try {
    const body = await req.json();
    const { giftId, recipientName, email } = body;

    if (!giftId || typeof giftId !== "string") {
      return NextResponse.json({ error: "Missing or invalid giftId" }, { status: 400 });
    }

    // SECURITY: Read authoritative tier from Firestore rather than trusting client-supplied tier
    const giftSnap = await getDoc(doc(db, "gifts", giftId));
    if (!giftSnap.exists()) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }
    const giftData = giftSnap.data();
    const tier = ["free", "standard", "vip"].includes(giftData.tier) ? giftData.tier : "standard";

    const origin = getSafeAppOrigin(req.headers.get("origin"));

    // 0. FREE TIER BYPASS (only when Firestore record is genuinely tier === "free")
    if (tier === "free") {
      return NextResponse.json({ url: `${origin}/success?giftId=${giftId}` });
    }

    const isVip = tier === "vip";
    const paystackAmount = isVip ? 24900 : 9900; // 249 GHS (~$24.99) vs 99 GHS (~$9.99)
    const stripeAmount = isVip ? 2499 : 999;     // $24.99 vs $9.99
    const tierName = isVip ? "Cinematic VIP LoveLink" : "Interactive 3D LoveLink";

    // 1. PRIMARY GATEWAY: Paystack (Direct Settlement to Ghana Bank / MoMo + Global Cards)
    // Works 100% without needing a US registered company or US bank account!
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecretKey) {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || "customer@lovelink.app",
          amount: paystackAmount,
          currency: "GHS",
          channels: ["card", "mobile_money", "apple_pay"],
          metadata: {
            giftId: giftId,
            recipientName: recipientName || "Special Someone",
            tier: tier,
          },
          callback_url: `${origin}/success?giftId=${giftId}`,
        }),
      });

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || "Failed to initialize Paystack transaction");
      }

      return NextResponse.json({ url: data.data.authorization_url });
    }

    // 2. SECONDARY GATEWAY: Stripe (Only if US/International entity exists)
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey) {
      const stripeParams = new URLSearchParams();
      stripeParams.append("mode", "payment");
      stripeParams.append("success_url", `${origin}/success?giftId=${giftId}&session_id={CHECKOUT_SESSION_ID}`);
      stripeParams.append("cancel_url", `${origin}/my-gifts`);
      stripeParams.append("client_reference_id", giftId);
      stripeParams.append("metadata[giftId]", giftId);
      stripeParams.append("metadata[tier]", tier);
      if (recipientName) stripeParams.append("metadata[recipientName]", recipientName);
      if (email) stripeParams.append("customer_email", email);

      stripeParams.append("line_items[0][price_data][currency]", "usd");
      stripeParams.append("line_items[0][price_data][unit_amount]", String(stripeAmount));
      stripeParams.append("line_items[0][price_data][product_data][name]", `${tierName} for ${recipientName || "Your Special Someone"}`);
      stripeParams.append("line_items[0][price_data][product_data][description]", isVip ? "Photorealistic 4K AI Cinema Movie Intro, 3D experience, unlimited photos, lifetime cloud archival." : "Permanent digital keepsake, 100% lifetime cloud preservation, no recurring subscriptions.");
      stripeParams.append("line_items[0][quantity]", "1");

      const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: stripeParams.toString(),
      });

      const stripeData = await stripeResponse.json();
      if (stripeData.error) {
        throw new Error(stripeData.error.message || "Failed to initialize Stripe transaction");
      }

      return NextResponse.json({ url: stripeData.url });
    }

    // 3. Fail closed in production if no payment gateway is configured
    if (process.env.NODE_ENV === "production") {
      console.error("[SECURITY] Neither PAYSTACK_SECRET_KEY nor STRIPE_SECRET_KEY is configured.");
      return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 503 });
    }
    console.warn("Using Payment Bypass Mode in development because no payment keys are configured.");
    return NextResponse.json({ url: `${origin}/success?giftId=${giftId}` });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
