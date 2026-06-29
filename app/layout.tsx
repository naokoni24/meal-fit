import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getUser } from "@/lib/supabase/auth";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "ととのうごはん｜がんばらない、ヘルシーごはん提案",
  description:
    "目的や食材を選ぶだけで、AIがダイエット向けの献立を3つ提案。コンビニ・冷蔵庫の食材にも対応した、やさしい献立アプリです。",
  manifest: "/manifest.json",
  openGraph: {
    title: "ととのうごはん｜がんばらない、ヘルシーごはん提案",
    description:
      "目的や食材を選ぶだけで、AIがダイエット向けの献立を3つ提案。コンビニ・冷蔵庫の食材にも対応した、やさしい献立アプリです。",
    siteName: "ととのうごはん",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ととのうごはん｜がんばらない、ヘルシーごはん提案",
    description: "目的や食材を選ぶだけで、AIがダイエット向けの献立を3つ提案。",
  },
};

export const viewport: Viewport = {
  themeColor: "#DD8A72",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Zen+Maru+Gothic:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        <Header user={user} />

        <main className="flex-1 pt-[69px]">{children}</main>

        <footer className="mt-16 border-t border-line bg-surface/60">
          <div className="mx-auto max-w-5xl px-5 py-8 text-center text-xs leading-relaxed text-ink-soft">
            <p>
              カロリー・栄養素は目安です。本アプリは医療アドバイスではありません。
              <br />
              持病がある場合は医師・管理栄養士にご相談ください。
            </p>
            <Link
              href="/about"
              className="mt-3 inline-block text-coral-deep underline-offset-2 hover:underline"
            >
              このアプリについて・くわしい注意事項 →
            </Link>
            <p className="mt-3 font-display tracking-wide">
              © {new Date().getFullYear()} ととのうごはん
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
