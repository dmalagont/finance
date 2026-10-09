import type { Metadata } from "next";
import Link from "next/link";
import { RegimeChart, YouAreHere } from "@/components/charts/regime-chart";
import { DisagreementStrip } from "@/components/council/disagreement-strip";
import { CommandLine } from "@/components/layout/command-line";
import { Ticker } from "@/components/layout/ticker";
import { ButtonLink } from "@/components/ui/button";
import { CouncilGauge } from "@/components/ui/council-gauge";
import { PostureSelector } from "@/components/ui/posture-selector";
import { QuoteBlock } from "@/components/ui/quote-block";
import { SectionHeader } from "@/components/ui/section-header";
import { StateTag } from "@/components/ui/tags";
import { Tooltip } from "@/components/ui/tooltip";
import { MEMBERS, member } from "@/lib/data/members";
import { POSTURE_STEPS, SOURCES, sampleChanges, sampleCouncil, samplePosture, sampleQuestions } from "@/lib/data/sample";
import type { Member } from "@/lib/data/types";
import { SOURCE_COLOR, STATE_COLOR, STATE_TAG, scoreState } from "@/lib/states";

export const metadata: Metadata = { title: "Council" };

const memberHref = (m: Member) => (m.id === "munger" ? "/journal" : m.panel === "norway" ? "/norway" : `/panels/${m.panel}`);

export default function CouncilHome() {
  const posture = samplePosture;
  return (
    <>
      <Ticker />
      <CommandLine />
      <main className="mx-auto flex max-w-[1600px] flex-col gap-8 px-3 pb-9 pt-3 md:gap-10 md:px-8 md:pt-7">
        <h1 className="sr-only">Council home</h1>
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-10 xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]">
          {/* 01 Posture */}
          <section
            aria-labelledby="posture-h"
            className="flex animate-rise flex-col gap-3 bg-card px-3 pb-3 pt-[10px] text-card-ink [animation-delay:60ms] md:col-span-2 md:gap-4 md:px-5 md:pb-5 md:pt-[18px] xl:col-span-1"
          >
            <div className="flex gap-[10px] text-[11px] font-semibold uppercase tracking-[0.08em]">
              <span className="font-bold text-card-index">01</span>
              <h2 id="posture-h" className="m-0 text-[11px] font-semibold">
                Posture
              </h2>
              <span className="ml-auto font-medium text-card-muted">SAMPLE · [DATE]</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
              <span className="font-display text-[56px] uppercase leading-[0.84] md:text-[84px]">{POSTURE_STEPS[posture.level]}</span>
              <span className="max-w-[240px] pb-[6px] text-[12px] font-medium leading-[1.45] text-card-ink-2">{posture.instruction}</span>
            </div>
            <PostureSelector level={posture.level} />
            <div className="flex flex-col gap-2 pt-1">
              {posture.reasons.map((r) => (
                <div key={r.member} className="grid grid-cols-[minmax(0,1fr)] gap-1 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-baseline sm:gap-3">
                  <span className="font-display text-[17px] uppercase leading-none" style={{ color: STATE_COLOR[r.state].light }}>
                    {member(r.member).short}
                  </span>
                  <span className="text-[12px] leading-[1.4] text-card-ink-2">
                    {r.why} <span className="sr-only">({STATE_TAG[r.state].word})</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-[10px]">
              <ButtonLink href="/journal">Log decision</ButtonLink>
              <Link
                href="/journal#red-team"
                className="text-[11px] font-semibold tracking-[0.08em] text-card-ink underline decoration-card-index underline-offset-4 hover:text-card-ink"
              >
                RED TEAM IT
              </Link>
              <Link href="/learn#concept-regime" className="ml-auto text-[11px] font-medium text-card-link hover:text-card-link">
                How posture is set →
              </Link>
            </div>
          </section>

          {/* 02 What changed */}
          <section aria-labelledby="changed-h" className="flex animate-rise flex-col [animation-delay:115ms]">
            <SectionHeader index="02" label={<span id="changed-h">What changed</span>} meta="THIS WEEK" />
            {sampleChanges.map((c, i) => (
              <Link
                key={c.what}
                href={c.indicator ? `/indicators/${c.indicator}` : "#"}
                className={`hover-row grid grid-cols-[14px_minmax(0,1fr)_auto] items-baseline gap-[10px] border-b border-border py-3 text-ink no-underline hover:text-ink ${i > 2 ? "hidden md:grid" : ""}`}
              >
                <span className="text-[11px] font-bold" style={{ color: STATE_COLOR[c.state].dark }} aria-label={STATE_TAG[c.state].word}>
                  {STATE_TAG[c.state].glyph}
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-[12.5px] font-semibold">{c.what}</span>
                  <span className="text-[11px] text-muted">{c.note}</span>
                </span>
                <span className="text-[10px] font-medium text-muted">{c.day}</span>
              </Link>
            ))}
          </section>

          {/* 03 What may happen */}
          <section aria-labelledby="happen-h" className="flex animate-rise flex-col gap-[18px] [animation-delay:170ms]">
            <SectionHeader index="03" label={<span id="happen-h">What may happen</span>} />
            {sampleQuestions.map((e) => (
              <div key={e.q} className="flex flex-col gap-2">
                <span className="text-[12.5px] font-semibold leading-[1.35]">{e.q}</span>
                <div className="grid grid-cols-4 gap-2">
                  {SOURCES.map((s) => (
                    <div key={s.kind} className="flex flex-col gap-[3px] pt-[6px]" style={{ borderTop: `2px ${s.kind === "mine" ? "dashed" : "solid"} ${SOURCE_COLOR[s.kind]}` }}>
                      <span className="text-base font-semibold">––%</span>
                      <Tooltip title={s.label} body={<>{s.tip} Hit rate: ––%.</>} plain side="top" align={s.kind === "mine" || s.kind === "base" ? "right" : "left"}>
                        <span className="text-[9px] font-medium tracking-[0.04em]" style={{ color: SOURCE_COLOR[s.kind] }}>
                          {s.short}
                        </span>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <span className="text-[10.5px] leading-[1.45] text-muted">Market · Model · Base rate · Mine — never blended. Hit rates on hover.</span>
          </section>
        </div>

        {/* 04 The council */}
        <section aria-labelledby="council-h" className="flex animate-rise flex-col [animation-delay:225ms]">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ink pb-3">
            <span className="text-[11px] font-bold text-ember">04</span>
            <h2 id="council-h" className="m-0 font-display text-[32px] uppercase leading-[0.9] md:text-[40px]">
              The council
            </h2>
            <Tooltip
              title="Council gauge"
              body="Each member scores 1 (conditions support taking risk) to 5 (conditions argue for caution). Colour follows the score: green 1–2, amber 3, red 4–5."
              className="text-[11px] font-medium text-muted"
            >
              1 supportive → 5 risky
            </Tooltip>
            <span className="ml-auto text-[11px] font-medium text-muted">SAMPLE STATES</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-10">
            {MEMBERS.map((m, i) => {
              const n = sampleCouncil[m.id];
              const st = scoreState(n);
              return (
                <Link
                  key={m.id}
                  href={memberHref(m)}
                  className="hover-row flex animate-rise flex-col gap-[9px] border-b border-border py-3 text-ink no-underline hover:text-white md:py-[18px]"
                  style={{ animationDelay: `${280 + i * 55}ms` }}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-[19px] uppercase leading-[0.95] md:text-2xl">{m.name}</span>
                    <StateTag state={st} />
                  </div>
                  <CouncilGauge score={n} delayMs={480 + i * 55} />
                  <span className="min-h-8 text-[11.5px] leading-[1.4] text-ink-2 text-pretty">{m.question}</span>
                  <span className="text-[11.5px] text-muted">[ONE-LINE READ]</span>
                </Link>
              );
            })}
          </div>
          <DisagreementStrip scores={sampleCouncil} />
        </section>

        {/* 05 What happened + quote */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <section aria-labelledby="regime-h" className="flex animate-rise flex-col gap-3 [animation-delay:500ms]">
            <SectionHeader index="05" label={<span id="regime-h">What happened · regimes since 2000</span>} meta="DALIO" />
            <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-[minmax(0,1fr)_170px]">
              <RegimeChart />
              <YouAreHere />
            </div>
          </section>
          <div className="animate-rise [animation-delay:555ms]">
            <QuoteBlock id="buffett-fearful">
              <Link href="/learn/pendulum" className="text-[11px] font-medium">
                Lesson: the pendulum →
              </Link>
            </QuoteBlock>
          </div>
        </div>
      </main>
    </>
  );
}
