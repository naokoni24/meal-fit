import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このアプリについて｜ととのうごはん",
  description:
    "ととのうごはんの使い方と、安全にお使いいただくための大切なお願い・プライバシーについて。",
};

const sections = [
  {
    icon: "🍳",
    title: "ととのうごはんとは",
    body: "目的や食材をえらぶだけで、AIがダイエット向けの献立を3つ提案します。自炊・コンビニ・冷蔵庫の食材、それぞれの状況に合わせた現実的なメニューをお出しします。登録なし・無料でお使いいただけます。",
    tone: "sage" as const,
  },
  {
    icon: "⚠️",
    title: "大切なお願い（健康について）",
    body: "本アプリは一般的な食事提案であり、医療アドバイスではありません。表示するカロリーや栄養素はあくまで「目安」です。高血圧・糖尿病・腎臓病などの持病がある方、妊娠中・授乳中の方は、医師や管理栄養士にご相談ください。極端な食事制限はおすすめしていません。",
    tone: "honey" as const,
  },
  {
    icon: "🤖",
    title: "AIの提案について",
    body: "献立はAIが自動生成しています。便利な反面、まれに不正確な内容が含まれることがあります。アレルギー・避けたい食材は二重にチェックしていますが、最終的なご判断はご自身でお願いします。気になる場合は無理に従わないでください。",
    tone: "coral" as const,
  },
  {
    icon: "🔒",
    title: "プライバシーについて",
    body: "入力した条件は、献立を作るためにAI提供元へ送信されます。病名や検査結果などの機微な情報は、できるだけ入力をお控えください。お気に入り・履歴・買い物リストは、ログインしない場合はこの端末内（ブラウザ）にのみ保存され、外部には送られません。",
    tone: "sage" as const,
  },
];

const toneClass = {
  sage: "bg-sage-soft/60",
  honey: "bg-honey-soft/60",
  coral: "bg-coral-soft/50",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <header className="mb-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-coral-soft text-3xl">
          🍃
        </div>
        <h1 className="mt-5 text-3xl font-bold text-ink">このアプリについて</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          毎日の「何食べよう」を、やさしくサポートする献立アプリです。
          安心してお使いいただくために、以下をご確認ください。
        </p>
      </header>

      <div className="space-y-4">
        {sections.map((s) => (
          <section
            key={s.title}
            className={`rounded-4xl ${toneClass[s.tone]} p-6`}
          >
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="text-xl">{s.icon}</span>
              {s.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/create"
          className="inline-block rounded-full bg-coral px-8 py-4 text-base font-bold text-white shadow-soft transition hover:bg-coral-deep"
        >
          献立をつくってみる
        </Link>
      </div>
    </div>
  );
}
