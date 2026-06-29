"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ShoppingItem } from "@/lib/types";
import {
  getShopping,
  toggleShoppingChecked,
  removeShoppingItem,
  clearShopping,
} from "@/lib/storage";
import { SavedNav } from "@/components/SavedNav";

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setItems(getShopping());
  }, []);

  const toggle = (name: string) => {
    toggleShoppingChecked(name);
    setItems(getShopping());
  };
  const del = (name: string) => {
    removeShoppingItem(name);
    setItems(getShopping());
  };
  const clearAll = () => {
    clearShopping();
    setItems([]);
  };
  const copyList = async (list: ShoppingItem[]) => {
    const lines = list.map(
      (it) => `${it.checked ? "✓" : "□"} ${it.name}（${it.amount}）`,
    );
    const text = `🛒 買い物リスト\n\n${lines.join("\n")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remaining = items?.filter((i) => !i.checked).length ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="mb-6 text-2xl font-bold text-ink">保存したもの</h1>
      <SavedNav />

      {items === null ? (
        <p className="py-16 text-center text-sm text-ink-soft">読み込み中…</p>
      ) : items.length === 0 ? (
        <div className="mx-auto max-w-md animate-rise rounded-4xl border border-line bg-surface px-6 py-16 text-center">
          <div className="text-5xl">🛒</div>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            買い物リストは空です。
            <br />
            献立の「🛒 買い物リストへ」で食材を追加できます。
          </p>
          <Link
            href="/create"
            className="mt-6 inline-block rounded-full bg-coral px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-coral-deep"
          >
            献立をつくる
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-4xl border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-3 text-xs text-ink-soft">
            <span>残り {remaining} 品</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => copyList(items)}
                className="transition hover:text-sage-deep"
              >
                {copied ? "✓ コピーしました" : "📋 コピー"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="transition hover:text-coral-deep"
              >
                すべて消す
              </button>
            </div>
          </div>
          <ul className="divide-y divide-line">
            {items.map((it) => (
              <li
                key={it.name}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <button
                  type="button"
                  onClick={() => toggle(it.name)}
                  aria-label={`${it.name} をチェック`}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs transition ${
                    it.checked
                      ? "border-sage bg-sage text-white"
                      : "border-line text-transparent"
                  }`}
                >
                  ✓
                </button>
                <span
                  className={`flex-1 text-sm ${
                    it.checked ? "text-ink-soft line-through" : "text-ink"
                  }`}
                >
                  {it.name}
                </span>
                <span className="text-xs text-ink-soft">{it.amount}</span>
                <button
                  type="button"
                  onClick={() => del(it.name)}
                  className="px-1 text-ink-soft transition hover:text-coral-deep"
                  aria-label={`${it.name} を削除`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
