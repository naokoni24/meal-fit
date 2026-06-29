"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  Goal,
  MealType,
  CookingStyle,
  HungerLevel,
  NutritionPref,
  MealRequestInput,
} from "@/lib/types";
import {
  GOAL_LABELS,
  MEAL_TYPE_LABELS,
  COOKING_STYLE_LABELS,
  HUNGER_LABELS,
  NUTRITION_LABELS,
  GOAL_OPTIONS,
  MEAL_TYPE_OPTIONS,
  COOKING_STYLE_OPTIONS,
  HUNGER_OPTIONS,
  NUTRITION_OPTIONS,
} from "@/lib/labels";
import {
  SegmentGroup,
  MultiChips,
  TagInput,
  SliderField,
  Field,
  cx,
} from "./ui";
import { addHistory, getPreferences, savePreferences } from "@/lib/storage";

export function MealForm() {
  const router = useRouter();

  const [goal, setGoal] = useState<Goal>("reduce");
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [cookingStyle, setCookingStyle] = useState<CookingStyle>("jisui");
  const [useIngredients, setUseIngredients] = useState<string[]>([]);
  const [avoidIngredients, setAvoidIngredients] = useState<string[]>([]);
  const [cookTimeMax, setCookTimeMax] = useState(15);
  const [budgetMax, setBudgetMax] = useState(1000);
  const [hungerLevel, setHungerLevel] = useState<HungerLevel>("normal");
  const [nutritionPrefs, setNutritionPrefs] = useState<NutritionPref[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState("");

  // ローディング中のドットアニメーション
  useEffect(() => {
    if (!loading) { setDots(""); return; }
    const steps = ["", "・", "・・", "・・・"];
    let i = 0;
    const id = setInterval(() => { i = (i + 1) % steps.length; setDots(steps[i]); }, 500);
    return () => clearInterval(id);
  }, [loading]);

  // 前回の設定を復元
  useEffect(() => {
    const prefs = getPreferences();
    if (prefs.allergies?.length) setAllergies(prefs.allergies);
    if (prefs.avoidIngredients?.length) setAvoidIngredients(prefs.avoidIngredients);
    if (prefs.nutritionPrefs?.length) setNutritionPrefs(prefs.nutritionPrefs);
    if (prefs.cookTimeMax !== undefined) setCookTimeMax(prefs.cookTimeMax);
    if (prefs.budgetMax !== undefined) setBudgetMax(prefs.budgetMax);
    if (prefs.allergies?.length || prefs.avoidIngredients?.length || prefs.nutritionPrefs?.length) {
      setShowMore(true);
    }
  }, []);

  const toggleNutrition = (p: NutritionPref) =>
    setNutritionPrefs((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  const submit = async () => {
    setLoading(true);
    setError(null);
    const input: MealRequestInput = {
      goal,
      mealType,
      cookingStyle,
      useIngredients,
      avoidIngredients,
      cookTimeMax,
      budgetMax,
      hungerLevel,
      nutritionPrefs,
      allergies,
      note,
    };
    try {
      const res = await fetch("/api/meals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "エラーが発生しました。");
        setLoading(false);
        return;
      }
      addHistory({
        id: data.requestId,
        input,
        suggestions: data.suggestions,
        createdAt: Date.now(),
      });
      savePreferences({ allergies, avoidIngredients, nutritionPrefs, cookTimeMax, budgetMax });
      sessionStorage.setItem(
        "yorugohan:result",
        JSON.stringify({ input, response: data }),
      );
      router.push("/result");
    } catch {
      setError("通信エラーが発生しました。電波の良い場所で再度お試しください。");
      setLoading(false);
    }
  };

  return (
    <div className="min-w-0 space-y-7">
      {/* 必須3項目 */}
      <section className="min-w-0 space-y-6 rounded-4xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <Field label="今日の目的は？" required>
          <SegmentGroup
            options={GOAL_OPTIONS}
            labels={GOAL_LABELS}
            value={goal}
            onChange={setGoal}
          />
        </Field>
        <Field label="どの食事？" required>
          <SegmentGroup
            options={MEAL_TYPE_OPTIONS}
            labels={MEAL_TYPE_LABELS}
            value={mealType}
            onChange={setMealType}
          />
        </Field>
        <Field
          label="どうやって用意する？"
          required
          hint="コンビニを選ぶと、買って組み合わせるだけの提案になります。"
        >
          <SegmentGroup
            options={COOKING_STYLE_OPTIONS}
            labels={COOKING_STYLE_LABELS}
            value={cookingStyle}
            onChange={setCookingStyle}
          />
        </Field>
      </section>

      {/* 詳しく設定（任意） */}
      <section className="min-w-0 overflow-hidden rounded-4xl border border-line bg-surface shadow-card">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left sm:px-7"
        >
          <span className="text-[15px] font-bold text-ink">
            もっと詳しく設定する
            <span className="ml-2 text-xs font-normal text-ink-soft">任意</span>
          </span>
          <span
            className={cx(
              "text-ink-soft transition",
              showMore && "rotate-180",
            )}
          >
            ⌄
          </span>
        </button>

        {showMore && (
          <div className="min-w-0 space-y-6 border-t border-line px-5 py-6 sm:px-7">
            <Field
              label="使いたい食材"
              hint="冷蔵庫にあるものを入れると、なるべく使った献立にします。"
            >
              <TagInput
                values={useIngredients}
                onChange={setUseIngredients}
                placeholder="例：鶏むね肉、キャベツ"
                accent="sage"
              />
            </Field>
            <Field label="避けたい食材">
              <TagInput
                values={avoidIngredients}
                onChange={setAvoidIngredients}
                placeholder="例：きのこ"
                accent="coral"
              />
            </Field>
            <Field label="調理時間">
              <SliderField
                value={cookTimeMax}
                onChange={setCookTimeMax}
                min={5}
                max={60}
                step={5}
                format={(v) => (v >= 60 ? "60分以上でもOK" : `${v}分くらいまで`)}
              />
            </Field>
            <Field label="予算">
              <SliderField
                value={budgetMax}
                onChange={setBudgetMax}
                min={300}
                max={2000}
                step={100}
                format={(v) => `〜${v.toLocaleString()}円`}
              />
            </Field>
            <Field label="空腹度">
              <SegmentGroup
                options={HUNGER_OPTIONS}
                labels={HUNGER_LABELS}
                value={hungerLevel}
                onChange={setHungerLevel}
              />
            </Field>
            <Field label="栄養の希望（複数OK）">
              <MultiChips
                options={NUTRITION_OPTIONS}
                labels={NUTRITION_LABELS}
                values={nutritionPrefs}
                onToggle={toggleNutrition}
              />
            </Field>
            <Field
              label="アレルギー"
              hint="入力した食材は提案に使いません。"
            >
              <TagInput
                values={allergies}
                onChange={setAllergies}
                placeholder="例：卵、乳、小麦"
                accent="coral"
              />
            </Field>
            <Field label="その他の希望（自由記入）">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="例：夜遅いので消化の良いものがいいです"
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none placeholder:text-ink-soft/70 focus:border-coral/60"
              />
            </Field>
          </div>
        )}
      </section>

      {error && (
        <p className="rounded-2xl bg-coral-soft px-4 py-3 text-sm text-coral-deep">
          {error}
        </p>
      )}

      {/* CTA */}
      <div className="sticky bottom-4 z-10">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full rounded-full bg-coral px-6 py-4 text-base font-bold text-white shadow-soft transition hover:bg-coral-deep disabled:opacity-80"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span>考えています<span className="inline-block w-6 text-left">{dots}</span></span>
              <span className="flex items-end gap-1">
                {(["🍙", "🥦", "🐟", "🥚"] as const).map((emoji, i) => (
                  <span
                    key={emoji}
                    className="animate-pop text-lg"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    {emoji}
                  </span>
                ))}
              </span>
            </span>
          ) : (
            "AIに献立を提案してもらう"
          )}
        </button>
        <p className="mt-2 text-center text-xs text-ink-soft">
          無料・登録なしで使えます（1日3回まで）
        </p>
      </div>
    </div>
  );
}
