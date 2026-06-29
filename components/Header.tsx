"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function Header({ user }: { user: { id: string } | null }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 10) {
        setHidden(false);
      } else if (y > lastY.current + 4) {
        setHidden(true);
      } else if (y < lastY.current - 4) {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b border-line/70 bg-cream/80 backdrop-blur-md transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center text-2xl">🍃</span>
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
  );
}
