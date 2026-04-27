"use client";

import { useState } from "react";
import type { DebateResult } from "../types";
import { AnnotationView } from "./AnnotationView";
import { AlternativesView } from "./AlternativesView";

type Tab = "annotations" | "fallacies" | "missed" | "rewrites";

export function CoachPanel({
  input,
  result,
  onUseInstead,
}: {
  input: string;
  result: DebateResult;
  onUseInstead: (text: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("annotations");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "annotations", label: "Annotations", count: result.annotations.length },
    {
      id: "fallacies",
      label: "Fallacies & Bias",
      count: result.fallacies.length + result.biases.length,
    },
    { id: "missed", label: "Missed Points", count: result.missed_points.length },
    { id: "rewrites", label: "Rewrites", count: result.alternatives.length },
  ];

  return (
    <section className="border border-ink-line bg-paper">
      <div className="flex items-baseline justify-between border-b border-ink-line px-6 pt-6 pb-3">
        <span className="label">Coach</span>
        <span className="label">Round 1</span>
      </div>

      <div className="flex border-b border-ink-line px-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-3 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
              tab === t.id
                ? "border-ink-1 text-ink-1"
                : "border-transparent text-ink-3 hover:text-ink-2"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-ink-3">{t.count}</span>
          </button>
        ))}
      </div>

      <div>
        {tab === "annotations" && (
          <AnnotationView input={input} annotations={result.annotations} embedded />
        )}
        {tab === "fallacies" && <FallaciesTab result={result} />}
        {tab === "missed" && <MissedTab result={result} />}
        {tab === "rewrites" && (
          <AlternativesView
            alternatives={result.alternatives}
            onUseInstead={onUseInstead}
            embedded
          />
        )}
      </div>
    </section>
  );
}

function FallaciesTab({ result }: { result: DebateResult }) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          Logical Fallacies · {result.fallacies.length}
        </div>
        {result.fallacies.length === 0 ? (
          <p className="text-[13px] italic text-ink-3">None detected.</p>
        ) : (
          <ul className="space-y-2">
            {result.fallacies.map((f, i) => (
              <li key={i} className="border border-accent-bad p-3">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="font-display text-base font-medium text-ink-1">
                    {f.name}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent-bad">
                    Fallacy
                  </span>
                </div>
                <p className="mb-1.5 font-display text-[13px] italic leading-relaxed text-ink-2">
                  &ldquo;{f.span}&rdquo;
                </p>
                <p className="text-[12px] leading-relaxed text-ink-1">{f.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          Cognitive Biases · {result.biases.length}
        </div>
        {result.biases.length === 0 ? (
          <p className="text-[13px] italic text-ink-3">None detected.</p>
        ) : (
          <ul className="space-y-2">
            {result.biases.map((b, i) => (
              <li key={i} className="border border-ink-line p-3">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="font-display text-base font-medium text-ink-1">
                    {b.name}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                    Bias
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-ink-1">{b.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MissedTab({ result }: { result: DebateResult }) {
  return (
    <div className="p-6">
      <p className="mb-4 text-[13px] leading-relaxed text-ink-2">
        Stronger arguments for your position you didn&rsquo;t make. Weave these in next time.
      </p>
      {result.missed_points.length === 0 ? (
        <p className="text-[13px] italic text-ink-3">You covered the strong territory.</p>
      ) : (
        <ol className="space-y-2">
          {result.missed_points.map((m, i) => (
            <li
              key={i}
              className="grid grid-cols-[28px_1fr] gap-3 border border-ink-line p-3"
            >
              <span className="font-mono text-[11px] tabular-nums text-ink-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-base leading-relaxed text-ink-1">{m}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
