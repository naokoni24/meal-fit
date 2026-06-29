import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
        <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-coral-soft text-lg">
                🌙
              </span>
              <span className="leading-tight">
                <span className="block text-base font-bold text-ink">
                  ととのうごはん
                </span>
                <span className="font-display block text-[10px] tracking-widest text-ink-soft">
                  AI MEAL PLANNER
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-1.5">
              <Link
                href="/favorites"
                aria-label="お気に入り"
                className="grid h-10 w-10 place-items-center rounded-full text-lg text-coral-deep transition hover:bg-coral-soft"
              >
                ♥
              </Link>
              <Link
                href="/shopping"
                aria-label="買い物リスト"
                className="grid h-10 w-10 place-items-center rounded-full text-base transition hover:bg-sage-soft"
              >
                🛒
              </Link>
              {isSupabaseConfigured &&
                (user ? (
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      aria-label="ログアウト"
                      title="ログアウト"
                      className="grid h-10 w-10 place-items-center rounded-full text-base transition hover:bg-coral-soft"
                    >
                      ⏻
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    aria-label="ログイン"
                    title="ログイン"
                    className="grid h-10 w-10 place-items-center rounded-full text-base transition hover:bg-coral-soft"
                  >
                    👤
                  </Link>
                ))}
              <Link
                href="/create"
                className="rounded-full bg-coral px-4 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-coral-deep"
              >
                つくる
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

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
