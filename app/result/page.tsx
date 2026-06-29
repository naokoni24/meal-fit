"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GenerateResponse, MealRequestInput } from "@/lib/types";
import {
  GOAL_LABELS,
  MEAL_TYPE_LABELS,
  COOKING_STYLE_LABELS,
} from "@/lib/labels";
import { MealCard } from "@/components/MealCard";
import { addHistory } from "@/lib/storage";

type Stored = { input: MealRequestInput; response: GenerateResponse };

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<Stored | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("yorugohan:result");
      if (raw) setData(JSON.parse(raw) as Stored);
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  const regenerate = async () => {
    if (!data) return;
    setRegenerating(true);
    setRegenError(null);
    try {
      const res = await fetch("/api/meals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.input),
      });
      const json = await res.json();
      if (res.ok) {
        addHistory({
          id: json.requestId,
          input: data.input,
          suggestions: json.suggestions,
          createdAt: Date.now(),
        });
        const next = { input: data.input, response: json };
        sessionStorage.setItem("yorugohan:result", JSON.stringify(next));
        setData(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setRegenError(json?.error?.message ?? "提案の生成に失敗しました。");
      }
    } catch {
      setRegenError(
        "通信エラーが発生しました。少し時間をおいて再度お試しください。",
      );
    } finally {
      setRegenerating(false);
    }
  };

  // 結果がない場合の案内
  if (hydrated && !data) {
    return (
      <div className="mx-auto max-w-md animate-rise px-5 py-24 text-center">
        <div className="text-6xl">🍽️</div>
        <h1 className="mt-5 text-xl font-bold text-ink">
          まだ献立がありません
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          条件をえらんで、AIに提案してもらいましょう。
        </p>
        <Link
          href="/create"
          className="mt-7 inline-block rounded-full bg-coral px-7 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-coral-deep"
        >
          献立をつくる
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center text-ink-soft">
        読み込み中…
      </div>
    );
  }

  const { input, response } = data;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-ink">あなたへの提案</h1>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
          <span className="rounded-full bg-coral-soft px-3 py-1 text-coral-deep">
            {GOAL_LABELS[input.goal]}
          </span>
          <span className="rounded-full bg-sage-soft px-3 py-1 text-sage-deep">
            {MEAL_TYPE_LABELS[input.mealType]}
          </span>
          <span className="rounded-full bg-honey-soft px-3 py-1 text-ink">
            {COOKING_STYLE_LABELS[input.cookingStyle]}
          </span>
        </div>
      </header>

      {(input.allergies.length > 0 || input.avoidIngredients.length > 0) &&
        response.suggestions.length < 3 && (
          <p className="mx-auto mb-5 max-w-2xl rounded-3xl bg-honey-soft/50 px-4 py-3 text-center text-xs leading-relaxed text-ink">
            アレルギー・避けたい食材の条件に合わせて、安全な提案を{" "}
            {response.suggestions.length} 件お出ししました。
          </p>
        )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {response.suggestions.map((s, i) => (
          <MealCard
            key={s.id}
            suggestion={s}
            index={i}
            cookingStyle={input.cookingStyle}
          />
        ))}
      </div>

      {/* アクション */}
      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={regenerate}
          disabled={regenerating}
          className="flex-1 rounded-full bg-coral px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-coral-deep disabled:opacity-70"
        >
          {regenerating ? "考えています…🍳" : "もう一度提案してもらう"}
        </button>
        <Link
          href="/create"
          className="flex-1 rounded-full border border-line bg-surface px-6 py-3.5 text-center text-sm font-bold text-ink transition hover:border-coral/40"
        >
          条件を変える
        </Link>
      </div>

      {regenError && (
        <p className="mx-auto mt-4 max-w-md rounded-2xl bg-coral-soft px-4 py-3 text-center text-sm text-coral-deep">
          {regenError}
        </p>
      )}

      <p className="mx-auto mt-8 max-w-2xl rounded-3xl bg-honey-soft/50 px-5 py-4 text-center text-xs leading-relaxed text-ink">
        {response.disclaimer}
      </p>
    </div>
  );
}
