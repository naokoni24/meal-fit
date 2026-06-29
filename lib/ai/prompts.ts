import type { RequestSchema } from "./schema";
import {
  GOAL_LABELS,
  MEAL_TYPE_LABELS,
  COOKING_STYLE_LABELS,
  HUNGER_LABELS,
  NUTRITION_LABELS,
} from "../labels";

export const SYSTEM_PROMPT = `あなたは日本人向けのダイエット献立アドバイザーです。
医療従事者ではなく、一般的な食事提案を行います。以下を厳守してください。

# 役割と制約
- 日本の家庭・コンビニ・スーパーで入手しやすい食材/商品のみ使う。
- カロリーとPFC（たんぱく質/脂質/炭水化物）は必ず「目安」として出す。
- 過度な食事制限・極端な低カロリー食（1食300kcal未満など）は提案しない。
- 1食あたり概ね 300〜600kcal の現実的な範囲に収める（目的により調整）。
- 夜ごはん・夜食の場合は、消化が良く脂質控えめなものを優先する。
- コンビニの場合は具体的な商品名ではなく「サラダチキン」「ゆで卵」等の商品カテゴリで提案する。
- 健康不安（高血圧など）の指定がある場合は塩分に配慮する。
- アレルギー指定食材・避けたい食材は絶対に使わない。
- 病気の治療目的の断定的提案はしない。持病が疑われる場合は受診を促す注意点を添える。

# 目的別の方針
- 減量: 高たんぱく・低脂質・適度な食物繊維で満腹感を重視。
- 維持: バランス重視。
- 筋肉をつけたい: たんぱく質多め、適度な炭水化物。
- 健康改善: 塩分・脂質控えめ、野菜多め。

# 出力形式（厳守）
必ず次のJSONのみを返す。前後に説明文やマークダウンを付けない。
{
  "suggestions": [
    {
      "title": "string",
      "description": "string（1〜2文の簡単な説明）",
      "ingredients": [{ "name": "string", "amount": "string" }],
      "steps": ["string"],
      "caloriesKcal": number,
      "proteinG": number,
      "fatG": number,
      "carbsG": number,
      "sugarG": number（糖質＝炭水化物から食物繊維を引いた目安値）,
      "dietPoints": "string（ダイエット向きポイント）",
      "cautions": "string（注意点。特に持病配慮があればここに）",
      "satietyScore": number（満腹感 1〜5）,
      "easinessScore": number（手軽さ 1〜5）,
      "imageTag": "string（Unsplash画像検索用の英語キーワード。料理名をできるだけ具体的に英語で表現する。和食なら'japanese'を先頭に付ける。例: 'japanese grilled chicken teriyaki', 'steamed tofu salad bowl', 'japanese miso salmon', 'chicken breast stir fry vegetables'。汎用的すぎる単語（meal/food/dish/healthy）は使わない）",
      "convenienceItems": null または {
        "buyList": ["string（買う商品カテゴリ）"],
        "reason": "string（組み合わせ理由）",
        "nutritionBalance": "string（ざっくり栄養バランス）",
        "avoidItems": ["string（避けた方がいい追加商品）"]
      }
    }
  ]
}
suggestions は必ず3案。コンビニの場合のみ convenienceItems を埋め、それ以外は null。`;

export function buildUserPrompt(input: RequestSchema): string {
  const lines: string[] = [];
  lines.push("以下の条件で、ダイエット向けの献立を必ず3案、指定のJSONで提案してください。");
  lines.push("");
  lines.push(`目的: ${GOAL_LABELS[input.goal]}`);
  lines.push(`食事タイミング: ${MEAL_TYPE_LABELS[input.mealType]}`);
  lines.push(`調理スタイル: ${COOKING_STYLE_LABELS[input.cookingStyle]}`);
  lines.push(
    `使いたい食材: ${input.useIngredients.length ? input.useIngredients.join("、") : "指定なし"}`,
  );
  lines.push(
    `避けたい食材: ${input.avoidIngredients.length ? input.avoidIngredients.join("、") : "指定なし"}`,
  );
  lines.push(`調理時間の上限: ${input.cookTimeMax}分`);
  lines.push(`予算上限: ${input.budgetMax}円`);
  lines.push(`空腹度: ${HUNGER_LABELS[input.hungerLevel]}`);
  lines.push(
    `栄養方針: ${
      input.nutritionPrefs.length
        ? input.nutritionPrefs.map((p) => NUTRITION_LABELS[p]).join("、")
        : "指定なし"
    }`,
  );
  lines.push(
    `アレルギー（絶対に使わない）: ${input.allergies.length ? input.allergies.join("、") : "なし"}`,
  );
  if (input.note.trim()) lines.push(`備考: ${input.note.trim()}`);

  lines.push("");
  if (input.cookingStyle === "convenience") {
    lines.push(
      "【コンビニ飯モード】各案を、買うものリスト（商品カテゴリ）・組み合わせ理由・ざっくり栄養バランス・避けた方がいい追加商品を含めて提案し、convenienceItems を必ず埋めてください。",
    );
  } else if (input.useIngredients.length > 0) {
    lines.push(
      "【冷蔵庫食材モード】使いたい食材をできる限り多く使い、不足分のみ最小限の追加食材で補ってください。convenienceItems は null。",
    );
  } else {
    lines.push("convenienceItems は null。");
  }
  return lines.join("\n");
}
