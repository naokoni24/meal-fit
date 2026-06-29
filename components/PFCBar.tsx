export function PFCBar({
  p,
  f,
  c,
  sugar,
}: {
  p: number;
  f: number;
  c: number;
  sugar?: number;
}) {
  const total = p + f + c || 1;
  const pct = (v: number) => `${(v / total) * 100}%`;

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-line">
        <div className="bg-sage" style={{ width: pct(p) }} />
        <div className="bg-honey" style={{ width: pct(f) }} />
        <div className="bg-coral" style={{ width: pct(c) }} />
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-y-1 text-xs text-ink-soft">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-sage" />
          たんぱく質 {Math.round(p)}g
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-honey" />
          脂質 {Math.round(f)}g
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-coral" />
          炭水化物 {Math.round(c)}g
          {sugar !== undefined && `（うち糖質 ${Math.round(sugar)}g）`}
        </span>
      </div>
    </div>
  );
}
