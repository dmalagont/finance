"use client";

import Link from "next/link";
import { useState } from "react";
import { CardStrip, LightCard, SectionHeader } from "@/components/ui/section-header";

const STAGES = [
  {
    k: "FEAR",
    c: "#EF4444",
    angle: -40,
    short: "Panic. Safety at any price.",
    detail: [
      ["INVESTORS", "Sell what they must, not what they should. Cash feels like the only safe asset."],
      ["PRICES", "Below fair value. Bargains appear but nobody wants them."],
      ["CREDIT", "Hard to get. Spreads wide, issuance stops."],
    ],
  },
  {
    k: "THE MIDDLE",
    c: "#B8C4D3",
    angle: 0,
    short: "Balanced. Rare and brief.",
    detail: [
      ["INVESTORS", "Weigh risk and return fairly. Few headlines."],
      ["PRICES", "Close to fair value."],
      ["CREDIT", "Available at sensible terms."],
    ],
  },
  {
    k: "GREED",
    c: "#22C55E",
    angle: 40,
    short: "Euphoria. Risk feels absent.",
    detail: [
      ["INVESTORS", "Fear missing out more than losing money."],
      ["PRICES", "Above fair value, justified by “this time is different”."],
      ["CREDIT", "Easy. Spreads tight, weak borrowers funded."],
    ],
  },
] as const;

const IDLE = [
  ["INVESTORS", "Pick a stage to see how people behave."],
  ["PRICES", "Or let it swing and watch how little time it spends in the middle."],
  ["CREDIT", "Credit usually swings with mood."],
];

const OPTIONS = ["Near fear", "In the middle", "Toward greed"];

export function PendulumLesson() {
  const [stage, setStage] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [ans, setAns] = useState<number | null>(null);
  const cur = stage == null ? null : STAGES[stage];
  const detail = cur ? cur.detail : IDLE;

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-border px-3 py-3 text-[11px] font-medium tracking-[0.06em] text-muted md:px-8">
        <nav aria-label="Breadcrumb">
          <Link href="/learn" className="text-muted no-underline hover:text-ink">
            LEARN
          </Link>{" "}
          / LESSONS / <span className="text-ink">THE PENDULUM</span>
        </nav>
        <span className="ml-auto">HOWARD MARKS · 6 MIN</span>
      </div>
      <main className="mx-auto grid max-w-[1600px] grid-cols-1 items-start gap-10 p-3 md:p-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <h1 className="sr-only">Lesson: the pendulum</h1>
        <section aria-labelledby="swing-h" className="flex flex-col gap-[14px]">
          <div className="flex items-center gap-[10px] border-b border-ink pb-[10px] text-[11px] font-semibold uppercase tracking-[0.08em]">
            <span className="font-bold text-ember">01</span>
            <h2 id="swing-h" className="m-0 text-[11px] font-semibold">
              Watch it swing
            </h2>
            <button
              type="button"
              onClick={() => {
                setPlaying((p) => !p);
                if (!playing) setStage(null);
              }}
              className="ml-auto min-h-9 border border-border bg-panel px-[10px] text-[10.5px] font-semibold tracking-[0.06em] text-ink"
            >
              {playing ? "❚❚ HOLD" : "▶ SWING"}
            </button>
          </div>
          <div
            className="relative h-[280px] overflow-hidden md:h-[340px]"
            style={{ background: "radial-gradient(circle at 50% 0%,#0B1118 0,#060A0F 70%)" }}
            role="img"
            aria-label={cur ? `Pendulum held at ${cur.k.toLowerCase()}` : "Pendulum swinging between fear and greed"}
          >
            <div className="absolute left-1/2 top-6 -ml-[280px] size-[560px] rounded-full border border-dashed border-border" />
            <div className="absolute left-1/2 top-[18px] -ml-[6px] size-3 bg-ember" />
            <div
              className="absolute left-1/2 top-6 -ml-px h-[220px] w-[2px] origin-top bg-ink-2 md:h-[280px]"
              style={{
                transform: `rotate(${cur ? cur.angle : 0}deg)`,
                transition: "transform 700ms cubic-bezier(0.23,1,0.32,1)",
                animation: playing ? "swing 2.6s cubic-bezier(0.45,0,0.55,1) infinite alternate" : "none",
              }}
            >
              <div className="absolute -bottom-[34px] -left-[17px] size-9" style={{ background: cur ? cur.c : "#E8590C", transition: "background 400ms" }} />
            </div>
            <span className="absolute bottom-9 left-4 font-display text-[36px] uppercase leading-[0.9] text-down md:left-11 md:text-[46px]">Fear</span>
            <span className="absolute bottom-9 right-4 font-display text-[36px] uppercase leading-[0.9] text-up md:right-11 md:text-[46px]">Greed</span>
            <span className="absolute bottom-[6px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tracking-[0.08em] text-muted">
              THE MIDDLE · RARELY VISITED
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {STAGES.map((s, i) => (
              <button
                key={s.k}
                type="button"
                aria-pressed={stage === i}
                onClick={() => {
                  setStage(i);
                  setPlaying(false);
                }}
                className="flex flex-col gap-1 px-3 py-[10px] text-left text-ink"
                style={{ border: `1px solid ${stage === i ? s.c : "#202A36"}`, background: stage === i ? "#111821" : "#060A0F" }}
              >
                <span className="text-[10px] font-semibold tracking-[0.08em]" style={{ color: s.c }}>
                  0{i + 1} · {s.k}
                </span>
                <span className="text-[11px] leading-[1.4] text-ink-2">{s.short}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-x-6 border-t border-border md:grid-cols-3" aria-live="polite">
            {detail.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 border-b border-border px-3 py-[10px]">
                <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">{k}</span>
                <span className="font-sans text-[13px] leading-[1.5] text-ink">{v}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-9">
          <section aria-labelledby="idea-h" className="flex flex-col gap-[10px]">
            <SectionHeader index="02" label={<span id="idea-h">The idea</span>} />
            <span className="font-display text-[30px] uppercase leading-[0.92] md:text-[36px]">Mood overshoots in both directions</span>
            <p className="prose-body m-0 text-ink-2">
              Howard Marks describes investor psychology as a pendulum. It swings from euphoria, when risk feels absent, to panic, when nothing feels safe. It rarely rests
              at the sensible middle. The investor&apos;s job is not to predict the next swing, but to notice how far out it already is — and to lean the other way when
              it&apos;s extreme.
            </p>
            <p className="prose-body m-0 text-ink-2">In the cockpit, the Marks gauge reads where the pendulum sits today using credit spreads, volatility and sentiment.</p>
            <Link href="/indicators/hy-oas" className="text-[11px] font-medium">
              See today&apos;s reading: HY credit spread →
            </Link>
          </section>
          <LightCard className="flex flex-col gap-2">
            <CardStrip index="03" label="In his words" />
            <span className="font-display text-[24px] uppercase leading-[1.02] text-card-muted">[VERIFIED MARKS QUOTE ON THE PENDULUM]</span>
            <span className="text-[10.5px] text-card-muted">— Howard Marks · The Most Important Thing (2011), ch. [N] · page [N]</span>
          </LightCard>
          <section aria-labelledby="quiz-h" className="flex flex-col gap-2">
            <SectionHeader index="04" label={<span id="quiz-h">Check yourself</span>} />
            <span className="text-[12.5px] font-semibold leading-[1.45]">Spreads are near record lows and new issues are oversubscribed. Where is the pendulum?</span>
            {OPTIONS.map((t, i) => (
              <button
                key={t}
                type="button"
                aria-pressed={ans === i}
                onClick={() => setAns(i)}
                className="min-h-11 px-[10px] py-[9px] text-left text-[12px] font-medium text-ink"
                style={{ border: `1px solid ${ans === i ? (i === 2 ? "#22C55E" : "#EF4444") : "#202A36"}`, background: ans === i ? "#111821" : "#000" }}
              >
                {t}
              </button>
            ))}
            <span className="font-sans text-[13px] leading-[1.5]" aria-live="polite" style={{ color: ans == null ? "#8693A6" : ans === 2 ? "#22C55E" : "#EF4444" }}>
              {ans == null
                ? "Pick one."
                : ans === 2
                  ? "Right. Tight spreads and eager lenders mean risk is being ignored — the pendulum is out toward greed."
                  : "Not quite. Tight spreads and eager lenders mean investors are ignoring risk — that is the greed side."}
            </span>
          </section>
        </div>
      </main>
    </>
  );
}
