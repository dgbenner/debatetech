"use client";

import { useState } from "react";
import type { Alternative } from "../types";

export function AlternativesView({
  alternatives,
  onUseInstead,
}: {
  alternatives: Alternative[];
  onUseInstead: (text: string) => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">
        Alternative Arguments
      </h2>

      <div className="space-y-3">
        {alternatives.map((alt, i) => {
          const isOpen = expanded === i;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : i)}
                className="flex w-full items-center justify-between bg-neutral-50 px-4 py-3 text-left hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
              >
                <span className="font-medium capitalize">{alt.strategy}</span>
                <span className="text-neutral-400">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="space-y-3 px-4 py-3 text-sm">
                  <p className="text-base leading-relaxed">{alt.text}</p>
                  <div className="space-y-1 text-neutral-600 dark:text-neutral-400">
                    <p>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        Why it works:
                      </span>{" "}
                      {alt.reasoning}
                    </p>
                    <p>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        When to use:
                      </span>{" "}
                      {alt.when_to_use}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUseInstead(alt.text)}
                    className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    Use this instead
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
