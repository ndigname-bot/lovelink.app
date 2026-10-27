import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { giftId, reactionType } = await req.json();

    if (!giftId) {
      return NextResponse.json({ error: "Missing giftId" }, { status: 400 });
    }

    // Skip demo and draft gifts
    if (giftId === "demo-gift" || giftId === "draft") {
      return NextResponse.json({ success: true, message: "Demo gift, notification skipped" });
    }

    // SECURITY: Look up the verified creator email directly from Firestore
    // Never trust client-supplied creator email to prevent open relay abuse
    const giftRef = doc(db, "gifts", giftId);
    const giftSnap = await getDoc(giftRef);

    if (!giftSnap.exists()) {
      return NextResponse.json({ error: "Gift record not found" }, { status: 404 });
    }

    const giftData = giftSnap.data();
    const creatorEmail = giftData.creatorEmail;
    const creatorName = giftData.creatorName || "there";
    const recipientName = giftData.recipientName || "Your recipient";

    if (!creatorEmail) {
      return NextResponse.json({ success: true, message: "No creator email registered on this gift" });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("Resend API key missing. Skipping email notification.");
      return NextResponse.json({ success: true, warning: "API key missing" });
    }

    const resend = new Resend(resendApiKey);
    const domain = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://lovelink.app";
    const sender = process.env.RESEND_SENDER_EMAIL || "notifications@lovelink.app";

    const subject = `${recipientName} just reacted to your LoveLink! 💌`;
    const actionText = reactionType === 'voice' ? 'left you a Voice Note 🎵' : 'wrote you a message ✍️';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0f172a; border-radius: 24px; color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ec4899; margin: 0; font-size: 28px; font-family: serif; font-style: italic;">LoveLink</h1>
        </div>
        
        <div style="background-color: #1e293b; padding: 40px; border-radius: 20px; border: 1px solid #334155;">
          <h2 style="color: #f8fafc; margin-top: 0; font-size: 22px;">Hey ${creatorName},</h2>
          
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Great news! <strong>${recipientName}</strong> just opened your keepsake and ${actionText}.
          </p>
          
          <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
            <a href="${domain}/inbox" style="background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">
              View Reaction in Inbox
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 30px;">
          Permanent Keepsakes • The LoveLink Team
        </p>
      </div>
    `;

    await resend.emails.send({
      from: `LoveLink <${sender}>`,
      to: creatorEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log(`[NOTIFICATION SENT] Reaction alert sent to creator for gift ${giftId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email API Security Error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
