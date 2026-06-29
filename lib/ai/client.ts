import { randomUUID } from "crypto";
import type { MealSuggestion } from "../types";
import { aiResponseSchema, type RequestSchema, type AiResponse } from "./schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import { buildMockSuggestions } from "./mock";
import { mergeBanned, findViolations } from "./safety";
import { fetchFoodImage } from "../unsplash";

type AiSuggestion = AiResponse["suggestions"][number];

/**
 * 献立を最大3案生成する。
 * - GEMINI_API_KEY 未設定 or AI_PROVIDER=mock のときはモックを返す（無料・キー不要で動作）。
 * - 生成後、アレルギー/避けたい食材を**サーバー側で再チェックして除外**（AI任せにしない）。
 *   除外で3案に満たない場合、実APIなら1回だけ補充生成する。
 */
export async function generateMeals(
  input: RequestSchema,
): Promise<MealSuggestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const provider = process.env.AI_PROVIDER ?? "gemini";
  const useMock = !apiKey || provider === "mock";

  const raw = await getSuggestions(input, apiKey, useMock);

  const banned = mergeBanned(input.allergies, input.avoidIngredients);
  if (!banned.length) return withImages(raw);

  // 禁止食材を含む案を除外（安全最優先）
  let safe = raw.filter((s) => findViolations(s, banned).length === 0);

  // 3案に満たず、実APIが使えるなら1回だけ補充生成
  if (safe.length < 3 && !useMock && apiKey) {
    try {
      const more = await callGemini(input, apiKey);
      for (const s of more) {
        if (safe.length >= 3) break;
        if (
          findViolations(s, banned).length === 0 &&
          !safe.some((x) => x.title === s.title)
        ) {
          safe.push(s);
        }
      }
    } catch (e) {
      console.error("[generateMeals] 補充生成に失敗:", e);
    }
  }

  const removed = raw.length - raw.filter((s) => findViolations(s, banned).length === 0).length;
  if (removed > 0) {
    console.log(
      `[safety] 禁止食材により ${removed} 件除外（banned: ${banned.join("、")}）`,
    );
  }

  return withImages(safe.slice(0, 3));
}

/** Gemini（失敗時は再試行→mock）またはmockから生の3案を得る */
async function getSuggestions(
  input: RequestSchema,
  apiKey: string | undefined,
  useMock: boolean,
): Promise<AiSuggestion[]> {
  if (useMock || !apiKey) return buildMockSuggestions(input);
  try {
    return await callGemini(input, apiKey);
  } catch (e) {
    console.error("[generateMeals] Gemini 1回目失敗。再試行します:", e);
    try {
      return await callGemini(input, apiKey);
    } catch (e2) {
      console.error(
        "[generateMeals] Gemini 2回目も失敗。モックにフォールバックします:",
        e2,
      );
      return buildMockSuggestions(input);
    }
  }
}

async function callGemini(
  input: RequestSchema,
  apiKey: string,
): Promise<AiSuggestion[]> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: buildUserPrompt(input) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.9,
        maxOutputTokens: 8192,
        // コスト最適化：GEMINI_THINKING_BUDGET=0 で思考トークンを無効化（2.5系）
        ...(process.env.GEMINI_THINKING_BUDGET !== undefined
          ? {
              thinkingConfig: {
                thinkingBudget: Number(process.env.GEMINI_THINKING_BUDGET),
              },
            }
          : {}),
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const usage = data?.usageMetadata;
  if (usage) {
    console.log(
      `[callGemini] tokens in=${usage.promptTokenCount} out=${usage.candidatesTokenCount} total=${usage.totalTokenCount}`,
    );
  }
  const candidate = data?.candidates?.[0];
  const finishReason = candidate?.finishReason;
  const text: string | undefined = candidate?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(
      `Gemini API: 空のレスポンス (finishReason=${finishReason ?? "unknown"})`,
    );
  }
  if (finishReason && finishReason !== "STOP") {
    console.warn(`[callGemini] finishReason=${finishReason}（出力が不完全な可能性）`);
  }

  const json = JSON.parse(stripCodeFence(text));
  const parsed = aiResponseSchema.parse(json);
  return parsed.suggestions;
}

/** responseMimeType未対応時などに ```json ... ``` で返るケースを除去 */
function stripCodeFence(s: string): string {
  const t = s.trim();
  if (t.startsWith("```")) {
    return t
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  return t;
}

async function withImages(suggestions: AiSuggestion[]): Promise<MealSuggestion[]> {
  return Promise.all(
    suggestions.map(async (s) => {
      const img = await fetchFoodImage(s.imageTag || s.title);
      return {
        ...s,
        id: randomUUID(),
        convenienceItems: s.convenienceItems ?? null,
        imageUrl: img?.url ?? null,
        imageCredit: img ? { name: img.creditName, url: img.creditUrl } : null,
      };
    }),
  );
}
