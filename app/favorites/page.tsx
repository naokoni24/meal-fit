"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MealSuggestion } from "@/lib/types";
import { getFavorites } from "@/lib/storage";
import { MealCard } from "@/components/MealCard";
import { SavedNav } from "@/components/SavedNav";

export default function FavoritesPage() {
  const [favs, setFavs] = useState<MealSuggestion[] | null>(null);

  useEffect(() => {
    setFavs(getFavorites());
  }, []);

  const refresh = () => setFavs(getFavorites());

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-ink">保存したもの</h1>
        <SavedNav />
      </div>

      {favs === null ? (
        <p className="py-16 text-center text-sm text-ink-soft">読み込み中…</p>
      ) : favs.length === 0 ? (
        <div className="mx-auto max-w-md animate-rise rounded-4xl border border-line bg-surface px-6 py-16 text-center">
          <div className="text-5xl">♡</div>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            まだお気に入りがありません。
            <br />
            気になる献立を「♡ お気に入り」で保存しましょう。
          </p>
          <Link
            href="/create"
            className="mt-6 inline-block rounded-full bg-coral px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-coral-deep"
          >
            献立をつくる
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {favs.map((s, i) => (
            <MealCard
              key={s.id}
              suggestion={s}
              index={i}
              onFavoriteChange={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
