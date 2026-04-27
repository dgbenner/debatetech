"use client";

import { useState } from "react";
import { TOPIC_CATEGORIES } from "../topics";
import type { Stance, Topic } from "../types";

export function TopicPicker({
  open,
  onClose,
  onPick,
  closable = true,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (topic: Topic, side: Stance) => void;
  closable?: boolean;
}) {
  const [activeCat, setActiveCat] = useState<string>(TOPIC_CATEGORIES[0].id);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [side, setSide] = useState<Stance>("for");
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  if (!open) return null;

  const cat = TOPIC_CATEGORIES.find((c) => c.id === activeCat) ?? TOPIC_CATEGORIES[0];
  const canSubmit = customMode ? customText.trim().length >= 10 : !!selectedText;

  function handleSubmit() {
    if (!canSubmit) return;
    if (customMode) {
      onPick({ category: "custom", text: customText.trim() }, side);
    } else if (selectedText && selectedCat) {
      onPick({ category: selectedCat, text: selectedText }, side);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-1/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (closable && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl border border-ink-line bg-paper shadow-2xl">
        <div className="flex items-baseline justify-between border-b border-ink-line px-6 py-4">
          <div>
            <div className="label">Round 0</div>
            <h2 className="font-display text-2xl font-medium tracking-tight text-ink-1">
              Pick your topic
            </h2>
          </div>
          {closable && (
            <button
              type="button"
              onClick={onClose}
              className="text-2xl text-ink-3 hover:text-ink-1"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>

        {!customMode && (
          <>
            <div className="flex flex-wrap gap-1 border-b border-ink-line px-6 py-3">
              {TOPIC_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCat(c.id)}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
                    activeCat === c.id
                      ? "bg-ink-1 text-paper"
                      : "text-ink-2 hover:bg-ink-hover"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="px-6 py-4">
              <ul className="space-y-2">
                {cat.topics.map((t) => {
                  const isSelected = selectedText === t && selectedCat === cat.id;
                  return (
                    <li key={t}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedText(t);
                          setSelectedCat(cat.id);
                        }}
                        className={`w-full border p-3 text-left font-display text-base leading-relaxed transition-colors ${
                          isSelected
                            ? "border-ink-1 bg-ink-hover text-ink-1"
                            : "border-ink-line text-ink-2 hover:bg-ink-hover hover:text-ink-1"
                        }`}
                      >
                        &ldquo;{t}&rdquo;
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="mt-3 w-full border border-dashed border-ink-line p-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 hover:bg-ink-hover hover:text-ink-1"
              >
                + Write your own
              </button>
            </div>
          </>
        )}

        {customMode && (
          <div className="px-6 py-4">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="label">Custom Topic</span>
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3 hover:text-ink-1"
              >
                ← Back to library
              </button>
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="A specific, debatable proposition. e.g. &ldquo;Cities should ban gas stoves in new construction.&rdquo;"
              rows={3}
              className="w-full border border-ink-line bg-paper p-3 font-display text-base leading-relaxed text-ink-1 placeholder:text-ink-3 focus:border-ink-1 focus:outline-none"
            />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
              Sharper topics get sharper sparring. Aim for a clear claim, not a question.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-line bg-paper-2 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="label">You argue</span>
            <div className="inline-flex border border-ink-line">
              {(["for", "against"] as Stance[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
                    side === s
                      ? s === "for"
                        ? "bg-accent-good text-paper"
                        : "bg-accent-bad text-paper"
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
            disabled={!canSubmit}
            className="bg-ink-1 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start match →
          </button>
        </div>
      </div>
    </div>
  );
}
