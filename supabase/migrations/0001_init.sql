-- 夜ごはんAI 初期スキーマ（MVP）
-- 方針：未ログインは localStorage のみ。ログインユーザーのデータだけをここに保存する。
-- localStorage と 1:1 でマージしやすいよう、提案系は JSONB で保持（設計書の正規化版は将来）。
-- 全テーブル RLS 有効。ユーザーは自分の行のみ参照・更新可能。

-- ===== profiles（auth.users 拡張）=====
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- 新規ユーザー作成時に profile を自動生成
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== favorites（お気に入り：献立1案をJSONBで保持）=====
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  suggestion jsonb not null, -- MealSuggestion 全体
  -- 同一献立(suggestion.id)の重複保存を防ぐ
  suggestion_id text generated always as (suggestion ->> 'id') stored,
  created_at timestamptz not null default now(),
  unique (user_id, suggestion_id)
);

alter table public.favorites enable row level security;

drop policy if exists "own favorites" on public.favorites;
create policy "own favorites" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists favorites_user_created_idx
  on public.favorites (user_id, created_at desc);

-- ===== history（履歴：入力条件＋提案3案をJSONBで保持）=====
create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  request_id text, -- クライアント生成の requestId（重複マージ用）
  input jsonb not null, -- MealRequestInput
  suggestions jsonb not null, -- MealSuggestion[]
  created_at timestamptz not null default now(),
  unique (user_id, request_id)
);

alter table public.history enable row level security;

drop policy if exists "own history" on public.history;
create policy "own history" on public.history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists history_user_created_idx
  on public.history (user_id, created_at desc);

-- ===== shopping_items（買い物リスト）=====
create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount text,
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.shopping_items enable row level security;

drop policy if exists "own shopping" on public.shopping_items;
create policy "own shopping" on public.shopping_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
