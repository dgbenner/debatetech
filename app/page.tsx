"use client";

import { useState } from "react";
import { TopicPicker } from "./components/TopicPicker";
import { TurnCard } from "./components/TurnCard";
import { SideBoard, aggregateScores, avgOf } from "./components/SideBoard";
import type { Stance, Topic, Turn, TurnResponse } from "./types";

export default function Home() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [userSide, setUserSide] = useState<Stance>("for");
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicOpen, setTopicOpen] = useState(true);

  const claudeSide: Stance = userSide === "for" ? "against" : "for";
  const userTurns = transcript.filter((t) => t.side === "user");
  const claudeTurns = transcript.filter((t) => t.side === "claude");
  const userScore = aggregateScores(userTurns);
  const claudeScore = aggregateScores(claudeTurns);
  const round = Math.floor(transcript.length / 2) + 1;

  function handlePickTopic(t: Topic, side: Stance) {
    setTopic(t);
    setUserSide(side);
    setTranscript([]);
    setDraft("");
    setError(null);
    setTopicOpen(false);
  }

  async function handleSubmitTurn() {
    if (!draft.trim() || thinking || !topic) return;
    setThinking(true);
    setError(null);
    const text = draft;
    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.text,
          userSide,
          transcript,
          newTurn: text,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? `Request failed (${res.status})`);
        return;
      }
      const data = json as TurnResponse;
      const userTurn: Turn = {
        id: `t${transcript.length + 1}`,
        side: "user",
        round,
        text,
        ...data.user_analysis,
      };
      const claudeTurn: Turn = {
        id: `t${transcript.length + 2}`,
        side: "claude",
        round,
        text: data.claude_response.text,
        score: data.claude_response.score,
        annotations: [],
        fallacies: [],
        biases: [],
        missed_points: [],
        alternatives: [],
      };
      setTranscript([...transcript, userTurn, claudeTurn]);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setThinking(false);
    }
  }

  function handleNewMatch() {
    setTopicOpen(true);
  }

  const wordCount = draft.split(/\s+/).filter(Boolean).length;

  return (
    <main className="min-h-screen bg-paper">
      <div className="bg-ink-1 px-6 py-2.5 text-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between font-mono text-[11px] tracking-[0.06em]">
          <div className="flex items-center gap-4">
            <span className="font-display text-[15px] font-medium tracking-tight">
              Debate Tech
            </span>
            <span className="text-paper/50">
              · Sharpen your arguments by sparring with a coach in your corner.
            </span>
          </div>
          <button
            type="button"
            onClick={handleNewMatch}
            className="text-paper/70 hover:text-paper"
          >
            NEW MATCH ⌘N
          </button>
        </div>
      </div>

      {topic && (
        <div className="border-b border-ink-line bg-paper px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="label">Topic</div>
              <div className="mt-0.5 truncate font-display text-xl font-medium tracking-tight text-ink-1">
                &ldquo;{topic.text}&rdquo;
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTopicOpen(true)}
              className="border border-ink-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2 hover:bg-ink-hover hover:text-ink-1"
            >
              Change topic
            </button>
          </div>
        </div>
      )}

      {topic && (
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid gap-5 lg:grid-cols-[260px_1fr_260px]">
            <SideBoard
              side="user"
              label={userSide === "for" ? "Pro position" : "Con position"}
              score={userScore}
              turnCount={userTurns.length}
              isActive
            />

            <div className="min-w-0 space-y-4">
              <div className="flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                <span>
                  Transcript · {Math.ceil(transcript.length / 2)} round
                  {Math.ceil(transcript.length / 2) === 1 ? "" : "s"}
                </span>
                <span>
                  You {avgOf(userScore).toFixed(1)} · Claude {avgOf(claudeScore).toFixed(1)}
                </span>
              </div>

              {transcript.map((t) => (
                <TurnCard
                  key={t.id}
                  turn={t}
                  onUseInstead={(text) => setDraft(text)}
                />
              ))}

              <div className="border-y-[3px] border-x-2 border-x-accent-good border-y-accent-good bg-paper p-5">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-good">
                    ● Your turn · Round {round}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.06em] text-ink-3">
                    {wordCount}w
                  </span>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitTurn();
                    }
                  }}
                  rows={4}
                  placeholder={
                    transcript.length === 0
                      ? "Open with your strongest case…"
                      : "Write your rebuttal. The coach scores after you submit."
                  }
                  disabled={thinking}
                  className="w-full resize-y bg-transparent font-display text-lg leading-relaxed text-ink-1 placeholder:text-ink-3 focus:outline-none disabled:opacity-50"
                />
                <div className="mt-3 flex items-center justify-between border-t border-ink-line pt-3">
                  <div className="flex gap-3 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
                    <span>⌘↵ submit</span>
                    <span>auto-coached</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitTurn}
                    disabled={!draft.trim() || thinking}
                    className="bg-ink-1 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {thinking ? "Sparring…" : "Submit turn →"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="border border-accent-bad bg-accent-bad-soft p-4 font-display text-sm text-ink-1">
                  {error}
                </div>
              )}
            </div>

            <SideBoard
              side="claude"
              label={claudeSide === "for" ? "Pro position" : "Con position"}
              score={claudeScore}
              turnCount={claudeTurns.length}
            />
          </div>
        </div>
      )}

      {topic && transcript.length > 0 && (
        <div className="bg-ink-1 px-6 py-4 text-paper">
          <div className="mx-auto grid max-w-7xl grid-cols-[260px_1fr_260px] items-center gap-5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50">
                Referee
              </div>
              <div className="mt-1 font-display text-sm leading-tight tracking-tight">
                Match in progress · {Math.ceil(transcript.length / 2)} round
                {Math.ceil(transcript.length / 2) === 1 ? "" : "s"}
              </div>
            </div>
            <div className="text-center font-mono text-[11px] tracking-[0.08em] text-paper/70">
              {avgOf(userScore) === avgOf(claudeScore)
                ? "Tied"
                : avgOf(userScore) > avgOf(claudeScore)
                  ? "You lead"
                  : "Claude leads"}
              {" · "}
              <span className="text-paper">
                {Math.abs(avgOf(userScore) - avgOf(claudeScore)).toFixed(1)}
              </span>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50">
                Standing
              </div>
              <div className="mt-1 font-display text-sm tracking-tight">
                {avgOf(userScore).toFixed(1)} <span className="text-paper/40">vs</span>{" "}
                {avgOf(claudeScore).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      <TopicPicker
        open={topicOpen}
        onClose={() => setTopicOpen(false)}
        onPick={handlePickTopic}
        closable={!!topic}
      />
    </main>
  );
}
