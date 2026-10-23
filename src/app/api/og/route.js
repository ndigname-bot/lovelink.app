import { ImageResponse } from "next/og";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawName = searchParams.get("name") || "Someone Special";
    const rawCreator = searchParams.get("creator") || "";
    const occasion = searchParams.get("occasion") || "standard";
    
    // Clean and capitalize name for display
    const formattedName = rawName
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    const formattedCreator = rawCreator
      ? rawCreator.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "";

    // Dynamic occasion copy & icons
    let tag = "CONFIDENTIAL DIGITAL LETTER";
    let heading = `For ${formattedName}`;
    let subtitle = formattedCreator
      ? `Crafted with love by ${formattedCreator} • Sealed memories & music`
      : "Sealed with personal memories, music & heartfelt words";
    let sealIcon = "💌";

    if (occasion === "family") {
      tag = "PRIVATE TIME CAPSULE";
      heading = `Time Capsule for ${formattedName}`;
      subtitle = formattedCreator
        ? `A journey back through our moments, created by ${formattedCreator}`
        : "A walk down memory lane with family photos, music & appreciation";
      sealIcon = "⏳";
    } else if (occasion === "birthday") {
      tag = "BIRTHDAY CELEBRATION";
      heading = `Birthday Gift for ${formattedName}`;
      subtitle = formattedCreator
        ? `A special birthday celebration crafted by ${formattedCreator}`
        : "A private digital celebration sealed with memories & music";
      sealIcon = "🎂";
    } else if (occasion === "proposal") {
      tag = "CONFIDENTIAL • ONCE IN A LIFETIME";
      heading = `A Special Question for ${formattedName}`;
      subtitle = formattedCreator
        ? `Our love story, sealed by ${formattedCreator}`
        : "A private digital journey through our most precious moments";
      sealIcon = "💍";
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#edf0f4",
            backgroundImage:
              "radial-gradient(circle at 12% 15%, rgba(244, 63, 94, 0.08) 0%, transparent 45%), radial-gradient(circle at 88% 85%, rgba(236, 72, 153, 0.06) 0%, transparent 45%)",
            padding: "40px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Floating White Card (Inspired by clean modern card preview) */}
          <div
            style={{
              width: "1020px",
              height: "490px",
              backgroundColor: "#ffffff",
              borderRadius: "36px",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.18)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "46px 54px",
              position: "relative",
            }}
          >
            {/* Top Row: Category Tag & Postage stamp */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(244, 63, 94, 0.08)",
                  border: "1px solid rgba(244, 63, 94, 0.22)",
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  color: "#e11d48",
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                }}
              >
                <span>{sealIcon}</span>
                <span>{tag}</span>
              </div>

              {/* Postage Stamp Cue */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed rgba(244, 63, 94, 0.35)",
                  backgroundColor: "rgba(244, 63, 94, 0.04)",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#e11d48",
                  letterSpacing: "2px",
                }}
              >
                <span>LOVE POST</span>
                <span style={{ fontSize: "9px", opacity: 0.7, letterSpacing: "1px" }}>FIRST CLASS</span>
              </div>
            </div>

            {/* Middle Row: Big Bold Title & Subtitle */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.15,
                  letterSpacing: "-1px",
                }}
              >
                {heading}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 500,
                  color: "#64748b",
                  lineHeight: 1.35,
                  maxWidth: "880px",
                }}
              >
                {subtitle}
              </div>
            </div>

            {/* Bottom Row: Brand (Left) & Wax Seal Stamp Action Pill (Right) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingTop: "24px",
                borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              {/* Brand Logo & Domain */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    backgroundColor: "#f43f5e",
                    color: "white",
                    fontSize: "22px",
                    boxShadow: "0 6px 16px rgba(244, 63, 94, 0.35)",
                  }}
                >
                  ❤️
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "26px",
                      fontWeight: 800,
                      color: "#0f172a",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    LoveLink
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#94a3b8",
                      letterSpacing: "0.5px",
                    }}
                  >
                    lovelink.app
                  </span>
                </div>
              </div>

              {/* 3D Wax Seal Stamp Action Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "#f43f5e",
                  padding: "12px 28px",
                  borderRadius: "9999px",
                  color: "#ffffff",
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  boxShadow: "0 8px 24px rgba(244, 63, 94, 0.35)",
                }}
              >
                <span>Break Seal to Open</span>
                <span style={{ fontSize: "20px" }}>✉️</span>
              </div>
            </div>
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
