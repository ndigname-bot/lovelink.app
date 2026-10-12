import { collection, query, where, getDocs, limit } from "firebase/firestore";

export function slugify(text) {
  if (!text) return "my-love";
  const slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except spaces and hyphens
    .replace(/[\s_-]+/g, "-")  // collapse whitespace and underscores into single hyphen
    .replace(/^-+|-+$/g, "");  // trim hyphens

  return slug || "my-love";
}

/**
 * Generates an automatic, personalized, collision-free slug.
 * E.g. "Yuri" -> "yuri". If "yuri" is already taken in the database, returns "yuri-4b2a".
 */
export async function generateUniqueSlug(db, recipientName) {
  const base = slugify(recipientName);
  
  try {
    const q = query(collection(db, "gifts"), where("slug", "==", base), limit(1));
    const snap = await getDocs(q);
    
    // If base slug is free, claim it!
    if (snap.empty) {
      return base;
    }
    
    // If taken, generate a clean 4-char suffix
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
  } catch (err) {
    console.error("Error generating unique slug:", err);
    // Safe fallback if Firestore check fails: add random suffix
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
  }
}
