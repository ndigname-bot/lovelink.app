import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { giftId, recipientName, email } = body;

    if (!giftId) {
      return NextResponse.json({ error: "Missing giftId" }, { status: 400 });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      console.warn("Using Paystack Bypass Mode because of missing PAYSTACK_SECRET_KEY.");
      return NextResponse.json({ url: `${req.headers.get("origin")}/success?giftId=${giftId}` });
    }

    // Call Paystack API
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email || "customer@lovelink.app", // Paystack requires an email
        amount: 15000, // 150 GHS in pesewas (approx $15)
        currency: "GHS",
        metadata: {
          giftId: giftId,
        },
        callback_url: `${req.headers.get("origin")}/success?giftId=${giftId}`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Failed to initialize Paystack transaction");
    }

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (error) {
    console.error("Paystack Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
