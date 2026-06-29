import { MealForm } from "@/components/MealForm";

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-ink">献立をつくる</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          まずは上の3つを選ぶだけでOK。
          <br />
          こだわりがあれば「詳しく設定」も使ってみてください。
        </p>
      </header>
      <MealForm />
    </div>
  );
}
