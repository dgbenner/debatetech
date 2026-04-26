import type { Score } from "../types";

const labels: { key: keyof Omit<Score, "summary">; label: string }[] = [
  { key: "clarity", label: "Clarity" },
  { key: "logic", label: "Logic" },
  { key: "evidence", label: "Evidence" },
  { key: "persuasiveness", label: "Persuasiveness" },
];

function barColor(value: number): string {
  if (value >= 8) return "bg-emerald-500";
  if (value >= 5) return "bg-amber-500";
  return "bg-rose-500";
}

export function ScoreCard({ score }: { score: Score }) {
  const total = score.clarity + score.logic + score.evidence + score.persuasiveness;
  const avg = (total / 4).toFixed(1);

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Score
        </h2>
        <div className="text-3xl font-semibold tabular-nums">
          {avg}
          <span className="text-base text-neutral-400"> / 10</span>
        </div>
      </div>

      <div className="space-y-3">
        {labels.map(({ key, label }) => {
          const value = score[key];
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
                <span className="font-medium tabular-nums">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={`h-full ${barColor(value)} transition-all`}
                  style={{ width: `${value * 10}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm italic text-neutral-600 dark:text-neutral-400">
        {score.summary}
      </p>
    </section>
  );
}
