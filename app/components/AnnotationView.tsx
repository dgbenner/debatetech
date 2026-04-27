"use client";

import { useState } from "react";
import type { Annotation } from "../types";

type Segment =
  | { kind: "plain"; text: string }
  | { kind: "annotated"; text: string; annotation: Annotation; index: number };

function buildSegments(input: string, annotations: Annotation[]): {
  segments: Segment[];
  unmatched: Annotation[];
} {
  type Match = { start: number; end: number; annotation: Annotation; index: number };
  const matches: Match[] = [];
  const unmatched: Annotation[] = [];

  annotations.forEach((annotation, index) => {
    const start = input.indexOf(annotation.text_span);
    if (start === -1) {
      unmatched.push(annotation);
      return;
    }
    matches.push({ start, end: start + annotation.text_span.length, annotation, index });
  });

  matches.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    if (m.start > cursor) {
      segments.push({ kind: "plain", text: input.slice(cursor, m.start) });
    }
    segments.push({
      kind: "annotated",
      text: input.slice(m.start, m.end),
      annotation: m.annotation,
      index: m.index,
    });
    cursor = m.end;
  }
  if (cursor < input.length) {
    segments.push({ kind: "plain", text: input.slice(cursor) });
  }

  return { segments, unmatched };
}

export function AnnotationView({
  input,
  annotations,
  embedded = false,
}: {
  input: string;
  annotations: Annotation[];
  embedded?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const { segments, unmatched } = buildSegments(input, annotations);

  const Wrapper = embedded ? "div" : "section";
  const wrapperClass = embedded ? "p-6" : "border border-ink-line bg-paper p-6";

  return (
    <Wrapper className={wrapperClass}>
      {!embedded && (
        <div className="mb-4 flex items-baseline justify-between">
          <span className="label">You — Original</span>
          <span className="label">{annotations.length} Notes</span>
        </div>
      )}

      <p className="mb-6 whitespace-pre-wrap font-display text-lg leading-relaxed text-ink-1">
        {segments.map((seg, i) => {
          if (seg.kind === "plain") return <span key={i}>{seg.text}</span>;
          const isWeakness = seg.annotation.type === "weakness";
          const isActive = active === seg.index;
          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => setActive(isActive ? null : seg.index)}
              onMouseEnter={() => setActive(seg.index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(isActive ? null : seg.index);
                }
              }}
              className={`cursor-pointer transition-colors ${
                isWeakness
                  ? "border-b-2 border-accent-bad"
                  : "border-b-2 border-accent-good"
              } ${
                isActive
                  ? isWeakness
                    ? "bg-accent-bad-soft"
                    : "bg-accent-good-soft"
                  : ""
              }`}
            >
              {seg.text}
              <sup
                className={`ml-0.5 font-mono text-[9px] font-semibold ${
                  isWeakness ? "text-accent-bad" : "text-accent-good"
                }`}
              >
                {seg.index + 1}
              </sup>
            </span>
          );
        })}
      </p>

      <ol className="space-y-2">
        {annotations.map((a, i) => {
          const isWeakness = a.type === "weakness";
          const isActive = active === i;
          return (
            <li
              key={i}
              onClick={() => setActive(isActive ? null : i)}
              onMouseEnter={() => setActive(i)}
              className={`grid cursor-pointer grid-cols-[28px_1fr] gap-3 border p-3 transition-colors ${
                isActive
                  ? isWeakness
                    ? "border-accent-bad bg-ink-hover"
                    : "border-accent-good bg-ink-hover"
                  : "border-ink-line"
              }`}
            >
              <div
                className={`font-mono text-[11px] font-semibold tabular-nums ${
                  isWeakness ? "text-accent-bad" : "text-accent-good"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div
                  className={`mb-1 font-mono text-[9px] uppercase tracking-[0.1em] ${
                    isWeakness ? "text-accent-bad" : "text-accent-good"
                  }`}
                >
                  {a.type}
                </div>
                <div className="text-[13px] leading-relaxed text-ink-1">
                  {a.explanation}
                </div>
                <div className="mt-2 text-[12px] leading-relaxed text-ink-2">
                  <span className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                    Fix
                  </span>
                  {a.suggestion}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {unmatched.length > 0 && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
          {unmatched.length} note{unmatched.length === 1 ? "" : "s"} could not be aligned to the input.
        </p>
      )}
    </Wrapper>
  );
}
