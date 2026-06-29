import { z } from "zod";

// ===== 入力（フォーム → API）の検証 =====
export const requestSchema = z.object({
  goal: z.enum(["reduce", "maintain", "muscle", "health"]),
  mealType: z.enum(["breakfast", "lunch", "dinner", "midnight"]),
  cookingStyle: z.enum(["jisui", "convenience", "deli", "eatout"]),
  useIngredients: z.array(z.string().min(1)).max(20).default([]),
  avoidIngredients: z.array(z.string().min(1)).max(20).default([]),
  cookTimeMax: z.number().int().min(5).max(120).default(15),
  budgetMax: z.number().int().min(100).max(5000).default(1000),
  hungerLevel: z.enum(["light", "normal", "hungry"]).default("normal"),
  nutritionPrefs: z
    .array(z.enum(["low_carb", "low_fat", "high_protein", "low_salt"]))
    .default([]),
  allergies: z.array(z.string().min(1)).max(20).default([]),
  note: z.string().max(500).default(""),
});

export type RequestSchema = z.infer<typeof requestSchema>;

// ===== AI出力の検証（生成結果の型安全） =====
const convenienceItemsSchema = z.object({
  buyList: z.array(z.string()),
  reason: z.string(),
  nutritionBalance: z.string(),
  avoidItems: z.array(z.string()),
});

export const aiSuggestionSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
  steps: z.array(z.string()),
  caloriesKcal: z.number(),
  proteinG: z.number(),
  fatG: z.number(),
  carbsG: z.number(),
  sugarG: z.number(),
  dietPoints: z.string(),
  cautions: z.string(),
  satietyScore: z.number().min(1).max(5),
  easinessScore: z.number().min(1).max(5),
  convenienceItems: convenienceItemsSchema.nullable().optional(),
  imageTag: z.string().optional().default(""),
});

export const aiResponseSchema = z.object({
  suggestions: z.array(aiSuggestionSchema).min(1),
});

export type AiResponse = z.infer<typeof aiResponseSchema>;
