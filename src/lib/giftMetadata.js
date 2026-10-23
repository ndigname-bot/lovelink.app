import { db } from "./firebase";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";

function formatName(raw) {
  if (!raw) return "Someone Special";
  return raw
    .toString()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export async function getGiftMetadata(rawId) {
  let recipientName = "";
  let creatorName = "";
  let occasion = "standard";
  
  if (rawId && rawId !== "demo-gift" && rawId !== "draft") {
    try {
      // 1. Try direct doc ID
      const directSnap = await getDoc(doc(db, "gifts", rawId));
      if (directSnap.exists()) {
        const data = directSnap.data();
        recipientName = data.recipientName || "";
        creatorName = data.creatorName || "";
        occasion = data.occasion || "standard";
      } else {
        // 2. Try slug query
        const q = query(collection(db, "gifts"), where("slug", "==", rawId), limit(1));
        const slugSnap = await getDocs(q);
        if (!slugSnap.empty) {
          const data = slugSnap.docs[0].data();
          recipientName = data.recipientName || "";
          creatorName = data.creatorName || "";
          occasion = data.occasion || "standard";
        }
      }
    } catch (e) {
      console.warn("Could not fetch gift details for metadata:", e.message);
    }
  }

  // Fallback to formatted slug or default name
  const displayName = recipientName ? recipientName.trim() : formatName(rawId);
  const formattedCreator = creatorName ? creatorName.trim() : "";

  // Dynamic occasion-specific preview text for WhatsApp / Social
  let title = `A private surprise for ${displayName} 💌`;
  let description = formattedCreator
    ? `${formattedCreator} crafted a special digital experience with music and memories for ${displayName}. Tap to open!`
    : `Someone special sealed an unforgettable digital gift just for you on LoveLink. Tap to open and experience your surprise!`;

  if (occasion === "family") {
    title = `A Private Time Capsule for ${displayName} ⏳`;
    description = formattedCreator
      ? `${formattedCreator} sealed a family memory capsule for ${displayName} with photos, music, and an appreciation letter. Tap to open!`
      : `A private family digital time capsule with cherished photos and a special letter. Tap to open!`;
  } else if (occasion === "birthday") {
    title = `Happy Birthday, ${displayName}! 🎂 A special gift awaits`;
    description = formattedCreator
      ? `${formattedCreator} created a private birthday celebration package for ${displayName}. Tap to open your surprise!`
      : `A private birthday surprise sealed with sweet memories and music. Tap to open!`;
  } else if (occasion === "proposal") {
    title = `A Very Special Message for ${displayName} 💍`;
    description = formattedCreator
      ? `A private digital journey through our most precious moments, sealed by ${formattedCreator}. Tap to open!`
      : `An unforgettable question and love story crafted just for you. Tap to open!`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lovelink-app-beta.vercel.app";
  const ogImageUrl = `${baseUrl}/api/og?name=${encodeURIComponent(displayName)}&creator=${encodeURIComponent(formattedCreator)}&occasion=${encodeURIComponent(occasion)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `LoveLink Gift for ${displayName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
