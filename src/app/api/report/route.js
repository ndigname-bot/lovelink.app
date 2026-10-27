import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();
    const { giftId, reason, details } = body;

    if (!giftId) {
      return NextResponse.json({ error: "Missing giftId" }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: "Missing report reason" }, { status: 400 });
    }

    // Skip demo gift writes
    if (giftId !== "demo-gift" && giftId !== "draft") {
      const giftRef = doc(db, "gifts", giftId);
      await updateDoc(giftRef, {
        reported: true,
        reportReason: reason,
        reportDetails: details || "",
        reportedAt: serverTimestamp(),
      });
      console.warn(`[SAFETY REPORT] Gift ${giftId} reported for: ${reason}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Report submitted successfully. Our safety team reviews all reports promptly." 
    });
  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit report" }, { status: 500 });
  }
}
