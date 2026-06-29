import Link from "next/link";

const scenes = [
  { emoji: "🌙", title: "夜遅い日に", text: "帰りが遅くても、太りにくい軽めの夜ごはんを提案。" },
  { emoji: "🍳", title: "自炊が苦手でも", text: "手順が少なく、失敗しにくいレシピだけを厳選。" },
  { emoji: "🏪", title: "コンビニで完結", text: "買って組み合わせるだけのヘルシーセットを提案。" },
  { emoji: "🥬", title: "冷蔵庫の食材で", text: "余りがちな食材を入力すると、使い切る献立に。" },
];

const steps = [
  { n: 1, title: "条件をえらぶ", text: "目的・食事・用意のしかたをタップするだけ。" },
  { n: 2, title: "AIが提案", text: "ダイエット向けの献立を3つ、栄養の目安つきで。" },
  { n: 3, title: "作る or 買う", text: "気に入ったら保存。買い物リストにも追加できます。" },
];

const samples = [
  { emoji: "🍳", title: "鶏むね肉とキャベツの蒸し煮", kcal: 320, tag: "高たんぱく・低脂質" },
  { emoji: "🛍️", title: "サラダチキン＋ゆで卵＋味噌汁", kcal: 280, tag: "コンビニで完結" },
];

export default function Home() {
  return (
    <div>
      {/* ヒーロー */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-16 -top-10 h-64 w-64 rounded-full bg-coral-soft/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-sage-soft/60 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-16 text-center sm:pt-24">
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            がんばらない、
            <br />
            <span className="text-coral-deep">ととのうごはん。</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
            「今夜なに食べよう」をAIにおまかせ。
            <br />
            目的と食材を選ぶだけで、ダイエット向けの献立を3つ提案します。
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/create"
              className="rounded-full bg-coral px-8 py-4 text-base font-bold text-white shadow-soft transition hover:bg-coral-deep"
            >
              無料で献立をつくる
            </Link>
          </div>
        </div>
      </section>

      {/* 利用シーン */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-center text-2xl font-bold text-ink">
          こんなときに、寄りそいます
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {scenes.map((s) => (
            <div
              key={s.title}
              className="rounded-4xl border border-line bg-surface p-5 text-center shadow-card"
            >
              <div className="text-3xl">{s.emoji}</div>
              <h3 className="mt-3 text-sm font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 使い方3ステップ */}
      <section className="bg-surface/60 py-14">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-center text-2xl font-bold text-ink">
            使い方は、3ステップ
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-coral-soft font-display text-2xl font-semibold text-coral-deep">
                  {s.n}
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[14rem] text-sm leading-relaxed text-ink-soft">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* サンプル献立 */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-center text-2xl font-bold text-ink">
          たとえば、こんな提案
        </h2>
        <div className="mx-auto mt-8 grid max-w-2xl gap-5 sm:grid-cols-2">
          {samples.map((s) => (
            <div
              key={s.title}
              className="overflow-hidden rounded-4xl border border-line bg-surface shadow-card"
            >
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-coral-soft via-cream to-sage-soft text-4xl">
                {s.emoji}
              </div>
              <div className="p-5">
                <span className="rounded-full bg-sage-soft px-2.5 py-1 text-xs text-sage-deep">
                  {s.tag}
                </span>
                <h3 className="mt-3 text-base font-bold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  目安{" "}
                  <span className="font-bold text-coral-deep">{s.kcal}</span>{" "}
                  kcal
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* やさしい注意書き */}
      <section className="mx-auto max-w-3xl px-5 pb-6">
        <div className="rounded-4xl bg-honey-soft/60 px-6 py-5 text-center text-xs leading-relaxed text-ink">
          カロリーや栄養素は「目安」です。極端な食事制限はおすすめしません。
          持病のある方は医師・管理栄養士にご相談ください。
        </div>
      </section>

      {/* 最終CTA */}
      <section className="mx-auto max-w-3xl px-5 py-12 text-center">
        <h2 className="text-2xl font-bold text-ink">
          今夜のごはん、決めちゃおう
        </h2>
        <Link
          href="/create"
          className="mt-6 inline-block rounded-full bg-coral px-8 py-4 text-base font-bold text-white shadow-soft transition hover:bg-coral-deep"
        >
          無料で献立をつくる
        </Link>
      </section>
    </div>
  );
}
