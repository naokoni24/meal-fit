import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./config";
import { createClient } from "./server";

/** ログイン中のユーザーを返す。未設定/未ログインなら null。 */
export async function getUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}
