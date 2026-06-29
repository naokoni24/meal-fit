import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ととのうごはん | がんばらない、ヘルシーごはん提案";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FBF7F3",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 100 }}>🌙</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#4A4039",
            marginTop: 16,
          }}
        >
          ととのうごはん
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#9B8B7E",
            marginTop: 16,
            marginBottom: 48,
          }}
        >
          がんばらない、ヘルシーごはん提案
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {(
            [
              { text: "目的を選ぶ", bg: "#EFE6DC", color: "#4A4039" },
              { text: "AIが3案提案", bg: "#DD8A72", color: "white" },
              { text: "買い物リストへ", bg: "#EFE6DC", color: "#4A4039" },
            ] as const
          ).map((item, i) => (
            <div
              key={i}
              style={{
                background: item.bg,
                color: item.color,
                borderRadius: 50,
                padding: "16px 36px",
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
