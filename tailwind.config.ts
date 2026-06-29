import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 女性ユーザー向け：清潔感のあるやわらかいヘルシーパレット
        cream: "#FBF7F3", // 背景：ウォームクリーム
        surface: "#FFFFFF", // カード
        coral: {
          DEFAULT: "#DD8A72", // プライマリ（CTA・アクセント）
          soft: "#F3D9CE", // 淡いコーラル背景
          deep: "#C8765E", // ホバー
        },
        sage: {
          DEFAULT: "#8FA98C", // セカンダリ（ヘルシー・タグ）
          soft: "#E2EADF",
          deep: "#6F8A6C",
        },
        honey: {
          DEFAULT: "#E8B06A", // スコア・差し色
          soft: "#F7E7CC",
        },
        ink: {
          DEFAULT: "#4A4039", // 本文（ウォームダーク）
          soft: "#9A8E83", // サブテキスト
        },
        line: "#EFE6DC", // ボーダー
      },
      fontFamily: {
        sans: ["var(--font-zen-maru)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(120, 90, 70, 0.18)",
        card: "0 4px 20px -8px rgba(120, 90, 70, 0.14)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontSize: {
        xs: ["13px", { lineHeight: "1.5" }],
        sm: ["15px", { lineHeight: "1.65" }],
      },
    },
  },
  plugins: [],
};

export default config;
