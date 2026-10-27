import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Simple in-memory rate limiter per IP
const reportRateLimits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 5;

  const records = reportRateLimits.get(ip) || [];
  const validRecords = records.filter(time => now - time < windowMs);

  if (validRecords.length >= maxRequests) {
    return true;
  }

  validRecords.push(now);
  reportRateLimits.set(ip, validRecords);
  return false;
}

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown-ip";

    if (isRateLimited(ip)) {
      console.warn(`[SAFETY] Rate limit reached for report endpoint from IP: ${ip}`);
      return NextResponse.json({ error: "Too many reports submitted. Please wait a few minutes." }, { status: 429 });
    }

    const body = await req.json();
    const { giftId, reason, details } = body;

    if (!giftId || typeof giftId !== "string") {
      return NextResponse.json({ error: "Missing or invalid giftId" }, { status: 400 });
    }

    if (!reason || typeof reason !== "string") {
      return NextResponse.json({ error: "Missing or invalid report reason" }, { status: 400 });
    }

    // Skip demo gift writes
    if (giftId === "demo-gift" || giftId === "draft") {
      return NextResponse.json({ success: true, message: "Demo gift, report noted." });
    }

    // Verify gift exists before writing
    const giftRef = doc(db, "gifts", giftId);
    const snap = await getDoc(giftRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    // Update safety flags
    await updateDoc(giftRef, {
      reported: true,
      reportReason: reason.slice(0, 100),
      reportDetails: (details || "").slice(0, 1000), // Protect against payload bloat
      reportedAt: serverTimestamp(),
    });

    console.warn(`[SAFETY REPORT PROCESSED] Gift ${giftId} flagged for: ${reason}`);

    return NextResponse.json({ 
      success: true, 
      message: "Report submitted successfully. Our safety team reviews all reports promptly." 
    });
  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json({ error: "Failed to process report" }, { status: 500 });
  }
}
