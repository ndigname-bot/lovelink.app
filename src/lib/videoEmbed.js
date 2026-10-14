/**
 * Parses and returns clean embed info for YouTube, YouTube Shorts, Vimeo, or direct MP4 links.
 */
export function parseVideoUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. YouTube Shorts: e.g. https://www.youtube.com/shorts/5j_8V1f9d-o
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (shortsMatch && shortsMatch[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?autoplay=1&playsinline=1&rel=0`,
    };
  }

  // 2. Standard YouTube: e.g. https://www.youtube.com/watch?v=XYZ or https://youtu.be/XYZ
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    let videoId = null;
    if (trimmed.includes("v=")) {
      videoId = trimmed.split("v=")[1]?.split("&")[0];
    } else if (trimmed.includes("youtu.be/")) {
      videoId = trimmed.split("youtu.be/")[1]?.split("?")[0];
    } else if (trimmed.includes("embed/")) {
      videoId = trimmed.split("embed/")[1]?.split("?")[0];
    }
    if (videoId) {
      return {
        type: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`,
      };
    }
  }

  // 3. Vimeo: e.g. https://vimeo.com/123456789
  const vimeoMatch = trimmed.match(/vimeo\.com\/([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // 4. Direct video files or fallback
  return {
    type: "direct",
    url: trimmed,
  };
}
