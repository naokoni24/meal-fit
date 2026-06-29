// Supabase はオプショナル。環境変数が未設定なら認証/DBを無効化し、
// アプリは localStorage のみで従来どおり動作する（段階導入のため）。

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
