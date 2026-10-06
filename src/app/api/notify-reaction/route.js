import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req) {
  try {
    const { creatorEmail, creatorName, recipientName, giftId, reactionType } = await req.json();

    if (!creatorEmail) {
      return NextResponse.json({ error: "No email provided" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("Resend API key missing. Skipping email notification.");
      return NextResponse.json({ success: true, warning: "API key missing" });
    }

    const resend = new Resend(resendApiKey);
    const domain = req.headers.get("origin") || "https://lovelink.app";
    const sender = process.env.RESEND_SENDER_EMAIL || "notifications@lovelink.app";

    const subject = `${recipientName} just reacted to your LoveLink! 💌`;
    const actionText = reactionType === 'voice' ? 'left you a Voice Note 🎵' : 'wrote you a message ✍️';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ec4899; margin: 0; font-size: 28px;">LoveLink</h1>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">Hey ${creatorName},</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Great news! <strong>${recipientName}</strong> just opened your gift and ${actionText}.
          </p>
          
          <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
            <a href="${domain}/my-gifts" style="background-color: #ec4899; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
              Listen to Reaction
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #94a3b8; font-size: 14px; margin-top: 30px;">
          Made with love,<br/>The LoveLink Team
        </p>
      </div>
    `;

    await resend.emails.send({
      from: `LoveLink <${sender}>`,
      to: creatorEmail,
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
