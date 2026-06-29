import type { RequestSchema } from "./schema";
import type { AiResponse } from "./schema";

// APIキー未設定でも開発・無料運用できるためのモック生成。
// 入力（使いたい食材・調理スタイル・食事タイミング）をある程度反映する。

type AiSuggestion = AiResponse["suggestions"][number];

const isNight = (m: RequestSchema["mealType"]) =>
  m === "dinner" || m === "midnight";

export function buildMockSuggestions(input: RequestSchema): AiSuggestion[] {
  if (input.cookingStyle === "convenience") return convenienceMocks(input);

  const ing = input.useIngredients;
  const main = ing[0] ?? "鶏むね肉";
  const sub = ing[1] ?? "キャベツ";
  const nightNote = isNight(input.mealType)
    ? "夜は消化に負担をかけないよう、脂質と量を控えめにしています。"
    : "しっかりめでも栄養バランスを意識した一品です。";

  return [
    {
      title: `${main}と${sub}の蒸し煮`,
      description: `${main}を使った高たんぱく・低脂質の一皿。${nightNote}`,
      ingredients: [
        { name: main, amount: "100g" },
        { name: sub, amount: "150g" },
        { name: "しょうが", amount: "少々" },
        { name: "ポン酢", amount: "大さじ1" },
      ],
      steps: [
        `${main}を一口大に切る`,
        `${sub}を食べやすい大きさに切る`,
        "鍋に並べて少量の水としょうがを入れ、フタをして弱火で8分蒸す",
        "ポン酢をかけて完成",
      ],
      caloriesKcal: 320,
      proteinG: 33,
      fatG: 7,
      carbsG: 18,
      sugarG: 14,
      dietPoints: "高たんぱくで脂質ひかえめ。よく噛める具材で満腹感が続きます。",
      cautions: "塩分が気になる方はポン酢を控えめに。",
      satietyScore: input.hungerLevel === "hungry" ? 4 : 4,
      easinessScore: 5,
      convenienceItems: null,
      imageTag: "japanese steamed chicken vegetables healthy",
    },
    {
      title: `${main}と豆腐のさっぱりスープ`,
      description: "温かい汁物で満足感アップ。野菜もたっぷりとれます。",
      ingredients: [
        { name: main, amount: "80g" },
        { name: "絹豆腐", amount: "1/2丁" },
        { name: "わかめ", amount: "ひとつまみ" },
        { name: "顆粒だし", amount: "小さじ1" },
      ],
      steps: [
        "鍋に水400mlとだしを入れて火にかける",
        `${main}を入れて火を通す`,
        "豆腐とわかめを加えてひと煮立ちさせる",
      ],
      caloriesKcal: 240,
      proteinG: 26,
      fatG: 8,
      carbsG: 9,
      sugarG: 6,
      dietPoints: "低カロリーで体が温まり、食べ過ぎ防止に。",
      cautions: "だしの塩分量に注意してください。",
      satietyScore: 3,
      easinessScore: 5,
      convenienceItems: null,
      imageTag: "japanese tofu soup warm healthy",
    },
    {
      title: "高たんぱく和定食プレート",
      description: "主菜・副菜・汁物をワンプレートに。バランス重視の定番。",
      ingredients: [
        { name: main, amount: "100g" },
        { name: "ブロッコリー", amount: "5房" },
        { name: "納豆", amount: "1パック" },
        { name: "玄米ごはん", amount: "120g" },
      ],
      steps: [
        `${main}をグリルまたはフライパンで焼く`,
        "ブロッコリーをゆでる",
        "玄米ごはん・納豆と一緒に盛り付ける",
      ],
      caloriesKcal: 480,
      proteinG: 38,
      fatG: 12,
      carbsG: 52,
      sugarG: 40,
      dietPoints: "たんぱく質と食物繊維をしっかり。腹持ちが良く間食を防ぎます。",
      cautions: "ごはんの量は活動量に合わせて調整してください。",
      satietyScore: 5,
      easinessScore: 3,
      convenienceItems: null,
      imageTag: "japanese healthy dinner plate rice protein",
    },
  ];
}

function convenienceMocks(input: RequestSchema): AiSuggestion[] {
  const night = isNight(input.mealType);
  return [
    {
      title: "サラダチキン＋ゆで卵＋味噌汁",
      description: "コンビニで揃う、高たんぱく・低脂質の鉄板コンビ。",
      ingredients: [
        { name: "サラダチキン", amount: "1個" },
        { name: "ゆで卵", amount: "1個" },
        { name: "インスタント味噌汁", amount: "1杯" },
      ],
      steps: ["買って組み合わせるだけ", "味噌汁はお湯を注ぐ"],
      caloriesKcal: 280,
      proteinG: 32,
      fatG: 9,
      carbsG: 8,
      sugarG: 4,
      dietPoints: "糖質ひかえめで高たんぱく。温かい汁物で満足感アップ。",
      cautions: night ? "夜遅い場合は卵を1個にして軽めに。" : "塩分が気になる方は味噌汁を半量に。",
      satietyScore: 3,
      easinessScore: 5,
      imageTag: "japanese convenience store salad chicken boiled egg",
      convenienceItems: {
        buyList: ["サラダチキン", "ゆで卵", "インスタント味噌汁"],
        reason: "たんぱく質を主役に、汁物で満腹感を補う王道の組み合わせ。",
        nutritionBalance: "高たんぱく・低脂質・低糖質。野菜が少なめなのでサラダを足すと◎。",
        avoidItems: ["菓子パン", "唐揚げ", "加糖の飲料"],
      },
    },
    {
      title: "豆腐＋納豆＋カットサラダ",
      description: "植物性たんぱくと食物繊維がとれるヘルシーセット。",
      ingredients: [
        { name: "充填豆腐", amount: "1個" },
        { name: "納豆", amount: "1パック" },
        { name: "カットサラダ", amount: "1袋" },
      ],
      steps: ["豆腐に納豆をのせる", "サラダを添える（ノンオイル系ドレッシング推奨）"],
      caloriesKcal: 250,
      proteinG: 20,
      fatG: 11,
      carbsG: 16,
      sugarG: 10,
      dietPoints: "食物繊維と発酵食品で腸活にも。低カロリーで罪悪感が少ない。",
      cautions: "ドレッシングは脂質・糖質に注意して選んでください。",
      satietyScore: 3,
      easinessScore: 5,
      imageTag: "japanese tofu natto salad healthy light",
      convenienceItems: {
        buyList: ["充填豆腐", "納豆", "カットサラダ", "ノンオイルドレッシング"],
        reason: "植物性たんぱく＋野菜で軽め。夜でも胃にやさしい構成。",
        nutritionBalance: "低脂質寄り・食物繊維豊富。たんぱく質をもう少し足すならサラダチキンを追加。",
        avoidItems: ["ポテトサラダ", "マヨネーズ系惣菜", "菓子類"],
      },
    },
    {
      title: "焼き魚＋ギリシャヨーグルト＋おにぎり1個",
      description: "魚の良質な脂と高たんぱくヨーグルトでバランス良く。",
      ingredients: [
        { name: "焼き魚（さば・鮭など）", amount: "1パック" },
        { name: "ギリシャヨーグルト（無糖）", amount: "1個" },
        { name: "おにぎり（雑穀・鮭など）", amount: "1個" },
      ],
      steps: ["買って組み合わせるだけ"],
      caloriesKcal: 450,
      proteinG: 34,
      fatG: 15,
      carbsG: 42,
      sugarG: 34,
      dietPoints: "魚のたんぱく質と良質な脂質。おにぎりで適度なエネルギー補給。",
      cautions: night ? "夜遅い場合はおにぎりを半分に。" : "活動量が少ない日はおにぎりを控えめに。",
      satietyScore: 4,
      easinessScore: 5,
      imageTag: "japanese grilled fish rice ball yogurt meal",
      convenienceItems: {
        buyList: ["焼き魚パック", "無糖ギリシャヨーグルト", "雑穀おにぎり"],
        reason: "主菜・主食・デザートをコンビニ商品だけでバランス良く。",
        nutritionBalance: "たんぱく質・脂質・炭水化物がそろった構成。野菜は別途サラダで補うと理想的。",
        avoidItems: ["加糖ヨーグルト", "揚げ物惣菜", "甘い菓子パン"],
      },
    },
  ];
}
