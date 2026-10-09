"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardStrip, LightCard, SectionHeader } from "@/components/ui/section-header";
import { POSTURE_STEPS, SOURCES, samplePosture } from "@/lib/data/sample";
import type { SourceKind } from "@/lib/data/types";
import { useLocalStore } from "@/lib/local-store";
import { SOURCE_COLOR } from "@/lib/states";

type Step = "form" | "red" | "saved";
type FieldKey = "title" | "consensus" | "mine" | "priced" | "invalid" | "premortem";

interface Entry {
  id: string;
  title: string;
  fields: Record<FieldKey, string>;
  pricedSource: SourceKind;
  review: string;
  createdAt: string;
  outcome?: "right" | "wrong";
}

const STORAGE_KEY = "cockpit.journal.v1";

const FIELDS: { k: FieldKey; label: string; req: boolean; help: string; ph: string; rows: number }[] = [
  { k: "title", label: "Decision", req: true, help: "One line: what you will do", ph: "e.g. Reduce global equities from [N]% to [N]%", rows: 1 },
  { k: "consensus", label: "Consensus view", req: false, help: "What most investors believe now", ph: "What is the crowd assuming?", rows: 2 },
  { k: "mine", label: "My view", req: true, help: "Where and why you differ", ph: "I think … because …", rows: 3 },
  { k: "priced", label: "What's priced in", req: false, help: "What the market already expects", ph: "Futures imply … · spreads at …", rows: 2 },
  { k: "invalid", label: "Invalidation", req: true, help: "What would prove you wrong — be specific", ph: "I am wrong if … by [DATE]", rows: 2 },
  { k: "premortem", label: "Pre-mortem", req: false, help: "It is a year later and this failed. Why?", ph: "Most likely reason it failed …", rows: 3 },
];

const CHECKS: [string, string, string][] = [
  ["Confirmation bias", "Seeking what agrees", "What is the strongest evidence against this view, and have I read it?"],
  ["Incentives", "Who benefits", "Who gains if I act — a fund, a pundit, my own ego? Would I decide the same without them?"],
  ["Social proof", "Following the crowd", "Would I still do this if nobody I respect was doing it?"],
  ["Overconfidence", "Too sure, too narrow", "What is my honest probability, and what was my hit rate on similar calls?"],
  ["Availability", "Recent and vivid", "Am I reacting to the last headline, or to the base rate?"],
  ["Anchoring", "Stuck on a number", "Which price or forecast am I anchored to, and why should it matter?"],
  ["Loss aversion & sunk cost", "Defending past choices", "If I held nothing today, would I buy this position at this size?"],
  ["Inversion", "Think backwards", "How would I guarantee this fails? Am I doing any of that?"],
];

const EMPTY: Record<FieldKey, string> = { title: "", consensus: "", mine: "", priced: "", invalid: "", premortem: "" };

const fmt = (d: string) =>
  d ? new Date(`${d}T00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "[DATE]";

const NO_ENTRIES: Entry[] = [];

export function Journal() {
  const [step, setStep] = useState<Step>("form");
  const [f, setF] = useState(EMPTY);
  const [src, setSrc] = useState<SourceKind>("market");
  const [checks, setChecks] = useState<boolean[]>(Array(8).fill(false));
  const [review, setReview] = useState("");
  const [entries, persist] = useLocalStore<Entry[]>(STORAGE_KEY, NO_ENTRIES);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash === "#red-team") document.getElementById("red-team-intro")?.scrollIntoView();
  }, []);

  const formOk = (["title", "mine", "invalid"] as FieldKey[]).every((k) => f[k].trim());
  const done = checks.filter(Boolean).length;
  const canSave = done === 8 && !!review;

  const restart = () => {
    setStep("form");
    setF(EMPTY);
    setChecks(Array(8).fill(false));
    setReview("");
    setCurrent(null);
  };

  const save = () => {
    if (!canSave) return;
    const id = current ?? crypto.randomUUID();
    const entry: Entry = { id, title: f.title.trim(), fields: f, pricedSource: src, review, createdAt: new Date().toISOString() };
    persist([entry, ...entries.filter((e) => e.id !== id)]);
    setCurrent(id);
    setStep("saved");
  };

  const open = (e: Entry) => {
    setF(e.fields);
    setSrc(e.pricedSource);
    setReview(e.review);
    setChecks(Array(8).fill(true));
    setCurrent(e.id);
    setStep("saved");
  };

  const si = { form: 0, red: 1, saved: 2 }[step];
  const srcLabel = SOURCES.find((s) => s.kind === src)!.label;

  return (
    <div className="grid min-h-[calc(100dvh-50px)] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex flex-col border-b border-border bg-panel md:border-b-0 md:border-r">
        <div className="border-b border-border p-3">
          <Button onClick={restart} className="w-full">
            + New decision
          </Button>
        </div>
        <div className="px-3 pb-[6px] pt-[10px] text-[10px] font-semibold tracking-[0.08em] text-muted">DECISION LOG</div>
        {entries.length === 0 && <p className="m-0 px-3 py-2 text-[11px] text-muted">No decisions logged yet.</p>}
        {entries.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => open(e)}
            className={`flex flex-col gap-1 border-0 border-b border-border px-3 py-[10px] text-left ${e.id === current ? "bg-raised" : "bg-transparent hover:bg-hover"}`}
          >
            <span className="text-[12px] font-semibold text-ink">{e.title}</span>
            <span className="text-[10.5px] text-muted">Review {fmt(e.review)}</span>
            <span
              className="self-start border-l-[3px] bg-raised py-px pl-[5px] pr-[6px] text-[9.5px] font-semibold tracking-[0.06em]"
              style={{ borderLeftColor: "#FFB84D", color: "#FFB84D" }}
            >
              ◆ OPEN
            </span>
          </button>
        ))}
        <div className="mt-auto border-t border-border p-3 text-[10.5px] leading-[1.5] text-muted">
          Every decision gets a review date. On that day it returns here with what actually happened. Entries are stored in this browser until the database is connected.
        </div>
      </aside>

      <main className="flex min-w-0 flex-col gap-[14px] px-3 pb-6 pt-[18px] md:px-6">
        <h1 className="sr-only">Journal</h1>
        <ol className="m-0 flex list-none gap-[2px] p-0" aria-label="Progress">
          {["Decision", "Red team", "Saved"].map((label, i) => (
            <li key={label} className="flex flex-1 flex-col gap-[6px]" aria-current={i === si ? "step" : undefined}>
              <div className="h-[6px] -skew-x-[14deg]" style={{ background: i <= si ? "#E8590C" : "#111821" }} />
              <span className={`text-[10.5px] font-semibold tracking-[0.08em] ${i === si ? "text-ink" : "text-muted"}`}>
                0{i + 1} · {label.toUpperCase()}
              </span>
            </li>
          ))}
        </ol>

        {step === "form" && (
          <div className="grid animate-rise grid-cols-1 items-start gap-[14px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <form
              className="flex flex-col gap-[14px]"
              onSubmit={(e) => {
                e.preventDefault();
                if (formOk) setStep("red");
              }}
            >
              <SectionHeader index="01" label="The decision" meta="* REQUIRED" />
              {FIELDS.map((d) => (
                <label key={d.k} className="flex flex-col gap-[5px]">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">
                      {d.label}
                      {d.req ? " *" : ""}
                    </span>
                    <span className="text-[11px] text-muted">{d.help}</span>
                  </span>
                  <textarea
                    rows={d.rows}
                    value={f[d.k]}
                    required={d.req}
                    onChange={(e) => setF((s) => ({ ...s, [d.k]: e.target.value }))}
                    placeholder={d.ph}
                    className="resize-y border border-border bg-ground px-[10px] py-2 font-sans text-[14px] leading-[1.5] text-ink placeholder:text-faint focus:border-ember focus:outline-none"
                  />
                </label>
              ))}
              <fieldset className="m-0 flex flex-col gap-[6px] border-0 p-0">
                <legend className="mb-[6px] text-[11px] font-semibold tracking-[0.08em]">WHAT&apos;S PRICED IN — SOURCE</legend>
                <div className="flex flex-wrap gap-[6px]">
                  {SOURCES.map((s) => {
                    const on = s.kind === src;
                    const c = SOURCE_COLOR[s.kind];
                    return (
                      <button
                        key={s.kind}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSrc(s.kind)}
                        className="min-h-9 px-2 py-[5px] text-[10px] font-medium uppercase tracking-[0.06em]"
                        style={{ color: on ? "#000" : c, background: on ? c : "transparent", border: `1px ${s.kind === "mine" ? "dashed" : "solid"} ${c}` }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="flex flex-wrap items-center gap-[10px] border-t border-border pt-3">
                <Button type="submit" disabled={!formOk}>
                  Continue to red team →
                </Button>
                <span className="text-[11px] text-muted">{formOk ? "Snapshot attaches automatically." : "Fill Decision, My view and Invalidation to continue."}</span>
              </div>
            </form>
            <div className="flex flex-col gap-9">
              <LightCard className="flex flex-col gap-2">
                <CardStrip index="02" label="Attached snapshot" />
                <span className="font-display text-[34px] uppercase leading-[0.9]">{POSTURE_STEPS[samplePosture.level]}</span>
                <span className="text-[11px] leading-[1.45] text-card-ink-2">
                  Posture, council states and key prices are frozen with the entry, so you can later compare what you knew with what happened.
                </span>
                <span className="text-[10.5px] font-medium text-card-muted">SAMPLE · [DATE] 07:00 CET</span>
              </LightCard>
              <div id="red-team-intro" className="flex flex-col gap-[6px]">
                <span className="text-[10px] font-semibold tracking-[0.08em] text-ember">WHY WRITE IT DOWN</span>
                <p className="prose-body m-0 text-[13px] text-ink-2">
                  Memory rewrites itself after the outcome. A written view, an exit condition and a pre-mortem are the only honest record of how you decided.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "red" && (
          <div className="grid animate-rise grid-cols-1 items-start gap-[14px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-[2px]">
              <SectionHeader index="03" label="Munger red team" meta={<span style={{ color: done === 8 ? "#22C55E" : "#FFB84D" }} className="font-bold">{done}/8 CHECKED</span>} className="mb-2" />
              <div className="flex flex-wrap items-baseline gap-x-[14px] gap-y-1 pb-[10px]">
                <span className="font-display text-[28px] uppercase leading-[0.9] md:text-[34px]">What would make this stupid?</span>
                <span className="text-[11px] text-muted">Answer each honestly. All eight before you can save.</span>
              </div>
              {CHECKS.map(([k, def, q], i) => {
                const on = checks[i];
                return (
                  <label key={k} className="grid cursor-pointer grid-cols-[28px_minmax(0,1fr)] items-start gap-3 border-t border-border py-[10px] md:grid-cols-[28px_200px_minmax(0,1fr)]">
                    <span className="relative mt-px size-[22px]">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))}
                        className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
                      />
                      <span
                        aria-hidden
                        className={`pointer-events-none flex size-[22px] items-center justify-center border text-[13px] font-bold text-white peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ember ${
                          on ? "border-ember bg-ember" : "border-border-strong bg-ground"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                    </span>
                    <span className="flex flex-col gap-[2px]">
                      <span className={`text-[12px] font-semibold ${on ? "text-ink" : "text-ink-2"}`}>{k}</span>
                      <span className="text-[10.5px] text-muted">{def}</span>
                    </span>
                    <span className="prose-body col-start-2 text-[13px] text-ink-2 md:col-start-3">{q}</span>
                  </label>
                );
              })}
              <div className="mt-1 flex flex-wrap items-center gap-[10px] border-t border-border pt-3">
                <Button variant="secondary" onClick={() => setStep("form")}>
                  ← Back
                </Button>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em]">
                  REVIEW ON
                  <input
                    type="date"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="min-h-9 border border-border bg-ground px-2 py-[7px] text-[12px] font-medium text-ink [color-scheme:dark]"
                  />
                </label>
                <Button onClick={save} disabled={!canSave} className="md:ml-auto">
                  Save decision
                </Button>
              </div>
              <span className="mt-[6px] self-end text-[10.5px] text-muted" aria-live="polite">
                {canSave
                  ? "Ready to save."
                  : done < 8
                    ? `${8 - done} check${8 - done === 1 ? "" : "s"} left${review ? "" : " · set a review date"}`
                    : "Set a review date to save."}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <SectionHeader index="04" label="You are deciding" />
              <span className="text-[13px] font-semibold leading-[1.4]">{f.title.trim() || "[DECISION]"}</span>
              <span className="mt-1 text-[10px] font-semibold tracking-[0.08em] text-muted">INVALIDATION</span>
              <span className="prose-body text-[13px] text-ink-2">{f.invalid.trim() || "—"}</span>
              <span className="border-t border-border pt-2 text-[10.5px] leading-[1.5] text-muted">
                Inversion: imagine it is the review date and this went badly. The checklist is a structured way of asking why.
              </span>
            </div>
          </div>
        )}

        {step === "saved" && (
          <div className="grid animate-rise grid-cols-1 items-start gap-[14px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <LightCard className="flex flex-col gap-[14px]">
              <CardStrip
                index="05"
                label="Saved entry"
                meta={
                  <span className="border-l-[3px] border-card-up bg-card-raised py-px pl-[6px] pr-[7px] font-semibold text-card-up">✓ RED-TEAMED 8/8</span>
                }
              />
              <span className="font-display text-[34px] uppercase leading-[0.92] text-pretty md:text-[46px]">{f.title.trim() || "[DECISION]"}</span>
              <div className="grid grid-cols-1 gap-x-6 gap-y-[14px] md:grid-cols-2">
                {(
                  [
                    ["MY VIEW", f.mine],
                    ["CONSENSUS", f.consensus],
                    [`PRICED IN · ${srcLabel.toUpperCase()}`, f.priced],
                    ["INVALIDATION", f.invalid],
                    ["PRE-MORTEM", f.premortem],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1 border-t border-card-border pt-2">
                    <span className="text-[10px] font-semibold tracking-[0.08em] text-card-muted">{k}</span>
                    <span className="whitespace-pre-wrap font-sans text-[13px] leading-[1.5] text-card-ink-2">{v.trim() || "—"}</span>
                  </div>
                ))}
              </div>
            </LightCard>
            <div className="flex flex-col gap-9">
              <div className="flex flex-col gap-[6px] border border-border border-t-2 border-t-ember bg-panel p-3">
                <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">REVIEW DATE</span>
                <span className="text-[26px] font-semibold">{fmt(review)}</span>
                <span className="prose-body text-[13px] text-ink-2">
                  You&apos;ll be asked: was the view right, was it right for the right reasons, and did the invalidation trigger?
                </span>
              </div>
              <div className="flex gap-2">
                <Button onClick={restart} className="flex-1">
                  New decision
                </Button>
                <Button variant="secondary" onClick={() => setStep("form")} className="flex-1">
                  Edit
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
