import type { AiResponse } from "./schema";

type AiSuggestion = AiResponse["suggestions"][number];

/** アレルギー＋避けたい食材を正規化して結合（trim・重複・空を除去） */
export function mergeBanned(allergies: string[], avoid: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of [...allergies, ...avoid]) {
    const t = w.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

/**
 * 案に含まれる禁止食材を返す（空配列なら違反なし）。
 * タイトル・説明・材料・手順・コンビニの買うものリストを横断的に検査。
 * アレルギーは安全側に倒し、部分一致で広めに検出する。
 */
export function findViolations(s: AiSuggestion, banned: string[]): string[] {
  if (!banned.length) return [];
  const haystack = [
    s.title,
    s.description,
    ...s.ingredients.map((i) => i.name),
    ...s.steps,
    ...(s.convenienceItems?.buyList ?? []),
  ].join(" ");
  return banned.filter((b) => haystack.includes(b));
}
