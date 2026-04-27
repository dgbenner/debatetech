import type { Score, Turn } from "../types";

const KEYS: { key: keyof Omit<Score, "summary">; label: string }[] = [
  { key: "clarity", label: "Clarity" },
  { key: "logic", label: "Logic" },
  { key: "evidence", label: "Evidence" },
  { key: "persuasiveness", label: "Persuasiveness" },
];

export function aggregateScores(turns: Turn[]): Score {
  if (turns.length === 0) {
    return { clarity: 0, logic: 0, evidence: 0, persuasiveness: 0, summary: "" };
  }
  const sum = { clarity: 0, logic: 0, evidence: 0, persuasiveness: 0 };
  for (const t of turns) {
    sum.clarity += t.score.clarity;
    sum.logic += t.score.logic;
    sum.evidence += t.score.evidence;
    sum.persuasiveness += t.score.persuasiveness;
  }
  const n = turns.length;
  return {
    clarity: sum.clarity / n,
    logic: sum.logic / n,
    evidence: sum.evidence / n,
    persuasiveness: sum.persuasiveness / n,
    summary: "",
  };
}

export function avgOf(s: Score) {
  return (s.clarity + s.logic + s.evidence + s.persuasiveness) / 4;
}

export function SideBoard({
  side,
  label,
  score,
  turnCount,
  isActive,
}: {
  side: "user" | "claude";
  label: string;
  score: Score;
  turnCount: number;
  isActive?: boolean;
}) {
  const isUser = side === "user";
  const accent = isUser ? "border-t-accent-good" : "border-t-accent-bad";
  const labelColor = isUser ? "text-accent-good" : "text-accent-bad";
  const barColor = isUser ? "bg-accent-good" : "bg-accent-bad";

  return (
    <aside
      className={`border-t-[3px] ${accent} border-r border-b border-l ${
        isActive ? (isUser ? "border-accent-good" : "border-accent-bad") : "border-ink-line"
      } bg-paper p-5`}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <div
            className={`font-mono text-[10px] uppercase tracking-[0.14em] ${labelColor}`}
          >
            {isUser ? "You" : "Claude"}
          </div>
          <div className="mt-0.5 font-display text-base font-medium tracking-tight text-ink-1">
            {label}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-medium leading-none tabular-nums text-ink-1">
            {avgOf(score).toFixed(1)}
          </div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
            avg / {turnCount} turn{turnCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {KEYS.map(({ key, label: barLabel }) => {
          const v = score[key];
          return (
            <div key={key}>
              <div className="mb-0.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.06em] text-ink-2">
                <span>{barLabel}</span>
                <span className="tabular-nums text-ink-1">{v.toFixed(1)}</span>
              </div>
              <div className="h-[3px] overflow-hidden bg-ink-line">
                <div
                  className={`h-full ${barColor} transition-[width] duration-700`}
                  style={{ width: `${v * 10}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
