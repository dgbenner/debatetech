"use client";

import { useState } from "react";
import type { Turn } from "../types";
import { CoachPanel } from "./CoachPanel";

function avgScore(s: Turn["score"]) {
  return (s.clarity + s.logic + s.evidence + s.persuasiveness) / 4;
}

export function TurnCard({
  turn,
  onUseInstead,
}: {
  turn: Turn;
  onUseInstead: (text: string) => void;
}) {
  const [coachOpen, setCoachOpen] = useState(false);
  const isUser = turn.side === "user";
  const accent = isUser ? "border-accent-good" : "border-accent-bad";
  const accentText = isUser ? "text-accent-good" : "text-accent-bad";
  const accentBg = isUser ? "bg-accent-good-soft" : "bg-paper";
  const wordCount = turn.text.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div
        className={`border-l-[3px] ${accent} border-y border-r border-y-ink-line border-r-ink-line ${accentBg} p-5`}
      >
        <div className="mb-2 flex items-baseline justify-between">
          <span className={`label !${accentText}`}>
            <span className={accentText}>
              {isUser ? "● You" : "○ Claude"} · Round {turn.round}
            </span>
          </span>
          <span className="font-mono text-[10px] tracking-[0.06em] text-ink-3">
            avg {avgScore(turn.score).toFixed(1)} · {wordCount}w
          </span>
        </div>

        <p className="font-display text-lg leading-relaxed text-ink-1">{turn.text}</p>

        {isUser && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-line pt-3">
            <div className="flex flex-wrap gap-3 font-mono text-[10px] tracking-[0.06em]">
              {turn.fallacies.length > 0 && (
                <span className="text-accent-bad">
                  ⚠ {turn.fallacies.length} fallac
                  {turn.fallacies.length === 1 ? "y" : "ies"}
                </span>
              )}
              {turn.biases.length > 0 && (
                <span className="text-ink-2">
                  ⊙ {turn.biases.length} bias{turn.biases.length === 1 ? "" : "es"}
                </span>
              )}
              {turn.annotations.filter((a) => a.type === "strength").length > 0 && (
                <span className="text-accent-good">
                  ★ {turn.annotations.filter((a) => a.type === "strength").length} strong
                </span>
              )}
              {turn.missed_points.length > 0 && (
                <span className="text-ink-3">↗ {turn.missed_points.length} missed</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCoachOpen(!coachOpen)}
              className="border border-accent-good px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-1 hover:bg-accent-good-soft"
            >
              {coachOpen ? "Hide coach ↑" : "Coach review →"}
            </button>
          </div>
        )}
      </div>

      {isUser && coachOpen && (
        <div className="ml-4 border-l border-ink-line pl-4">
          <CoachPanel
            input={turn.text}
            result={{
              response: "",
              score: turn.score,
              annotations: turn.annotations,
              fallacies: turn.fallacies,
              biases: turn.biases,
              missed_points: turn.missed_points,
              alternatives: turn.alternatives,
            }}
            onUseInstead={onUseInstead}
          />
        </div>
      )}
    </div>
  );
}
