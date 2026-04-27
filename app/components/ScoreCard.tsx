import type { Score } from "../types";

const labels: { key: keyof Omit<Score, "summary">; label: string }[] = [
  { key: "clarity", label: "Clarity" },
  { key: "logic", label: "Logic" },
  { key: "evidence", label: "Evidence" },
  { key: "persuasiveness", label: "Persuasiveness" },
];

function barColor(value: number): string {
  if (value >= 8) return "bg-accent-good";
  if (value >= 5) return "bg-ink-3";
  return "bg-accent-bad";
}

export function ScoreCard({ score }: { score: Score }) {
  const total = score.clarity + score.logic + score.evidence + score.persuasiveness;
  const avg = (total / 4).toFixed(1);

  return (
    <section className="border border-ink-line bg-paper p-6">
      <div className="mb-5 flex items-baseline justify-between">
        <span className="label">Verdict</span>
        <div className="font-display text-4xl font-medium tabular-nums text-ink-1">
          {avg}
          <span className="text-base text-ink-3"> / 10</span>
        </div>
      </div>

      <div className="space-y-3">
        {labels.map(({ key, label }) => {
          const value = score[key];
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.06em] text-ink-2">
                <span>{label}</span>
                <span className="tabular-nums text-ink-1">{value.toFixed(1)}</span>
              </div>
              <div className="h-[3px] overflow-hidden bg-ink-line">
                <div
                  className={`h-full ${barColor(value)} transition-[width] duration-700 ease-out`}
                  style={{ width: `${value * 10}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 border-t border-ink-line pt-4 font-display text-base italic leading-relaxed text-ink-2">
        &ldquo;{score.summary}&rdquo;
      </p>
    </section>
  );
}
