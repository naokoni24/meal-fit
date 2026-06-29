# 夜ごはんAI 設計書（MVP）

> AI献立・ダイエットごはん提案Webアプリ
> このアプリは医療アドバイスではなく、一般的な食事提案アプリです。カロリー・栄養素はすべて「目安」です。

> **確定事項（2026-06-29）**
> - AIプロバイダ：**Gemini を主軸**（`lib/ai/client.ts` で抽象化し OpenAI へ将来切替可能）
> - 未ログインユーザーの保存・履歴：**localStorage のみ**（DBには保存しない。ログイン後はDB保存）
> - 運用方針：**無料運用**（Gemini無料ティア＋Supabase Free＋Vercel Hobby）。レート制限・キャッシュ・画像生成なしで無料枠内に収める（詳細はセクション13）

---

## 1. アプリの概要

「夜ごはんAI」は、ユーザーが目的・食事タイプ・調理スタイル・手元の食材などを入力すると、AIがダイエット向けの献立を3案提案するWebアプリ。自炊・コンビニ・冷蔵庫の食材、それぞれの状況に合わせて「今すぐ実行できる」現実的な食事を返す。スマホファーストで、40代以上でも迷わない大きめのUI・余白の多いApple風デザインを採用する。

**プロダクトの3本柱**
1. 献立提案（自炊前提の基本モード）
2. コンビニ飯モード（買い物リスト型）
3. 冷蔵庫食材モード（手持ち食材活用型）

これに「買い物リスト生成」「お気に入り保存」を加えた5機能がMVP。

---

## 2. ターゲットユーザー

| ペルソナ | 状況 | 一番のニーズ |
|---|---|---|
| 残業ワーカー（30〜40代） | 夜遅く帰宅、太りたくない | 消化が良く低カロリーな夜ごはん |
| 自炊が苦手な人 | 料理スキル低い | 手順が少なく失敗しない献立 |
| コンビニ常連 | 自炊しない | 買う商品の組み合わせ提案 |
| 冷蔵庫を使い切りたい人 | 食材を余らせがち | 手持ち食材ベースの献立 |
| 健康意識の高い40代以上 | 数値も気にする | カロリー/PFC/塩分の目安 |

**共通する心理**: 「考えたくない」「失敗したくない」「健康に悪いことはしたくない」。
→ 入力を最小限にし、デフォルト値を賢く設定することが重要。

---

## 3. 解決する課題

- **意思決定疲れ**: 毎日「何を食べるか」を考えるのがしんどい → 3案に絞って提示。
- **情報過多**: ネットのレシピは量も難易度もバラバラ → ダイエット軸・手軽さ軸で最適化。
- **栄養の不透明さ**: 何を食べるとどれだけ太るか分からない → カロリー/PFCの目安を可視化。
- **自炊ハードル**: 作るのが面倒 → コンビニ/惣菜/冷蔵庫モードで逃げ道を用意。
- **続かない**: 極端な制限でリバウンド → 安全で現実的な提案に限定。

---

## 4. MVP機能一覧

1. **献立提案機能** — 条件入力 → AIが3献立案（メニュー名・説明・材料・作り方・カロリー・P/F/C・ダイエットポイント・注意点・満腹感スコア・手軽さスコア）。
2. **コンビニ飯モード** — 買うものリスト・組み合わせ理由・ざっくり栄養バランス・避けた方がいい追加商品。
3. **冷蔵庫食材モード** — 手持ち食材を最大限使った献立提案。
4. **買い物リスト生成** — 提案献立から必要食材を抽出してリスト化。
5. **お気に入り保存** — 気に入った献立を保存・一覧表示。

補助: 履歴ページ（過去の提案を確認）、注意書き（免責）表示。

---

## 5. 将来機能一覧（拡張設計の前提）

| 機能 | 設計上の備え |
|---|---|
| 1週間の献立作成 | `meal_suggestions` に `plan_id` / `day_index` 列を将来追加できる構造 |
| 体重記録 | `weight_logs` テーブルを後付け |
| 食事履歴・カロリー管理 | `meal_history` を集計可能な形で保持 |
| LINE/メール通知 | 通知設定列＋ジョブ基盤（後付けのWebhook/Cron） |
| PDF出力 | 結果データをJSONで保持しているのでサーバー側生成可能 |
| ユーザー登録 | MVPから Supabase Auth を組み込み（匿名利用も可） |
| 有料プラン | `subscriptions` テーブル＋Stripe（MVPは未実装） |
| AIチャット相談 | `meal_requests` を会話文脈として再利用 |
| スーパー買い物リスト自動生成 | 食材正規化テーブル（`ingredients_master`）を将来追加 |
| 外食メニュー選択サポート | `cooking_style = 'eatout'` を提案ロジックに追加 |
| 健診結果に合わせた提案 | `health_profile`（JSONB）に検査値を保持 |

---

## 6. 画面構成

```
/                 トップページ（LP）
/create           献立作成ページ（入力フォーム）
/result           結果ページ（3案カード表示）
/favorites        お気に入りページ
/history          履歴ページ
/about            注意事項・免責（フッターリンク）
/login            ログイン（Supabase Auth、任意）
```

### 6-1. トップページ
- ヒーロー（キャッチコピー＋サブコピー＋「無料で試す」CTA）
- サービス説明（3行）
- 利用シーン（夜遅い/自炊苦手/コンビニ/冷蔵庫の4カード）
- 使い方3ステップ（①条件を選ぶ ②AIが提案 ③作る or 買う）
- サンプル献立（カード2〜3枚、静的データでOK）
- 注意書き（医療目的でない旨）
- フッター

**キャッチコピー案**
1. 「今夜、何食べる？」をAIにまかせよう。
2. 太らない夜ごはん、3秒で決まる。
3. 冷蔵庫の中身で、ダイエットごはん。
4. 我慢じゃなくて、選ぶダイエット。
5. コンビニでも、ちゃんと痩せる。
6. 考えない。でも、ちゃんと健康。
7. 40代からの「軽い夜ごはん」習慣。

### 6-2. 献立作成ページ（入力フォーム）
| 項目 | UI | 必須 | デフォルト |
|---|---|---|---|
| 食事の目的 | セグメント（減量/維持/筋肉/健康改善） | ○ | 減量 |
| 食事タイプ | セグメント（朝/昼/夜/夜食） | ○ | 夜 |
| 調理スタイル | カード選択（自炊/コンビニ/スーパー惣菜/外食） | ○ | 自炊 |
| 使いたい食材 | タグ入力 | × | 空 |
| 避けたい食材 | タグ入力 | × | 空 |
| 調理時間 | スライダー（5/10/15/30分以上） | × | 15分 |
| 予算 | スライダー（〜500/〜1000/〜1500円） | × | 〜1000円 |
| 空腹度 | セグメント（軽め/普通/がっつり） | × | 普通 |
| 栄養方針 | 複数選択チップ（糖質控えめ/脂質控えめ/高たんぱく/塩分控えめ） | × | 空 |
| アレルギー | タグ入力（卵/乳/小麦/そば/落花生/えび/かに等） | × | 空 |
| 備考 | テキストエリア | × | 空 |

→ 入力の手間を減らすため、**目的・食事タイプ・調理スタイルの3つだけで提案可能**にし、残りは「詳しく設定」アコーディオン内に格納。

### 6-3. 結果ページ
- 3案を縦並びカード（スマホ）/横並び（PC）
- 各カード: メニュー名・画像枠（MVPはプレースホルダ）・カロリー目安・PFCバランス（バーまたはドーナツ）・材料・作り方（折りたたみ）・ダイエット向きポイント・満腹感/手軽さスコア（★）
- アクション: 「買い物リストに追加」「お気に入り保存」「もう一度提案（再生成）」
- コンビニモードは「買うものリスト」「避けた方がいい商品」を専用表示

### 6-4. お気に入りページ
- 保存献立のカードグリッド、タップで詳細、削除可能。

### 6-5. 履歴ページ
- 日付ごとに「入力条件＋提案サマリ」を時系列リスト表示、タップで結果再表示。

---

## 7. ユーザーフロー

```
[トップ] —「無料で試す」→ [献立作成]
   ↓ 条件入力して「提案する」
[POST /api/meals/generate] —（AI呼び出し）→ [結果ページ：3案]
   ├─「お気に入り保存」→ favorite_meals に保存
   ├─「買い物リストに追加」→ 食材抽出 → リスト表示
   └─「もう一度提案」→ 同条件で再生成
[履歴] ← meal_requests / meal_history から再表示
```

- 認証は任意。未ログインでも提案は使える（保存・履歴はログイン後 or ローカル保存）。
- 初回は「お気に入り保存」時にログインを促す（コンバージョン地点）。

---

## 8. UI/UX方針

- **スマホファースト**: 1カラム、親指で届く下部固定CTA。
- **大きめUI**: 本文16px以上、タップ領域44px以上、コントラスト確保（40代以上配慮）。
- **余白多め（Apple風）**: 白背景ベース、セクション間に十分な余白。
- **カラー**: ベース＝白/オフホワイト、アクセント＝グリーン（健康）、オレンジ（食欲）、ベージュ（やさしさ）。
  - 例: primary `#4CAF7D`（緑）、accent `#F0974A`（オレンジ）、bg `#FAF8F4`（ベージュ寄り白）、text `#2E2E2E`。
- **やさしいトーン**: 角丸（rounded-2xl）、やわらかい影、絵文字や手描き風アイコンを控えめに。
- **迷わせない**: 入力は最小から、専門用語にはツールチップ、エラーは日本語で具体的に。
- **ローディング演出**: AI生成中はスケルトン＋「献立を考えています…」。
- **アクセシビリティ**: ラベル付きフォーム、フォーカスリング、`prefers-reduced-motion` 対応。

---

## 9. データベース設計（Supabase / PostgreSQL）

すべてのテーブルで **RLS（Row Level Security）有効**。`user_id` は `auth.users.id` を参照。

**匿名利用の扱い（確定）**: 未ログインユーザーのデータは **DBに保存せず localStorage のみ** に持つ。したがって `meal_requests` / `meal_suggestions` / `favorite_meals` / `meal_history` / `shopping_list_items` は **ログインユーザーのみ** が対象（`user_id` は NOT NULL で運用）。`anon_id` 列は MVP では不要（将来サーバー保存に切り替える場合に追加）。未ログイン時の生成結果は API レスポンスをそのまま localStorage に保存し、ログイン時にDBへマージする。

### users（プロフィール拡張）
> Supabase Auth の `auth.users` とは別に、アプリ用プロフィールを持つ。

| カラム | 型 | 役割 |
|---|---|---|
| id | uuid (PK, = auth.users.id) | ユーザーID |
| email | text | メール（参照用） |
| display_name | text | 表示名 |
| health_profile | jsonb | 健康配慮（高血圧/糖尿病など自己申告フラグ。将来の検査値も格納） |
| default_prefs | jsonb | フォーム初期値（目的・栄養方針など） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### meal_requests（提案リクエスト＝入力条件）
| カラム | 型 | 役割 |
|---|---|---|
| id | uuid (PK) | リクエストID |
| user_id | uuid (FK→users, NOT NULL) | ユーザー（未ログインはDB保存しないため必須） |
| goal | text | 目的（reduce/maintain/muscle/health） |
| meal_type | text | 朝/昼/夜/夜食（breakfast/lunch/dinner/midnight） |
| cooking_style | text | jisui/convenience/deli/eatout |
| use_ingredients | text[] | 使いたい食材 |
| avoid_ingredients | text[] | 避けたい食材 |
| cook_time_max | int | 調理時間上限（分） |
| budget_max | int | 予算上限（円） |
| hunger_level | text | light/normal/hungry |
| nutrition_prefs | text[] | low_carb/low_fat/high_protein/low_salt |
| allergies | text[] | アレルギー |
| note | text | 備考 |
| created_at | timestamptz | 作成日時 |

### meal_suggestions（AIが返した献立1件＝3案ならparent単位で3行）
| カラム | 型 | 役割 |
|---|---|---|
| id | uuid (PK) | 献立ID |
| request_id | uuid (FK→meal_requests) | 元リクエスト |
| user_id | uuid (null可) | ユーザー（検索高速化のため非正規化） |
| title | text | メニュー名 |
| description | text | 簡単な説明 |
| ingredients | jsonb | 材料 [{name, amount}] |
| steps | jsonb | 作り方 [string] |
| calories_kcal | int | 目安カロリー |
| protein_g | numeric | たんぱく質(g) |
| fat_g | numeric | 脂質(g) |
| carbs_g | numeric | 炭水化物(g) |
| diet_points | text | ダイエット向きポイント |
| cautions | text | 注意点 |
| satiety_score | int (1-5) | 満腹感スコア |
| easiness_score | int (1-5) | 手軽さスコア |
| convenience_items | jsonb (null可) | コンビニモード用：買うものリスト・避けた方がいい商品 |
| image_url | text (null可) | 画像（将来の生成用） |
| created_at | timestamptz | 作成日時 |

### favorite_meals（お気に入り）
| カラム | 型 | 役割 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (FK→users) | ユーザー |
| suggestion_id | uuid (FK→meal_suggestions) | 献立 |
| created_at | timestamptz | 保存日時 |

> UNIQUE(user_id, suggestion_id) で重複保存防止。

### meal_history（履歴）
| カラム | 型 | 役割 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (null可) | ユーザー |
| request_id | uuid (FK→meal_requests) | 入力条件 |
| suggestion_ids | uuid[] | 提案された3案 |
| selected_suggestion_id | uuid (null可) | 実際に選んだ献立 |
| created_at | timestamptz | 日時 |

### shopping_list_items（買い物リスト：MVPで必要）
| カラム | 型 | 役割 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (null可) | ユーザー |
| suggestion_id | uuid (FK) | 由来の献立 |
| name | text | 食材名 |
| amount | text | 分量 |
| checked | bool | 購入済みフラグ |
| created_at | timestamptz | 日時 |

**RLSポリシー例（favorite_meals）**
```sql
alter table favorite_meals enable row level security;
create policy "own rows" on favorite_meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## 10. API設計（Next.js API Routes / Route Handlers）

すべて `/app/api/...` 配下。レスポンスは JSON。AIキーはサーバー側のみ。

| メソッド | パス | 役割 | 主要パラメータ |
|---|---|---|---|
| POST | `/api/meals/generate` | 条件から3献立を生成 | meal_request の全項目 |
| POST | `/api/meals/regenerate` | 同条件で再生成 | request_id |
| GET | `/api/meals/:id` | 献立1件取得 | - |
| POST | `/api/favorites` | お気に入り保存 | suggestion_id |
| DELETE | `/api/favorites/:id` | お気に入り削除 | - |
| GET | `/api/favorites` | お気に入り一覧 | - |
| GET | `/api/history` | 履歴一覧 | page |
| POST | `/api/shopping-list` | 献立から買い物リスト生成 | suggestion_id |
| GET | `/api/shopping-list` | 買い物リスト取得 | - |
| PATCH | `/api/shopping-list/:id` | チェック状態更新 | checked |

**`POST /api/meals/generate` リクエスト例**
```json
{
  "goal": "reduce",
  "meal_type": "dinner",
  "cooking_style": "jisui",
  "use_ingredients": ["鶏むね肉", "キャベツ"],
  "avoid_ingredients": [],
  "cook_time_max": 15,
  "budget_max": 1000,
  "hunger_level": "normal",
  "nutrition_prefs": ["high_protein", "low_carb"],
  "allergies": [],
  "note": "夜遅いので消化の良いもの"
}
```

**レスポンス例**
```json
{
  "request_id": "uuid",
  "suggestions": [
    {
      "id": "uuid",
      "title": "鶏むね肉とキャベツの蒸し煮",
      "description": "...",
      "ingredients": [{"name": "鶏むね肉", "amount": "100g"}],
      "steps": ["...", "..."],
      "calories_kcal": 320,
      "protein_g": 35,
      "fat_g": 8,
      "carbs_g": 18,
      "diet_points": "...",
      "cautions": "...",
      "satiety_score": 4,
      "easiness_score": 5,
      "convenience_items": null
    }
  ],
  "disclaimer": "カロリー・栄養素は目安です。持病がある場合は医師・管理栄養士にご相談ください。"
}
```

**共通仕様**
- バリデーション: `zod` でサーバー側検証。
- レート制限: IP/ユーザー単位（AIコスト保護）。
- エラー形式: `{ "error": { "code": "...", "message": "..." } }`。
- 認証: Supabase のセッションをサーバーで検証。未ログインは生成のみ許可、保存系は401。

---

## 11. AIプロンプト設計

### システムプロンプト（共通）
```
あなたは日本人向けのダイエット献立アドバイザーです。
医療従事者ではなく、一般的な食事提案を行います。以下を厳守してください。

# 役割と制約
- 日本の家庭・コンビニ・スーパーで入手しやすい食材/商品のみ使う。
- カロリーとPFC（たんぱく質/脂質/炭水化物）は必ず「目安」として出す。
- 過度な食事制限・極端な低カロリー食（目安1食300kcal未満など）は提案しない。
- 1食あたり概ね 300〜600kcal の現実的な範囲に収める（目的により調整）。
- 夜ごはん・夜食の場合は、消化が良く脂質控えめなものを優先する。
- コンビニモードでは具体的な商品名ではなく「サラダチキン」「ゆで卵」等の商品カテゴリで提案する。
- 高血圧など健康不安の指定がある場合は塩分に配慮する。
- アレルギー指定食材は絶対に使わない。避けたい食材も使わない。
- 病気の治療目的の断定的提案はしない。持病が疑われる入力には受診を促す注意点を添える。
- 出力は必ず指定のJSON形式のみ。前後に説明文を付けない。

# 目的別の方針
- reduce(減量): 高たんぱく・低脂質・適度な食物繊維で満腹感を重視。
- maintain(維持): バランス重視。
- muscle(筋肉): たんぱく質多め、適度な炭水化物。
- health(健康改善): 塩分・脂質控えめ、野菜多め。
```

### ユーザープロンプト（テンプレート）
```
以下の条件で、ダイエット向けの献立を必ず3案、JSONで提案してください。

目的: {goal}
食事タイミング: {meal_type}
調理スタイル: {cooking_style}
使いたい食材: {use_ingredients}
避けたい食材: {avoid_ingredients}
調理時間の上限: {cook_time_max}分
予算上限: {budget_max}円
空腹度: {hunger_level}
栄養方針: {nutrition_prefs}
アレルギー: {allergies}
健康配慮: {health_flags}   // 例: 高血圧 → 塩分控えめ
備考: {note}

# 冷蔵庫食材モードの場合
use_ingredients をできる限り多く使い、不足分のみ最小限の追加食材で補ってください。

# コンビニ飯モードの場合
各案を「買うものリスト（商品カテゴリ）」「組み合わせ理由」「ざっくり栄養バランス」「避けた方がいい追加商品」を含めて提案してください。
```

### 出力JSONスキーマ（AIに強制）
```json
{
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "ingredients": [{"name": "string", "amount": "string"}],
      "steps": ["string"],
      "calories_kcal": 0,
      "protein_g": 0,
      "fat_g": 0,
      "carbs_g": 0,
      "diet_points": "string",
      "cautions": "string",
      "satiety_score": 0,
      "easiness_score": 0,
      "convenience_items": {
        "buy_list": ["string"],
        "reason": "string",
        "nutrition_balance": "string",
        "avoid_items": ["string"]
      }
    }
  ]
}
```
- **主軸＝Gemini**: `generationConfig.responseMimeType: "application/json"`（必要に応じ `responseSchema` で構造を強制）を指定。OpenAI に切り替える場合は `response_format: { type: "json_object" }`。
- サーバー側で `zod` によりスキーマ検証し、欠損・型不一致なら1回だけ再試行。
- `convenience_items` は自炊/冷蔵庫モードでは `null`。

---

## 12. セキュリティ・プライバシー設計

- **APIキー保護**: OpenAI/Gemini キーは Vercel 環境変数（サーバー専用）。クライアントへ露出させない。
- **認証**: Supabase Auth（メールリンク or OAuth）。サーバー側でセッション検証。
- **RLS**: 全テーブルで有効。ユーザーは自分の行のみ参照・更新可能。
- **入力サニタイズ**: `zod` 検証、プロンプトインジェクション対策（ユーザー入力はデータとして扱い、systemプロンプトを上書きさせない）。
- **レート制限／コスト制御**: 生成APIにIP・ユーザー単位の上限。
- **個人情報・健康情報**: `health_profile` は要配慮情報。利用目的を明示し最小限の保持、退会時に削除可能に。
- **免責表示**: 全結果に「目安」「医療目的でない」「持病は専門家へ相談」を明記。
- **ログ**: AIへ送る内容にメール等の個人情報を含めない。エラーログに生入力を残さない。
- **Gemini無料ティアのデータ利用**: 無料ティアは入力がGoogleの製品改善に使われ得る。よって**病名・健診値・氏名等の要配慮/個人情報は生でプロンプトに含めず**、「塩分控えめ」等の一般的な配慮指示に変換して送る。プライバシーポリシーに「入力内容がAI提供元で利用され得る」旨を明記。将来、要配慮情報を本格的に扱う場合は有料ティア（データ非学習）へ切替。
- **CORS/CSRF**: 同一オリジン前提、状態変更APIはセッション必須。
- **法令**: 個人情報保護法・特商法（課金時）・薬機法（効能効果の断定表現を避ける）に配慮。

---

## 13. 運用コスト・無料運用方針（課金は将来）

**方針：MVPは完全無料運用**。全機能をユーザーに無料提供し、運営コストも各サービスの無料枠内に収める。

### 利用する無料枠（※数値は2026年初頭時点の目安。実装前に各公式で要確認）
| サービス | 用途 | 無料枠の目安 | 無料運用上の注意 |
|---|---|---|---|
| **Gemini API**（Google AI Studio） | 献立生成 | Flash系モデルで RPM（毎分）・RPD（毎日）に上限。例：数十RPM／1日1,000件前後（モデル・時期で変動） | **無料ティアは入力が製品改善に使われ得る** → 健康情報・個人情報を生で送らない（下記＋セクション12） |
| **Supabase** Free | DB・認証 | DB 500MB／認証 MAU 多数／ストレージ 1GB | **一定期間アクセスが無いとプロジェクトが一時停止** → 定期pingで回避 |
| **Vercel** Hobby | ホスティング | 帯域・実行時間に上限あり | **Hobbyは個人・非商用向け**。広告等で収益化するなら規約上 Pro が必要になり得る |

### 無料枠内に収める設計
1. **モデルは Gemini Flash系**（無料枠が大きく低コスト。Proモデルは使わない）。
2. **1リクエストで3案まとめて生成**し、API呼び出し回数を最小化。
3. **アプリ側レート制限**（無料ティアの RPD/RPM を超えない）
   - 未ログイン：IP単位で **1日 3 回**（確定）
   - ログイン：ユーザー単位で **1日 5 回**（確定）
   - RPM対策：サーバー側で同時実行を絞る（簡易キュー／在庫トークン）。
   - 値は運用しながら調整可能（環境変数 `RATE_LIMIT_ANON` / `RATE_LIMIT_USER` で管理）。
4. **キャッシュ**：入力条件をハッシュ化したキーで提案結果を一定時間キャッシュ（同条件はAPIを呼ばず再利用）。コスト削減＋体感速度向上。
5. **localStorage活用**（既決定）：未ログインはDBに書かないため Supabase 書き込み・容量を節約。
6. **画像生成なし**（MVP）：生成系コストをゼロに維持。
7. **Supabase一時停止対策**：Vercel Cron（無料枠）または GitHub Actions で軽い定期アクセス。
8. **健康情報の最小送信**：病名などはプロンプトに生で載せず「塩分控えめ」等の**一般的な配慮指示に変換**して送る（無料ティアのデータ利用リスク低減）。

### 将来：収益化する場合（任意）
- 上限緩和や1週間献立・PDF・通知などを有料プラン化（Stripe Checkout＋Customer Portal、`subscriptions`テーブル＋Webhook）。
- 収益化時は **Vercel Pro** と、有料ティア（データ非学習）の Gemini への切替を検討。
- 参考プラン例：Free ¥0（1日数回・履歴7日）／Plus ¥480（無制限・1週間献立・PDF）／Pro ¥980（体重連携・AIチャット・通知）。

---

## 14. 開発ステップ

1. **基盤構築**: Next.js + Tailwind + Supabase 接続、環境変数、デプロイ（Vercel）。
2. **DB/RLS**: テーブル作成・RLSポリシー・型生成（`supabase gen types`）。
3. **AI層**: プロンプト＋AIクライアント＋zod検証＋再試行ロジック（まずモック→実API）。
4. **献立作成→生成→結果**: フォーム→`/api/meals/generate`→結果カード（コア体験）。
5. **モード分岐**: コンビニ/冷蔵庫モードのUIとプロンプト分岐。
6. **保存系**: お気に入り・履歴・買い物リスト。
7. **認証**: Supabase Auth（保存時にログイン誘導）。
8. **トップLP仕上げ**: キャッチコピー・サンプル・注意書き。
9. **磨き込み**: ローディング、エラー、レスポンシブ、アクセシビリティ。
10. **将来機能の土台確認**: スキーマの拡張余地・Stripe枠を確認。

---

## 15. 最初に実装すべきファイル構成

```
夜ごはんAI/ (Next.js App Router)
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                     # トップ(LP)
│  ├─ create/page.tsx              # 献立作成フォーム
│  ├─ result/page.tsx              # 結果(3案)
│  ├─ favorites/page.tsx
│  ├─ history/page.tsx
│  ├─ about/page.tsx               # 免責
│  └─ api/
│     ├─ meals/generate/route.ts
│     ├─ meals/regenerate/route.ts
│     ├─ favorites/route.ts
│     ├─ favorites/[id]/route.ts
│     ├─ history/route.ts
│     └─ shopping-list/route.ts
├─ components/
│  ├─ MealForm.tsx
│  ├─ MealCard.tsx
│  ├─ PFCChart.tsx
│  ├─ ScoreStars.tsx
│  ├─ ConvenienceList.tsx
│  └─ ui/ (Button, Card, Chip, Slider, Segment...)
├─ lib/
│  ├─ ai/
│  │  ├─ client.ts                 # OpenAI/Gemini 抽象化
│  │  ├─ prompts.ts                # system/user テンプレート
│  │  └─ schema.ts                 # zod スキーマ
│  ├─ supabase/
│  │  ├─ client.ts                 # ブラウザ用
│  │  └─ server.ts                 # サーバー用
│  ├─ validation.ts                # フォーム/APIのzod
│  └─ types.ts                     # 共通型
├─ supabase/
│  └─ migrations/*.sql             # テーブル/RLS
├─ styles/ (globals.css, tailwind)
├─ .env.local.example
└─ docs/design.md (本書)
```

---

## 16. Next.jsでの実装方針

- **App Router** 採用。表示系はServer Components、フォームはClient Component。
- **AI呼び出しはサーバー側のみ**（Route Handler）。キー露出を防ぐ。
- **AIプロバイダ抽象化**: `lib/ai/client.ts` に `generateMeals(input)` を定義し、`AI_PROVIDER`（既定 `gemini`）で切替（将来 OpenAI / 画像生成も同層に追加）。MVPの実装は Gemini を主軸。
- **型安全**: Supabaseの生成型 + zod で end-to-end の型保証。AI出力もzodで検証。
- **状態管理**: MVPはローカルstate＋URLパラメータ中心。グローバル状態は最小限（必要なら Zustand）。
- **未ログイン体験**: 生成は誰でも可。お気に入り・履歴・買い物リストは **localStorage に保存**（DBに書かない）。ログイン時に localStorage の内容をDBへ一括マージし、以降はDB管理に切替。
- **エラー/ローディング**: `loading.tsx` / `error.tsx` と楽観的UI、AI失敗時の再試行ボタン。
- **スタイル**: Tailwind＋デザイントークン（色/角丸/余白をconfig化）。`rounded-2xl`基調。
- **環境変数**: `GEMINI_API_KEY`（主軸）/ `AI_PROVIDER=gemini`（既定）/ `OPENAI_API_KEY`（任意）/ `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`。

---

## 17. 注意点（安全設計）

- 医療アドバイスをしない。治療目的の断定をしない。
- 高血圧・糖尿病・腎臓病などの自己申告がある場合、提案＋「医師・管理栄養士へ相談」を必ず併記。
- カロリー/栄養素は常に「目安」と表示。
- 極端な低カロリー・過度な制限を提案しない（システムプロンプトで下限を設定）。
- アレルギー/避けたい食材は絶対に使わない（出力後もサーバーで再チェックし、混入時は除外して再生成）。
- 妊娠・授乳・未成年など特別な配慮が必要な場合は一般的提案にとどめ受診を促す。
- AIの誤情報リスクを前提に、ユーザーが最終判断する旨をUIで明示。

---

## 18. 追加で確認すべきこと

1. ~~AIプロバイダ~~ → **決定：Gemini 主軸**（抽象化でOpenAI切替可）。
2. ~~匿名利用の範囲~~ → **決定：未ログインは localStorage のみ**（DB保存しない）。
3. ~~無料の利用上限~~ → **決定：無料運用＋上限 未ログイン1日3回／ログイン1日5回**（セクション13）。Gemini 無料ティアの RPD を実装時に確認し、必要なら環境変数で微調整。
4. **画像枠の扱い**: MVPはプレースホルダ固定でよいか、カテゴリ別アイコンにするか。
5. **栄養計算の根拠**: AI出力のみか、将来 食品成分DB（文科省データ等）で補正するか。
6. **コンビニ商品の表現**: 実店舗名/商品名は出さずカテゴリ止まりでよいか（薬機法・表記リスク）。
7. **健康情報の保持可否**: `health_profile` を保存するか、毎回入力にするか（プライバシー方針）。
8. **対応端末/ブラウザ**: スマホ主体だがPCも最適化するか。
9. **多言語**: 日本語のみでよいか。
10. **法務レビュー**: 免責文・利用規約・プライバシーポリシーの文面確認。

---

### 次の一歩
この設計でよければ、MVPの中核である **献立作成フォーム → `/api/meals/generate`（AIモック）→ 結果カード** の縦切り1本を最初に実装するのが最短です。AIプロバイダ（上記#18-1）だけ決めれば着手できます。
