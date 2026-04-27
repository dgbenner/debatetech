"use client";

import { useState } from "react";
import type { Alternative } from "../types";

export function AlternativesView({
  alternatives,
  onUseInstead,
  embedded = false,
}: {
  alternatives: Alternative[];
  onUseInstead: (text: string) => void;
  embedded?: boolean;
}) {
  const [active, setActive] = useState(0);

  const Wrapper = embedded ? "div" : "section";
  const wrapperClass = embedded ? "p-6" : "border border-ink-line bg-paper p-6";

  return (
    <Wrapper className={wrapperClass}>
      {!embedded && (
        <div className="mb-4 flex items-baseline justify-between">
          <span className="label">Rewrites</span>
          <span className="label">{alternatives.length} Strategies</span>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {alternatives.map((alt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
              active === i
                ? "border-ink-1 bg-ink-1 text-paper"
                : "border-ink-line text-ink-2 hover:bg-ink-hover"
            }`}
          >
            {alt.strategy}
          </button>
        ))}
      </div>

      {alternatives[active] && (
        <div>
          <p className="mb-4 font-display text-lg leading-relaxed text-ink-1">
            {alternatives[active].text}
          </p>
          <div className="space-y-1.5 border-t border-ink-line pt-4">
            <div className="text-[13px] leading-relaxed text-ink-2">
              <span className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                Why
              </span>
              {alternatives[active].reasoning}
            </div>
            <div className="text-[13px] leading-relaxed text-ink-2">
              <span className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                When
              </span>
              {alternatives[active].when_to_use}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUseInstead(alternatives[active].text)}
            className="mt-5 bg-ink-1 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper transition-opacity hover:opacity-90"
          >
            Use this instead →
          </button>
        </div>
      )}
    </Wrapper>
  );
}
