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
}: {
  input: string;
  annotations: Annotation[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const { segments, unmatched } = buildSegments(input, annotations);

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">
        Annotations
      </h2>

      <p className="mb-4 whitespace-pre-wrap text-base leading-relaxed">
        {segments.map((seg, i) => {
          if (seg.kind === "plain") return <span key={i}>{seg.text}</span>;
          const isWeakness = seg.annotation.type === "weakness";
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(active === seg.index ? null : seg.index)}
              className={`relative cursor-pointer rounded px-0.5 transition-colors ${
                isWeakness
                  ? "bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/50 dark:hover:bg-rose-950"
                  : "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:hover:bg-emerald-950"
              } ${active === seg.index ? "ring-2 ring-neutral-400" : ""}`}
            >
              {seg.text}
            </button>
          );
        })}
      </p>

      <div className="space-y-2">
        {annotations.map((a, i) => {
          const isWeakness = a.type === "weakness";
          const isActive = active === i;
          return (
            <div
              key={i}
              onClick={() => setActive(isActive ? null : i)}
              className={`cursor-pointer rounded-md border p-3 text-sm transition-all ${
                isActive
                  ? "border-neutral-400 shadow-sm"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-medium uppercase ${
                    isWeakness
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {a.type}
                </span>
                <span className="truncate text-neutral-500">&ldquo;{a.text_span}&rdquo;</span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300">{a.explanation}</p>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">Suggestion:</span> {a.suggestion}
              </p>
            </div>
          );
        })}
      </div>

      {unmatched.length > 0 && (
        <p className="mt-3 text-xs text-neutral-500">
          {unmatched.length} annotation{unmatched.length === 1 ? "" : "s"} could not be aligned to the input text.
        </p>
      )}
    </section>
  );
}
