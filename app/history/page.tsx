"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DISCLAIMER, type HistoryEntry } from "@/lib/types";
import { getHistory, removeHistory, clearHistory } from "@/lib/storage";
import {
  GOAL_LABELS,
  MEAL_TYPE_LABELS,
  COOKING_STYLE_LABELS,
} from "@/lib/labels";
import { SavedNav } from "@/components/SavedNav";

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const open = (e: HistoryEntry) => {
    sessionStorage.setItem(
      "yorugohan:result",
      JSON.stringify({
        input: e.input,
        response: {
          requestId: e.id,
          suggestions: e.suggestions,
          disclaimer: DISCLAIMER,
        },
      }),
    );
    router.push("/result");
  };

  const del = (id: string) => {
    removeHistory(id);
    setItems(getHistory());
  };

  const clearAll = () => {
    clearHistory();
    setItems([]);
  };

  const fmt = (ms: number) =>
    new Date(ms).toLocaleString("ja-JP", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="mb-6 text-2xl font-bold text-ink">保存したもの</h1>
      <SavedNav />

      {items === null ? (
        <p className="py-16 text-center text-sm text-ink-soft">読み込み中…</p>
      ) : items.length === 0 ? (
        <div className="mx-auto max-w-md animate-rise rounded-4xl border border-line bg-surface px-6 py-16 text-center">
          <div className="text-5xl">🕘</div>
          <p className="mt-4 text-sm text-ink-soft">まだ履歴がありません。</p>
          <Link
            href="/create"
            className="mt-6 inline-block rounded-full bg-coral px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-coral-deep"
          >
            献立をつくる
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((e) => (
              <div
                key={e.id}
                className="rounded-4xl border border-line bg-surface p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-soft">
                    {fmt(e.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => del(e.id)}
                    className="text-xs text-ink-soft transition hover:text-coral-deep"
                  >
                    削除
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-coral-soft px-2.5 py-0.5 text-coral-deep">
                    {GOAL_LABELS[e.input.goal]}
                  </span>
                  <span className="rounded-full bg-sage-soft px-2.5 py-0.5 text-sage-deep">
                    {MEAL_TYPE_LABELS[e.input.mealType]}
                  </span>
                  <span className="rounded-full bg-honey-soft px-2.5 py-0.5 text-ink">
                    {COOKING_STYLE_LABELS[e.input.cookingStyle]}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-ink">
                  {e.suggestions.map((s) => (
                    <li key={s.id} className="flex justify-between gap-2">
                      <span className="truncate">{s.title}</span>
                      <span className="shrink-0 text-ink-soft">
                        {s.caloriesKcal}kcal
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => open(e)}
                  className="mt-4 w-full rounded-full border border-coral/40 bg-surface px-4 py-2.5 text-sm font-medium text-coral-deep transition hover:bg-coral-soft"
                >
                  もう一度見る
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="mt-6 w-full text-center text-xs text-ink-soft transition hover:text-coral-deep"
          >
            履歴をすべて消す
          </button>
        </>
      )}
    </div>
  );
}
