"use client";

import { useState } from "react";
import { ScoreCard } from "./components/ScoreCard";
import { CoachPanel } from "./components/CoachPanel";
import type { DebateResult, Stance } from "./types";

export default function Home() {
  const [input, setInput] = useState("");
  const [stance, setStance] = useState<Stance>("against");
  const [data, setData] = useState<DebateResult | null>(null);
  const [submittedInput, setSubmittedInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setData(null);
    const argument = input;
    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: argument, stance }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? `Request failed (${res.status})`);
        return;
      }
      setData(json as DebateResult);
      setSubmittedInput(argument);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  const wordCount = input.split(/\s+/).filter(Boolean).length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <header className="mb-10 flex items-baseline justify-between border-b border-ink-line pb-4">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-ink-1">
            Debate Tech
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            Dialectic Spread · Vol. 1 № 27
          </p>
        </div>
        <span className="label">New ⌘N</span>
      </header>

      <section className="border border-ink-line bg-paper p-6">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="label">Argument</span>
          <span className="label">{wordCount} words</span>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write your argument…"
          rows={5}
          className="w-full resize-y bg-transparent font-display text-lg leading-relaxed text-ink-1 placeholder:text-ink-3 focus:outline-none"
          disabled={loading}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-line pt-4">
          <div className="flex items-center gap-3">
            <span className="label">AI argues</span>
            <div role="radiogroup" aria-label="AI stance" className="inline-flex border border-ink-line">
              {(["against", "for"] as Stance[]).map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={stance === s}
                  onClick={() => setStance(s)}
                  disabled={loading}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
                    stance === s
                      ? "bg-ink-1 text-paper"
                      : "text-ink-2 hover:bg-ink-hover"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="bg-ink-1 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Analyzing…" : "Analyze →"}
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-6 border border-accent-bad bg-accent-bad-soft p-4 font-display text-sm text-ink-1">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-4">
          <section className="border border-ink-line bg-paper p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="label">Claude — Counter ({stance})</span>
            </div>
            <p className="font-display text-lg leading-relaxed text-ink-1">
              {data.response}
            </p>
          </section>

          <ScoreCard score={data.score} />
          <CoachPanel
            input={submittedInput}
            result={data}
            onUseInstead={(text: string) => {
              setInput(text);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </main>
  );
}
