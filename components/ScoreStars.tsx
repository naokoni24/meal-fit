export function ScoreStars({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const s = Math.max(0, Math.min(5, Math.round(score)));
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-ink-soft">{label}</span>
      <span className="text-sm tracking-tight">
        <span className="text-honey">{"★".repeat(s)}</span>
        <span className="text-line">{"★".repeat(5 - s)}</span>
      </span>
    </div>
  );
}
