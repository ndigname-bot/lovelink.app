const ALLOWED_ORIGINS = new Set([
  "https://lovelink-app-beta.vercel.app",
  "https://lovelink.app",
  "https://www.lovelink.app",
]);

if (process.env.NEXT_PUBLIC_APP_URL) {
  ALLOWED_ORIGINS.add(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ""));
}

if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.add("http://localhost:3000");
  ALLOWED_ORIGINS.add("http://127.0.0.1:3000");
}

/**
 * Returns a trusted app origin, preventing Origin-header spoofing and open redirects.
 */
export function getSafeAppOrigin(requestOrigin) {
  const normalized = typeof requestOrigin === "string" ? requestOrigin.replace(/\/$/, "") : "";
  if (normalized && ALLOWED_ORIGINS.has(normalized)) {
    return normalized;
  }
  return (process.env.NEXT_PUBLIC_APP_URL || "https://lovelink-app-beta.vercel.app").replace(/\/$/, "");
}

/**
 * Escapes HTML special characters to prevent HTML injection in email templates.
 */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Extracts and strictly validates an 11-character YouTube video ID.
 */
export function extractSafeYouTubeId(url) {
  if (typeof url !== "string" || !url.includes("youtube") && !url.includes("youtu.be")) {
    return null;
  }
  let rawId = "";
  if (url.includes("v=")) {
    rawId = url.split("v=")[1]?.split("&")[0] || "";
  } else if (url.includes("youtu.be/")) {
    rawId = url.split("youtu.be/")[1]?.split("?")[0] || "";
  }
  return /^[a-zA-Z0-9_-]{11}$/.test(rawId) ? rawId : null;
}
