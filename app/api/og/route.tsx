import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Lấy các tham số từ URL
    const title = searchParams.get("title") || "EnglishMastery"
    const description =
      searchParams.get("description") || "Master English through our innovative 4-Skill Video Crucible methodology"
    const theme = searchParams.get("theme") || "light"

    // Tải font
    const fontData = await fetch(new URL("/fonts/outfit-bold.ttf", new URL(request.url).origin)).then((res) =>
      res.arrayBuffer(),
    )

    // Xác định màu sắc dựa trên theme
    const colors =
      theme === "dark"
        ? { bg: "#1f2937", text: "#ffffff", accent: "#60a5fa" }
        : { bg: "#ffffff", text: "#1f2937", accent: "#3b82f6" }

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z"
              stroke={colors.accent}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.25 11.5L4.75 14L12 18.25L19.25 14L14.6722 11.5"
              stroke={colors.accent}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              marginLeft: "12px",
              fontSize: "36px",
              fontWeight: "bold",
              background: `linear-gradient(to right, #4ade80, #60a5fa)`,
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            EnglishMastery
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: colors.text,
              lineHeight: 1.2,
              margin: "0 0 20px 0",
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: colors.text,
              opacity: 0.8,
              maxWidth: "800px",
              textAlign: "center",
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ color: colors.text, fontSize: "24px", opacity: 0.7 }}>englishmastery.com</span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Outfit",
            data: fontData,
            style: "normal",
            weight: 700,
          },
        ],
      },
    )
  } catch (e) {
    console.error(e)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
