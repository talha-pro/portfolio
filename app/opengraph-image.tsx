import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0f0f",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(32,178,172,0.25), transparent 55%), radial-gradient(circle at 85% 75%, rgba(63,208,202,0.18), transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#20b2ac",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: -0.5,
          }}
        >
          talhakhan.pro
        </div>
        <div
          style={{
            display: "flex",
            color: "#f5f5f5",
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            marginTop: 24,
          }}
        >
          Talha Khan
          <span style={{ color: "#20b2ac" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            color: "#8a9c9a",
            fontSize: 38,
            marginTop: 16,
          }}
        >
          Senior Software Engineer — React, Next.js, Agentic AI
        </div>
      </div>
    ),
    { ...size },
  );
}
