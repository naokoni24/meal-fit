// localStorage に保存する「お気に入り・買い物リスト・履歴」の共通ユーティリティ。
// 未ログイン運用の中心（確定方針：未ログインはDBに保存せず localStorage のみ）。
// クライアントからのみ呼ぶ（SSRでは no-op / fallback）。

import type {
  NutritionPref,
  MealSuggestion,
  Ingredient,
  ShoppingItem,
  HistoryEntry,
} from "./types";

const KEYS = {
  fav: "yorugohan:favorites",
  shop: "yorugohan:shopping",
  history: "yorugohan:history",
} as const;

const HISTORY_LIMIT = 50;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 容量超過などは黙って無視 */
  }
}

// ===== お気に入り =====
export function getFavorites(): MealSuggestion[] {
  return read<MealSuggestion[]>(KEYS.fav, []);
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

/** トグルして、新しい状態（保存中なら true）を返す */
export function toggleFavorite(s: MealSuggestion): boolean {
  const favs = getFavorites();
  const exists = favs.some((f) => f.id === s.id);
  const next = exists ? favs.filter((f) => f.id !== s.id) : [s, ...favs];
  write(KEYS.fav, next);
  return !exists;
}

export function removeFavorite(id: string): void {
  write(
    KEYS.fav,
    getFavorites().filter((f) => f.id !== id),
  );
}

// ===== 買い物リスト =====
export function getShopping(): ShoppingItem[] {
  return read<ShoppingItem[]>(KEYS.shop, []);
}

/** 材料を重複なくマージ追加し、最新リストを返す */
export function addIngredients(items: Ingredient[]): ShoppingItem[] {
  const list = getShopping();
  const merged = [...list];
  for (const it of items) {
    if (!merged.some((m) => m.name === it.name)) {
      merged.push({ name: it.name, amount: it.amount, checked: false });
    }
  }
  write(KEYS.shop, merged);
  return merged;
}

export function toggleShoppingChecked(name: string): void {
  write(
    KEYS.shop,
    getShopping().map((i) =>
      i.name === name ? { ...i, checked: !i.checked } : i,
    ),
  );
}

export function removeShoppingItem(name: string): void {
  write(
    KEYS.shop,
    getShopping().filter((i) => i.name !== name),
  );
}

export function clearShopping(): void {
  write(KEYS.shop, []);
}

// ===== 履歴 =====
export function getHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(KEYS.history, []);
}

export function addHistory(entry: HistoryEntry): void {
  const list = getHistory().filter((h) => h.id !== entry.id);
  write(KEYS.history, [entry, ...list].slice(0, HISTORY_LIMIT));
}

export function removeHistory(id: string): void {
  write(
    KEYS.history,
    getHistory().filter((h) => h.id !== id),
  );
}

export function clearHistory(): void {
  write(KEYS.history, []);
}

// ===== ユーザー設定（アレルギー・栄養方針などを次回も保持） =====
export interface UserPrefs {
  allergies: string[];
  avoidIngredients: string[];
  nutritionPrefs: NutritionPref[];
  cookTimeMax: number;
  budgetMax: number;
}

export function getPreferences(): Partial<UserPrefs> {
  return read<Partial<UserPrefs>>("yorugohan:prefs", {});
}

export function savePreferences(prefs: UserPrefs): void {
  write("yorugohan:prefs", prefs);
}
