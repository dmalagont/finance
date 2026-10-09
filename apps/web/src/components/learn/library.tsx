"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CardStrip, LightCard, SectionHeader } from "@/components/ui/section-header";
import { CONCEPTS } from "@/lib/data/concepts";
import { MEMBERS } from "@/lib/data/members";
import { QUOTES } from "@/lib/data/quotes";

const SORTED = [...CONCEPTS].sort((a, b) => a.term.localeCompare(b.term));

export function Library() {
  const [q, setQ] = useState("");
  const concepts = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? SORTED.filter((c) => `${c.term} ${c.definition}`.toLowerCase().includes(s)) : SORTED;
  }, [q]);
  const members = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? MEMBERS.filter((m) => `${m.name} ${m.question} ${m.idea}`.toLowerCase().includes(s)) : MEMBERS;
  }, [q]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border bg-panel px-3 py-[14px] md:px-5">
        <h1 className="m-0 font-display text-[36px] uppercase leading-[0.9] md:text-[44px]">Learn</h1>
        <label className="flex max-w-[560px] flex-1 items-center gap-[10px] border border-border bg-ground px-[10px] py-2">
          <span className="font-bold text-ember" aria-hidden>
            ›
          </span>
          <span className="sr-only">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search concepts, people, quotes"
            className="min-w-0 flex-1 border-0 bg-transparent text-[12px] font-medium text-ink outline-none placeholder:text-faint"
          />
        </label>
        <span className="text-[11px] font-medium text-muted md:ml-auto">
          {CONCEPTS.length} CONCEPTS · {MEMBERS.length} PROFILES · 1 LESSON
        </span>
      </div>

      <main className="mx-auto grid max-w-[1600px] grid-cols-1 items-start gap-10 px-3 pb-9 pt-3 md:px-8 md:pt-7 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)]">
        <section aria-labelledby="index-h" className="flex animate-rise flex-col [animation-delay:60ms]">
          <SectionHeader index="01" label={<span id="index-h">Concept index</span>} className="mb-1" />
          {concepts.map((c, i) => {
            const letter = i === 0 || concepts[i - 1].term[0] !== c.term[0] ? c.term[0] : "";
            return (
              <div
                key={c.id}
                id={`concept-${c.id}`}
                className="grid scroll-mt-24 grid-cols-[20px_minmax(0,1fr)_auto] items-baseline gap-2 border-b border-raised py-[7px] target:bg-raised"
              >
                <span className="text-[11px] font-bold text-ember">{letter}</span>
                <span className="flex flex-col gap-px">
                  <span className="text-[12px] font-semibold">{c.term}</span>
                  <span className="font-sans text-[13px] leading-[1.5] text-ink-2">{c.definition}</span>
                </span>
                {c.panel ? (
                  <Link
                    href={c.panel === "norway" ? "/norway" : `/panels/${c.panel}`}
                    className="border border-border px-[5px] py-px text-[9.5px] font-medium uppercase tracking-[0.06em] text-muted no-underline hover:text-ink"
                  >
                    {c.panel}
                  </Link>
                ) : (
                  <span className="border border-border px-[5px] py-px text-[9.5px] font-medium tracking-[0.06em] text-muted">ALL</span>
                )}
              </div>
            );
          })}
          {concepts.length === 0 && <p className="text-[11px] text-muted">No concept matches “{q}”.</p>}
        </section>

        <section aria-labelledby="profiles-h" className="flex animate-rise flex-col gap-[10px] [animation-delay:115ms]">
          <SectionHeader index="02" label={<span id="profiles-h">Council profiles</span>} />
          <div className="grid grid-cols-1 gap-x-6 border-t border-border sm:grid-cols-2">
            {members.map((m) => (
              <div key={m.id} id={`member-${m.id}`} className="flex scroll-mt-24 flex-col gap-[6px] border-b border-border p-3 target:bg-raised">
                <div
                  className="relative h-[72px] border border-border"
                  style={{ background: "repeating-linear-gradient(135deg,#0B1118 0 5px,#060A0F 5px 10px)" }}
                  aria-hidden
                >
                  <span className="absolute left-[6px] top-1 text-[9.5px] font-medium text-muted">PORTRAIT</span>
                </div>
                <h3 className="m-0 font-display text-[22px] font-bold uppercase leading-[0.95]">{m.name}</h3>
                <span className="text-[10.5px] font-semibold leading-[1.4] text-ember">{m.question}</span>
                <span className="font-sans text-[13px] leading-[1.5] text-ink-2">{m.idea}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-9">
          <Link
            href="/learn/pendulum"
            className="flex animate-rise flex-col gap-2 border border-border border-t-2 border-t-ember bg-panel p-3 text-ink no-underline [animation-delay:170ms] hover:bg-hover hover:text-ink"
          >
            <span className="text-[10px] font-semibold tracking-[0.08em] text-ember">FEATURED LESSON · 6 MIN</span>
            <span className="font-display text-[34px] uppercase leading-[0.9]">The pendulum</span>
            <span className="font-sans text-[13px] leading-[1.5] text-ink-2">
              Why investor mood swings between fear and greed — and why the middle is where it spends the least time.
            </span>
            <span className="text-[11px] font-semibold text-link">Start lesson →</span>
          </Link>
          <LightCard className="flex animate-rise flex-col gap-[10px] [animation-delay:225ms]">
            <CardStrip index="03" label="Sourced quotes" />
            {QUOTES.map((x) => (
              <div key={x.id} className="flex flex-col gap-[5px] border-b border-card-border pb-[10px]">
                <span className="font-display text-[20px] uppercase leading-[1.02]">“{x.text}”</span>
                <span className="text-[10.5px] text-card-muted">
                  — {x.author} · {x.source}, {x.year}
                </span>
              </div>
            ))}
            {["Charlie Munger", "Ray Dalio"].map((who) => (
              <div key={who} className="flex flex-col gap-[5px] border-b border-card-border pb-[10px]">
                <span className="font-display text-[20px] uppercase leading-[1.02] text-card-muted">[QUOTE — awaiting verified source]</span>
                <span className="text-[10.5px] text-card-muted">— {who} · [SOURCE, YEAR]</span>
              </div>
            ))}
            <span className="text-[10.5px] leading-[1.45] text-card-muted">A quote appears only with a checkable source: document, date, link.</span>
          </LightCard>
        </div>
      </main>
    </>
  );
}
