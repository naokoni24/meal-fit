import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requestSchema } from "@/lib/ai/schema";
import { generateMeals } from "@/lib/ai/client";
import { DISCLAIMER } from "@/lib/types";

export const runtime = "nodejs";

// ===== 簡易レート制限（MVP）=====
// 本番は Vercel KV / Supabase でユーザー・IP単位に永続化する。
// サーバーレスではメモリが揮発するため、これは暫定の体裁。
const hits = new Map<string, { count: number; day: string }>();

function rateLimited(key: string, limit: number): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const cur = hits.get(key);
  if (!cur || cur.day !== day) {
    hits.set(key, { count: 1, day });
    return false;
  }
  if (cur.count >= limit) return true;
  cur.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("invalid_json", "リクエストが不正です。", 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("validation_error", "入力内容を確認してください。", 400);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const limit = Number(process.env.RATE_LIMIT_ANON ?? 3);
  if (rateLimited(`gen:${ip}`, limit)) {
    return errorResponse(
      "rate_limited",
      "本日の無料利用上限に達しました。また明日お試しください。",
      429,
    );
  }

  try {
    const suggestions = await generateMeals(parsed.data);
    return NextResponse.json({
      requestId: randomUUID(),
      suggestions,
      disclaimer: DISCLAIMER,
    });
  } catch {
    return errorResponse(
      "ai_error",
      "献立の生成に失敗しました。少し時間をおいて再度お試しください。",
      500,
    );
  }
}

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}
