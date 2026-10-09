import type { Metadata } from "next";
import Link from "next/link";
import { Sparkline } from "@/components/charts/sparkline";
import { PanelTabs } from "@/components/panels/panel-tabs";
import { RangeRail } from "@/components/ui/data-cell";
import { CardStrip, LightCard, SectionHeader } from "@/components/ui/section-header";
import { StateTag } from "@/components/ui/tags";
import { ConceptTooltip, Tooltip } from "@/components/ui/tooltip";
import { indicator } from "@/lib/data/indicators";
import { SOURCES, sampleIndicatorState, sampleNorwayThemes } from "@/lib/data/sample";
import { hashSeed } from "@/lib/illustrative";
import { FREQ_LABEL, SOURCE_COLOR, STATE_COLOR, STATE_TAG } from "@/lib/states";

export const metadata: Metadata = { title: "Norway" };

const CELLS = ["nowa", "no-10y", "cpi-ate", "mainland-gdp", "no-unemployment", "no-household-debt", "no-house-prices", "brent"];
const KRONE = [
  { id: "i44", label: "I-44 · TRADE-WEIGHTED" },
  { id: "eurnok", label: "EUR / NOK" },
  { id: "usdnok", label: "USD / NOK" },
];

const TAX = [
  {
    k: "ASK",
    sub: "AKSJESPAREKONTO",
    v: "Buy and sell listed shares and equity funds inside the account without tax on each gain. Tax is due only when you take out more than you paid in.",
    fig: "Fund equity share > [80]% · shield rate [RATE]",
    concept: "ask",
  },
  {
    k: "Formuesskatt",
    sub: "WEALTH TAX",
    v: "An annual tax on net wealth above a threshold. Shares and funds are valued at a discount, so the tax depends on what you hold, not just how much.",
    fig: "Threshold [NOK] · share discount [N]%",
    concept: "formuesskatt",
  },
  {
    k: "IPS",
    sub: "INDIVIDUAL PENSION SAVINGS",
    v: "Contributions are tax-deductible up to a yearly limit. Money is locked until age 62 and paid out over at least ten years, taxed as pension income.",
    fig: "Annual limit [NOK] · deduction rate [N]%",
    concept: "ips",
  },
];

function PolicyPathChart() {
  const W = 1000;
  const H = 230;
  const hist: [number, number][] = [
    [0, 0.45], [0.06, 0.38], [0.1, 0.25], [0.16, 0.18], [0.24, 0.15], [0.3, 0.12], [0.36, 0.2],
    [0.4, 0.3], [0.44, 0.45], [0.48, 0.6], [0.52, 0.7], [0.56, 0.75], [0.62, 0.75],
  ];
  const step = hist
    .map(([x, y], i) => (i ? `${x * W},${(1 - hist[i - 1][1]) * H} ${x * W},${(1 - y) * H}` : `${x * W},${(1 - y) * H}`))
    .join(" ");
  const xs = [0.62, 0.7, 0.78, 0.86, 0.94, 1];
  const nbY = [0.75, 0.72, 0.66, 0.6, 0.55, 0.52];
  const nb = xs.map((x, i) => `${x * W},${(1 - nbY[i]) * H}`).join(" ");
  const mkt = xs.map((x, i) => `${x * W},${(1 - (nbY[i] - i * 0.025)) * H}`).join(" ");
  const fan = [
    ...xs.map((x, i) => `${x * W},${(1 - (nbY[i] + i * 0.04)) * H}`),
    ...xs
      .slice()
      .reverse()
      .map((x, j) => {
        const i = xs.length - 1 - j;
        return `${x * W},${(1 - (nbY[i] - i * 0.05)) * H}`;
      }),
  ].join(" ");
  return (
    <div className="relative h-[200px] border border-border bg-panel md:h-[230px]" role="img" aria-label="Policy rate history, Norges Bank path with uncertainty fan, and market-implied path. Illustrative shape, not data.">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full animate-draw [animation-delay:200ms]" aria-hidden>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={f * H} y2={f * H} stroke="#111821" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <polygon points={fan} fill="rgba(232,89,12,.14)" />
        <polyline points={step} fill="none" stroke="#B8C4D3" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <polyline points={nb} fill="none" stroke="#E8590C" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        <polyline points={mkt} fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute left-3 top-[10px] max-w-[calc(100%-24px)] truncate bg-ground px-[5px] py-px text-[10.5px] font-medium text-ink-2">
        Policy rate · NB path with uncertainty fan · market-implied · ILLUSTRATIVE SHAPE — NOT DATA
      </span>
      <div className="absolute inset-y-0 left-[62%] border-l border-muted">
        <span className="absolute left-[6px] top-[30px] bg-ground px-[5px] py-px text-[10px] font-semibold text-ink">TODAY</span>
      </div>
      <div className="absolute bottom-[10px] right-[10px] flex flex-wrap justify-end gap-x-[14px] text-[10.5px] font-medium">
        <span className="text-ember">▬ Norges Bank path</span>
        <span className="text-link">┅ Market-implied</span>
        <span className="text-ink-2">— History</span>
      </div>
    </div>
  );
}

export default function NorwayPage() {
  return (
    <>
      <PanelTabs active="norway" />
      <main className="mx-auto flex max-w-[1600px] flex-col gap-10 px-3 pb-9 pt-3 md:px-8 md:pt-7">
        <LightCard className="grid animate-rise grid-cols-1 gap-7 [animation-delay:60ms] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="lg:col-span-2">
            <CardStrip index="01" label="Panel summary" meta="SAMPLE STATE" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="m-0 font-display text-[56px] uppercase leading-[0.86] md:text-[72px]">Norway</h1>
            <span className="text-[12.5px] font-medium leading-[1.45] text-card-ink-2">What do rates, the krone, oil and housing mean for my NOK goals?</span>
          </div>
          <div className="grid grid-cols-2 content-end gap-[14px] md:grid-cols-4">
            {sampleNorwayThemes.map((t) => (
              <div key={t.key} className="flex flex-col gap-[6px] pt-2" style={{ borderTop: `3px solid ${STATE_COLOR[t.state].light}` }}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-card-muted">{t.key}</span>
                <span className="text-[11px] font-semibold" style={{ color: STATE_COLOR[t.state].light }}>
                  {STATE_TAG[t.state].glyph} {STATE_TAG[t.state].word}
                </span>
                <span className="text-[11px] leading-[1.4] text-card-ink-2">[READ]</span>
              </div>
            ))}
          </div>
        </LightCard>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <section aria-labelledby="rate-h" className="flex min-w-0 animate-rise flex-col gap-[10px] [animation-delay:115ms]">
            <SectionHeader
              index="02"
              label={<span id="rate-h">Norges Bank policy rate &amp; path</span>}
              meta={
                <ConceptTooltip id="monetary-policy-report" align="right">
                  MPR [N]/[YEAR]
                </ConceptTooltip>
              }
            />
            <div className="grid grid-cols-2 gap-x-6 border-t border-border md:grid-cols-4">
              {[
                { k: "POLICY RATE", v: "––.––%", flash: true },
                { k: "LAST DECISION", v: "[DATE] · HOLD" },
                { k: "NEXT MEETING", v: "[DATE]" },
                { k: "PATH · 12M AHEAD", v: "––.––%" },
              ].map((s) => (
                <Link key={s.k} href="/indicators/nb-policy-rate" className="flex flex-col gap-1 border-b border-border px-[10px] py-2 text-ink no-underline hover:text-ink">
                  <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">{s.k}</span>
                  <span className={`text-[20px] font-semibold ${s.flash ? "animate-[flash-up_5s_ease-out_2s_infinite]" : ""}`}>{s.v}</span>
                </Link>
              ))}
            </div>
            <PolicyPathChart />
            <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4">
              {SOURCES.map((s) => (
                <div key={s.kind} className="flex flex-col gap-1 bg-raised px-[10px] py-2" style={{ borderLeft: `3px solid ${SOURCE_COLOR[s.kind]}` }}>
                  <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">{s.kind === "base" ? "CUT · BASE RATE" : s.kind === "mine" ? "CUT · MY ESTIMATE" : "NEXT MEETING · CUT"}</span>
                  <span className="text-[12px] font-semibold">––%</span>
                  <span className="text-[9.5px] font-medium" style={{ color: SOURCE_COLOR[s.kind] }}>
                    {s.label.toUpperCase()}
                    {s.kind === "base" ? " · n=––" : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="krone-h" className="flex animate-rise flex-col [animation-delay:170ms]">
            <SectionHeader
              index="03"
              label={
                <span id="krone-h">
                  <Tooltip
                    title="Reading the krone"
                    body="I-44 is a trade-weighted index against 44 trading partners. Higher means a weaker krone. EURNOK and USDNOK higher also mean a weaker krone."
                  >
                    The krone
                  </Tooltip>
                </span>
              }
              className="mb-[6px]"
            />
            {KRONE.map((d) => {
              const ind = indicator(d.id)!;
              const st = sampleIndicatorState[d.id] ?? "watch";
              return (
                <Link key={d.id} href={`/indicators/${d.id}`} className="hover-row flex flex-col gap-[5px] border-b border-border py-[10px] text-ink no-underline hover:text-ink">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold tracking-[0.08em]">{d.label}</span>
                    <StateTag state={st} />
                  </div>
                  <span className="text-[24px] font-semibold leading-none">––.––</span>
                  <RangeRail />
                  <span className="text-[11px] leading-[1.4] text-ink-2">{ind.line}</span>
                </Link>
              );
            })}
          </section>
        </div>

        <section aria-label="Norwegian indicators" className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-4">
          {CELLS.map((id, i) => {
            const ind = indicator(id)!;
            const st = sampleIndicatorState[id] ?? "watch";
            return (
              <Link
                key={id}
                href={`/indicators/${id}`}
                className="hover-row flex animate-rise flex-col gap-[7px] text-ink no-underline hover:text-ink"
                style={{ animationDelay: `${230 + i * 55}ms` }}
              >
                <div className="flex gap-2 border-b border-ink pb-[10px] text-[10.5px] font-semibold uppercase tracking-[0.08em]">
                  <span className="font-bold text-ember">{String(i + 4).padStart(2, "0")}</span>
                  <h2 className="m-0 truncate text-[10.5px] font-semibold">{ind.name}</h2>
                  <span className="ml-auto shrink-0" style={{ color: STATE_COLOR[st].dark }}>
                    {STATE_TAG[st].glyph} {STATE_TAG[st].word}
                  </span>
                </div>
                <span className="text-[24px] font-semibold leading-none">
                  ––.––<span className="ml-1 text-[11px] text-muted">{ind.unit}</span>
                </span>
                <Sparkline seed={hashSeed(id)} color={STATE_COLOR[st].dark} label="10Y · ILLUSTRATIVE" height={36} area={false} />
                <span className="text-[11px] leading-[1.45] text-ink-2 text-pretty">{ind.line}</span>
                <span className="border-t border-border pt-[6px] text-[10px] font-medium text-muted">
                  {ind.source.provider} · {FREQ_LABEL[ind.frequency]}
                </span>
              </Link>
            );
          })}
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <section aria-labelledby="fund-h" className="flex animate-rise flex-col gap-[10px] [animation-delay:600ms]">
            <SectionHeader index="12" label={<span id="fund-h">Oil fund &amp; fiscal rule</span>} />
            <div className="grid grid-cols-2 gap-x-6 border-t border-border">
              <div className="flex flex-col gap-1 border-b border-border px-[10px] py-2">
                <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">GPFG MARKET VALUE</span>
                <span className="text-[22px] font-semibold">
                  ––.–– <span className="text-[11px] text-muted">NOK tn</span>
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-border px-[10px] py-2">
                <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">OIL MONEY SPENT · BUDGET [YEAR]</span>
                <span className="text-[22px] font-semibold">
                  ––.–– <span className="text-[11px] text-muted">% of fund</span>
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-[5px]">
              <div className="relative h-[10px] bg-raised">
                <div className="absolute -top-[5px] left-[60%] h-5 w-[2px] bg-ember" />
                <span className="absolute -top-6 left-[60%] -translate-x-1/2 text-[10px] font-semibold text-ember">
                  <ConceptTooltip id="fiscal-rule" side="top">
                    3% RULE
                  </ConceptTooltip>
                </span>
              </div>
              <div className="flex justify-between text-[9.5px] text-muted">
                <span>0%</span>
                <span>5%</span>
              </div>
            </div>
            <p className="prose-body m-0 text-ink-2">
              The fiscal rule lets the government spend, over time, about the fund&apos;s expected real return — set at 3% of its value. A falling krone or rising markets
              grow the fund in NOK; a crash shrinks the room.
            </p>
          </section>

          <section aria-labelledby="tax-h" className="flex animate-rise flex-col gap-[10px] [animation-delay:655ms]">
            <SectionHeader index="13" label={<span id="tax-h">Learn · Norwegian tax notes</span>} meta="RULES CHANGE YEARLY · VERIFY ON SKATTEETATEN.NO" />
            <div className="grid grid-cols-1 gap-x-6 border-t border-border md:grid-cols-3">
              {TAX.map((x) => (
                <div key={x.k} className="flex flex-col gap-[6px] border-b border-border px-3 py-[10px]">
                  <span className="font-display text-[24px] uppercase leading-[0.95]">{x.k}</span>
                  <span className="text-[10px] font-semibold tracking-[0.08em] text-ember">{x.sub}</span>
                  <span className="prose-body text-[13px] text-ink-2">{x.v}</span>
                  <span className="text-[10.5px] font-medium text-muted">{x.fig}</span>
                  <Link href={`/learn#concept-${x.concept}`} className="text-[10.5px] font-medium">
                    Lesson →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
