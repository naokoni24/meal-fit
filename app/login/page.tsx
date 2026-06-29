"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
      else setSent(true);
    } catch {
      setError("ログイン機能が未設定です。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="rounded-4xl border border-line bg-surface p-7 shadow-card">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-coral-soft text-2xl">
            🍃
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">ログイン</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            ログインすると、お気に入りや履歴が
            <br />
            別の端末でも見られるようになります。
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <p className="mt-7 rounded-2xl bg-honey-soft/60 px-4 py-3 text-center text-xs leading-relaxed text-ink">
            ログイン機能はまだ準備中です。
            <br />
            いまは登録なしで、すべての機能をお使いいただけます。
          </p>
        ) : sent ? (
          <div className="mt-7 rounded-2xl bg-sage-soft/70 px-4 py-5 text-center text-sm leading-relaxed text-sage-deep">
            ✉️ <span className="font-bold">{email}</span> に
            <br />
            ログイン用リンクを送りました。
            <br />
            メールを開いてリンクをタップしてください。
          </div>
        ) : (
          <div className="mt-7 space-y-3">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="メールアドレス"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-sm outline-none placeholder:text-ink-soft/70 focus:border-coral/60"
            />
            {error && (
              <p className="rounded-2xl bg-coral-soft px-4 py-2.5 text-xs text-coral-deep">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={loading || !email.trim()}
              className="w-full rounded-full bg-coral px-6 py-3.5 text-base font-bold text-white shadow-soft transition hover:bg-coral-deep disabled:opacity-60"
            >
              {loading ? "送信中…" : "ログインリンクを送る"}
            </button>
            <p className="text-center text-xs text-ink-soft">
              パスワードは不要です（メールのリンクでログイン）
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-ink-soft hover:text-coral-deep">
            ← 登録せずに使う
          </Link>
        </div>
      </div>
    </div>
  );
}
