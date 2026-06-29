// アプリ全体で共有する型定義（AI ↔ API ↔ UI は camelCase で統一）

export type Goal = "reduce" | "maintain" | "muscle" | "health";
export type MealType = "breakfast" | "lunch" | "dinner" | "midnight";
export type CookingStyle = "jisui" | "convenience" | "deli" | "eatout";
export type HungerLevel = "light" | "normal" | "hungry";
export type NutritionPref = "low_carb" | "low_fat" | "high_protein" | "low_salt";

/** 献立作成フォームの入力（= meal_requests の元データ） */
export interface MealRequestInput {
  goal: Goal;
  mealType: MealType;
  cookingStyle: CookingStyle;
  useIngredients: string[];
  avoidIngredients: string[];
  cookTimeMax: number; // 分
  budgetMax: number; // 円
  hungerLevel: HungerLevel;
  nutritionPrefs: NutritionPref[];
  allergies: string[];
  note: string;
}

export interface Ingredient {
  name: string;
  amount: string;
}

/** コンビニ飯モード専用の追加情報 */
export interface ConvenienceItems {
  buyList: string[];
  reason: string;
  nutritionBalance: string;
  avoidItems: string[];
}

/** AIが返す献立1案（id/imageUrl はサーバーで付与） */
export interface MealSuggestion {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  caloriesKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  sugarG: number;
  dietPoints: string;
  cautions: string;
  satietyScore: number; // 1-5
  easinessScore: number; // 1-5
  convenienceItems: ConvenienceItems | null;
  imageUrl: string | null;
  imageCredit: { name: string; url: string } | null;
}

export interface GenerateResponse {
  requestId: string;
  suggestions: MealSuggestion[];
  disclaimer: string;
}

/** 買い物リストの1項目（localStorage保存） */
export interface ShoppingItem {
  name: string;
  amount: string;
  checked: boolean;
}

/** 履歴の1エントリ（localStorage保存：入力条件＋提案3案） */
export interface HistoryEntry {
  id: string; // requestId
  input: MealRequestInput;
  suggestions: MealSuggestion[];
  createdAt: number; // epoch ms
}

export const DISCLAIMER =
  "カロリー・栄養素は目安です。本アプリは医療アドバイスではありません。持病（高血圧・糖尿病・腎臓病など）がある場合は医師・管理栄養士にご相談ください。";
