"use client";

import Link from "next/link";
import { useState } from "react";
import { concept as findConcept } from "@/lib/data/concepts";

const TABS = ["What is this", "Why it matters", "How to read it now", "What the board says"] as const;

/** Four explainer tabs on desktop; an accordion (one open at a time) on mobile. */
export function ExplainerCard({
  index,
  bodies,
  concepts,
  sourceLine,
}: {
  index: string;
  bodies: [string, string, string, string];
  concepts: string[];
  sourceLine: string;
}) {
  const [tab, setTab] = useState(0);
  const related = concepts.map(findConcept).filter((c) => c != null);
  return (
    <section className="flex flex-col gap-[10px]">
      {/* Desktop tabs */}
      <div role="tablist" aria-label="Explainer" className="hidden items-stretch border-b border-ink pb-[10px] text-[11px] font-semibold uppercase tracking-[0.08em] md:flex">
        <span className="self-center pr-[10px] font-bold text-ember">{index}</span>
        {TABS.map((label, i) => (
          <button
            key={label}
            role="tab"
            type="button"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={`-my-[6px] border-0 px-3 py-[6px] text-[11px] font-semibold uppercase tracking-[0.08em] ${
              tab === i ? "bg-panel text-ink shadow-[inset_0_2px_0_#E8590C]" : "bg-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p role="tabpanel" className="prose-body m-0 mt-1 hidden max-w-[820px] text-ink-2 md:block">
        {bodies[tab]}
      </p>

      {/* Mobile accordion */}
      <div className="flex flex-col md:hidden">
        <div className="flex gap-2 border-b border-ink pb-[10px] text-[10.5px] font-semibold tracking-[0.08em]">
          <span className="font-bold text-ember">{index}</span>
          <span>EXPLAINER</span>
        </div>
        {TABS.map((label, i) => (
          <div key={label} className="border-b border-border">
            <button
              type="button"
              aria-expanded={tab === i}
              onClick={() => setTab(i)}
              className="flex min-h-11 w-full items-center justify-between border-0 bg-transparent text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink"
            >
              {label}
              <span className="text-ember">{tab === i ? "−" : "+"}</span>
            </button>
            {tab === i && <p className="prose-body m-0 pb-3 text-ink-2">{bodies[i]}</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-[14px] gap-y-1 border-t border-border pt-2 text-[11px] font-medium text-muted">
        <span>Related</span>
        {related.map((c) => (
          <Link key={c.id} href={`/learn#concept-${c.id}`}>
            {c.term}
          </Link>
        ))}
        <span className="md:ml-auto">{sourceLine}</span>
      </div>
    </section>
  );
}
