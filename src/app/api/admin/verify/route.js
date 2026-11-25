import { NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

export async function POST(req) {
  try {
    if (!ADMIN_PASSCODE) {
      console.error("[ADMIN SECURITY] ADMIN_PASSCODE environment variable is not configured.");
      return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 500 });
    }

    const { passcode } = await req.json();

    if (!passcode || typeof passcode !== "string") {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 400 });
    }

    // Timing-safe comparison to prevent side-channel timing attacks
    const bufferA = Buffer.from(passcode.trim());
    const bufferB = Buffer.from(ADMIN_PASSCODE.trim());

    if (bufferA.length !== bufferB.length || !crypto.timingSafeEqual(bufferA, bufferB)) {
      console.warn("[ADMIN SECURITY] Failed admin passcode attempt.");
      return NextResponse.json({ error: "Incorrect admin credentials" }, { status: 401 });
    }

    // Generate authenticated session token
    const token = crypto
      .createHmac("sha256", ADMIN_PASSCODE)
      .update("lovelink_admin_authorized")
      .digest("hex");

    return NextResponse.json({ 
      success: true, 
      token 
    });
  } catch (error) {
    console.error("Admin Auth Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
