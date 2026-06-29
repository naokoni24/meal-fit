"use client";

import { useEffect, useState } from "react";
import type { CookingStyle, MealSuggestion } from "@/lib/types";
import { isFavorite, toggleFavorite, addIngredients } from "@/lib/storage";
import { PFCBar } from "./PFCBar";
import { ScoreStars } from "./ScoreStars";

function buildXUrl(s: MealSuggestion): string {
  const text = [
    `🍃ととのうごはんで今日の献立が決まった！`,
    `「${s.title}」`,
    `${s.caloriesKcal}kcal（糖質${s.sugarG}g）`,
    `#ととのうごはん #ダイエット飯`,
  ].join("\n");
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

function buildLineUrl(s: MealSuggestion): string {
  const text = [
    `🍃ととのうごはんで今日の献立が決まった！`,
    ``,
    `「${s.title}」`,
    `📊 ${s.caloriesKcal}kcal（糖質${s.sugarG}g）`,
    `🥩 P:${s.proteinG}g 🧈 F:${s.fatG}g 🍚 C:${s.carbsG}g`,
    ``,
    `💚 ${s.dietPoints}`,
  ].join("\n");
  return `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
}

function getStepsLabel(
  suggestion: MealSuggestion,
  cookingStyle?: CookingStyle,
): string {
  const style = getDisplayCookingStyle(suggestion, cookingStyle);
  switch (style) {
    case "convenience":
      return "組み合わせ方を見る";
    case "deli":
      return "食べ方を見る";
    case "eatout":
      return "選び方を見る";
    case "jisui":
    default:
      return "作り方を見る";
  }
}

function getItemsLabel(
  suggestion: MealSuggestion,
  cookingStyle?: CookingStyle,
): string {
  const style = getDisplayCookingStyle(suggestion, cookingStyle);
  switch (style) {
    case "convenience":
    case "deli":
      return "買うもの";
    case "eatout":
      return "選ぶもの";
    case "jisui":
    default:
      return "材料";
  }
}

function getDisplayCookingStyle(
  suggestion: MealSuggestion,
  cookingStyle?: CookingStyle,
): CookingStyle {
  return cookingStyle ?? (suggestion.convenienceItems ? "convenience" : "jisui");
}

export function MealCard({
  suggestion,
  index,
  cookingStyle,
  onFavoriteChange,
}: {
  suggestion: MealSuggestion;
  index: number;
  cookingStyle?: CookingStyle;
  onFavoriteChange?: () => void;
}) {
  const [faved, setFaved] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setFaved(isFavorite(suggestion.id));
  }, [suggestion.id]);

  const toggleFav = () => {
    const now = toggleFavorite(suggestion);
    setFaved(now);
    onFavoriteChange?.();
  };

  const addToShopping = () => {
    addIngredients(suggestion.ingredients);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isConveni = !!suggestion.convenienceItems;

  return (
    <article
      className="animate-rise overflow-hidden rounded-4xl border border-line bg-surface shadow-card"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* 画像 */}
      <div className="relative h-44 overflow-hidden bg-cream/70">
        {suggestion.imageUrl ? (
          <>
            <img
              src={suggestion.imageUrl}
              alt={suggestion.title}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
            {suggestion.imageCredit && (
              <a
                href={suggestion.imageCredit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-1 right-2 text-[11px] text-white/70 drop-shadow hover:text-white"
              >
                {suggestion.imageCredit.name} / Unsplash
              </a>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-coral-soft via-cream to-sage-soft">
            <span className="text-5xl drop-shadow-sm">{isConveni ? "🏪" : "🍳"}</span>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-coral-deep backdrop-blur">
          ご提案 {index + 1}
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <header>
          <h3 className="text-lg font-bold leading-snug text-ink">
            {suggestion.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            {suggestion.description}
          </p>
        </header>

        {/* カロリー & PFC */}
        <div className="rounded-3xl bg-cream/70 p-4">
          <div className="mb-3 flex items-end justify-between">
            <span className="text-xs text-ink-soft">目安カロリー</span>
            <span className="leading-none">
              <span className="text-3xl font-bold text-coral-deep">
                {suggestion.caloriesKcal}
              </span>
              <span className="ml-1 text-sm text-ink-soft">kcal</span>
            </span>
          </div>
          <PFCBar
            p={suggestion.proteinG}
            f={suggestion.fatG}
            c={suggestion.carbsG}
            sugar={suggestion.sugarG}
          />
        </div>

        {/* スコア */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <ScoreStars label="満腹感" score={suggestion.satietyScore} />
          <ScoreStars label="手軽さ" score={suggestion.easinessScore} />
        </div>

        {/* ダイエットポイント */}
        <div className="rounded-3xl bg-sage-soft/70 p-4">
          <p className="text-xs font-bold text-sage-deep">💚 ダイエット向きポイント</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">
            {suggestion.dietPoints}
          </p>
        </div>

        {/* コンビニモード専用 */}
        {suggestion.convenienceItems && (
          <div className="space-y-3 rounded-3xl border border-line p-4">
            <p className="text-xs font-bold text-coral-deep">🏪 コンビニのポイント</p>
            <p className="text-xs leading-relaxed text-ink-soft">
              {suggestion.convenienceItems.reason}
            </p>
            <p className="text-xs leading-relaxed text-ink-soft">
              <span className="font-bold">栄養バランス：</span>
              {suggestion.convenienceItems.nutritionBalance}
            </p>
            {suggestion.convenienceItems.avoidItems.length > 0 && (
              <p className="text-xs leading-relaxed text-ink-soft">
                <span className="font-bold">避けたい追加商品：</span>
                {suggestion.convenienceItems.avoidItems.join("、")}
              </p>
            )}
          </div>
        )}

        {/* 調理スタイルに合わせた項目リスト */}
        <div>
          <p className="mb-2 text-xs font-bold text-ink">
            {isConveni ? "🛒 買い物リスト" : getItemsLabel(suggestion, cookingStyle)}
          </p>
          <ul className="grid grid-cols-1 gap-2 text-sm text-ink sm:grid-cols-2 sm:gap-x-4 sm:gap-y-1.5">
            {suggestion.ingredients.map((ing) => (
              <li
                key={ing.name}
                className="flex min-w-0 items-start justify-between gap-3 rounded-2xl bg-cream/50 px-3 py-2 sm:bg-transparent sm:px-0 sm:py-0"
              >
                <span className="min-w-0 flex-1 leading-relaxed">{ing.name}</span>
                <span className="shrink-0 text-right leading-relaxed text-ink-soft">
                  {ing.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 調理スタイルに合わせた補足（折りたたみ） */}
        {suggestion.steps.length > 0 && (
          <details className="group rounded-3xl bg-cream/70 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-ink">
              {getStepsLabel(suggestion, cookingStyle)}
              <span className="text-ink-soft transition group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <ol className="mt-3 space-y-2 text-sm text-ink">
              {suggestion.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-coral text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </details>
        )}

        {/* 注意点 */}
        {suggestion.cautions && (
          <p className="text-xs leading-relaxed text-ink-soft">
            ⚠️ {suggestion.cautions}
          </p>
        )}

        {/* アクション */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={toggleFav}
            className={`flex-1 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition ${
              faved
                ? "border-coral bg-coral text-white"
                : "border-coral/40 bg-surface text-coral-deep hover:bg-coral-soft"
            }`}
          >
            {faved ? "♥ 保存済み" : "♡ お気に入り"}
          </button>
          <button
            type="button"
            onClick={addToShopping}
            className="flex-1 whitespace-nowrap rounded-full border border-sage/50 bg-surface px-3 py-2 text-xs font-medium text-sage-deep transition hover:bg-sage-soft"
          >
            {added ? "✓ 追加しました" : "🛒 買い物リストへ"}
          </button>
        </div>

        {/* シェア */}
        <div className="flex items-center gap-2 border-t border-line pt-3">
          <span className="text-xs text-ink-soft">シェア：</span>
          <a
            href={buildXUrl(suggestion)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ink/30 hover:text-ink"
          >
            𝕏
          </a>
          <a
            href={buildLineUrl(suggestion)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#06C755]/40 px-3 py-1.5 text-xs font-medium text-[#06C755] transition hover:bg-[#06C755]/5"
          >
            LINE
          </a>
        </div>
      </div>
    </article>
  );
}
