"use client";

import { useState } from "react";
import { ScoreCard } from "./components/ScoreCard";
import { AnnotationView } from "./components/AnnotationView";
import { AlternativesView } from "./components/AlternativesView";
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Debate Lab</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Submit an argument. Get a counter, a critique, and three sharper rewrites.
        </p>
      </header>

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your argument..."
          rows={5}
          className="w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-base focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-neutral-800"
          disabled={loading}
        />

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="radiogroup"
            aria-label="AI stance"
            className="inline-flex rounded-md border border-neutral-300 dark:border-neutral-700"
          >
            {(["against", "for"] as Stance[]).map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={stance === s}
                onClick={() => setStance(s)}
                disabled={loading}
                className={`px-3 py-1.5 text-sm capitalize first:rounded-l-md last:rounded-r-md ${
                  stance === s
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {loading ? "Analyzing..." : "Analyze & Debate"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-8 space-y-4">
          <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-neutral-500">
              AI Response ({stance})
            </h2>
            <p className="text-base leading-relaxed">{data.response}</p>
          </section>

          <ScoreCard score={data.score} />
          <AnnotationView input={submittedInput} annotations={data.annotations} />
          <AlternativesView
            alternatives={data.alternatives}
            onUseInstead={(text) => {
              setInput(text);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </main>
  );
}
