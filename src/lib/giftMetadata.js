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
  
  if (rawId && rawId !== "demo-gift" && rawId !== "draft") {
    try {
      // 1. Try direct doc ID
      const directSnap = await getDoc(doc(db, "gifts", rawId));
      if (directSnap.exists()) {
        recipientName = directSnap.data().recipientName;
      } else {
        // 2. Try slug query
        const q = query(collection(db, "gifts"), where("slug", "==", rawId), limit(1));
        const slugSnap = await getDocs(q);
        if (!slugSnap.empty) {
          recipientName = slugSnap.docs[0].data().recipientName;
        }
      }
    } catch (e) {
      console.warn("Could not fetch gift details for metadata:", e.message);
    }
  }

  // Fallback to formatted slug or default name
  const displayName = recipientName ? recipientName.trim() : formatName(rawId);
  const title = `💌 A special surprise for ${displayName} ❤️`;
  const description = `Someone made an unforgettable digital gift just for you on LoveLink. Tap to open and experience your surprise!`;
  const ogImageUrl = `/api/og?name=${encodeURIComponent(displayName)}`;

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
