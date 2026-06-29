"use client";

import { useState, type KeyboardEvent } from "react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** 単一選択のピル型セグメント */
export function SegmentGroup<T extends string>({
  options,
  labels,
  value,
  onChange,
}: {
  options: T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cx(
              "rounded-full border px-4 py-2.5 text-sm transition",
              active
                ? "border-coral bg-coral text-white shadow-soft"
                : "border-line bg-surface text-ink hover:border-coral/50",
            )}
          >
            {labels[opt]}
          </button>
        );
      })}
    </div>
  );
}

/** 複数選択チップ */
export function MultiChips<T extends string>({
  options,
  labels,
  values,
  onToggle,
}: {
  options: T[];
  labels: Record<T, string>;
  values: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cx(
              "rounded-full border px-4 py-2 text-sm transition",
              active
                ? "border-sage bg-sage-soft text-sage-deep"
                : "border-line bg-surface text-ink hover:border-sage/50",
            )}
          >
            {active ? "✓ " : ""}
            {labels[opt]}
          </button>
        );
      })}
    </div>
  );
}

/** 食材などのタグ入力（Enter / カンマで追加、×で削除） */
export function TagInput({
  values,
  onChange,
  placeholder,
  accent = "sage",
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  accent?: "sage" | "coral";
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const t = draft.trim().replace(/,$/, "");
    if (t && !values.includes(t)) onChange([...values, t]);
    setDraft("");
  };
  const remove = (t: string) => onChange(values.filter((v) => v !== t));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && values.length) {
      remove(values[values.length - 1]);
    }
  };

  const chipClass =
    accent === "coral"
      ? "bg-coral-soft text-coral-deep"
      : "bg-sage-soft text-sage-deep";

  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface px-3 py-2.5 focus-within:border-coral/60">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {values.map((t) => (
          <span
            key={t}
            className={cx(
              "flex max-w-full items-center gap-1 rounded-full px-3 py-1 text-sm",
              chipClass,
            )}
          >
            <span className="min-w-0 truncate">{t}</span>
            <button
              type="button"
              onClick={() => remove(t)}
              className="text-current/70 hover:text-current"
              aria-label={`${t} を削除`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={values.length ? "" : placeholder}
          className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-ink-soft/70 sm:min-w-[8rem]"
        />
      </div>
    </div>
  );
}

/** スライダー＋現在値表示 */
export function SliderField({
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-coral-deep">
        {format(value)}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** フォームの1ブロック（ラベル＋必須バッジ＋中身） */
export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="text-[15px] font-bold text-ink">{label}</h3>
        {required && (
          <span className="rounded-full bg-coral-soft px-2 py-0.5 text-[10px] font-medium text-coral-deep">
            必須
          </span>
        )}
      </div>
      {hint && <p className="mb-2.5 text-xs text-ink-soft">{hint}</p>}
      {children}
    </div>
  );
}
