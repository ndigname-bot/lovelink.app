import { ImageResponse } from "next/og";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawName = searchParams.get("name") || "Someone Special";
    
    // Clean and capitalize name for display
    const formattedName = rawName
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            backgroundImage: "radial-gradient(circle at 50% 35%, #4a0d24 0%, #0d040a 60%, #050103 100%)",
            color: "white",
            fontFamily: "sans-serif",
            padding: "40px",
            textAlign: "center",
          }}
        >
          {/* Glowing Heart Envelope Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 110,
              height: 110,
              borderRadius: "50%",
              backgroundColor: "rgba(244, 63, 94, 0.15)",
              border: "2px solid rgba(244, 63, 94, 0.4)",
              boxShadow: "0 0 60px rgba(244, 63, 94, 0.4)",
              marginBottom: 20,
              fontSize: 54,
            }}
          >
            💌
          </div>

          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#fb7185",
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            A Special Surprise For
          </div>

          <div
            style={{
              fontSize: 78,
              fontWeight: 900,
              color: "#ffffff",
              marginBottom: 26,
              textShadow: "0 0 50px rgba(244, 63, 94, 0.7)",
              maxWidth: 1000,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {formattedName}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              color: "rgba(255, 255, 255, 0.85)",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              padding: "12px 32px",
              borderRadius: 9999,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            }}
          >
            <span>❤️</span>
            <span style={{ fontWeight: 600 }}>LOVELINK</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ color: "#fda4af" }}>Tap to unlock your gift</span>
            <span>✨</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error("OG Image generation failed:", e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
