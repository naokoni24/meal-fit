// 入力値 → 日本語表示ラベル（フォーム選択肢・プロンプト生成で共用）

import type {
  Goal,
  MealType,
  CookingStyle,
  HungerLevel,
  NutritionPref,
} from "./types";

export const GOAL_LABELS: Record<Goal, string> = {
  reduce: "減量したい",
  maintain: "今の体型を維持",
  muscle: "筋肉をつけたい",
  health: "健康を改善したい",
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "朝ごはん",
  lunch: "昼ごはん",
  dinner: "夜ごはん",
  midnight: "夜食",
};

export const COOKING_STYLE_LABELS: Record<CookingStyle, string> = {
  jisui: "自炊する",
  convenience: "コンビニ・惣菜",
  eatout: "外食",
};

export const HUNGER_LABELS: Record<HungerLevel, string> = {
  light: "軽め",
  normal: "普通",
  hungry: "がっつり",
};

export const NUTRITION_LABELS: Record<NutritionPref, string> = {
  low_carb: "糖質控えめ",
  low_fat: "脂質控えめ",
  high_protein: "高たんぱく",
  low_salt: "塩分控えめ",
};

export const GOAL_OPTIONS = Object.keys(GOAL_LABELS) as Goal[];
export const MEAL_TYPE_OPTIONS = Object.keys(MEAL_TYPE_LABELS) as MealType[];
export const COOKING_STYLE_OPTIONS = Object.keys(
  COOKING_STYLE_LABELS,
) as CookingStyle[];
export const HUNGER_OPTIONS = Object.keys(HUNGER_LABELS) as HungerLevel[];
export const NUTRITION_OPTIONS = Object.keys(NUTRITION_LABELS) as NutritionPref[];
