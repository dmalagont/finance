import type { Metadata } from "next";
import { Allocation } from "@/components/portfolio/allocation";
import { HedgeRatio } from "@/components/portfolio/hedge-ratio";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { SourceTag } from "@/components/ui/tags";
import { ConceptTooltip, Tooltip } from "@/components/ui/tooltip";
import type { SourceKind } from "@/lib/data/types";

export const metadata: Metadata = { title: "Portfolio lab" };

const RISK_ROWS = ["Equities", "Bonds", "Gold", "Cash", "Currency (unhedged)"];

/** Regimes are never green/red: grey borders, current regime in ember. */
const REGIMES = [
  { k: "Growth ↑ · Inflation ↓", wins: "equities, credit", current: true },
  { k: "Growth ↑ · Inflation ↑", wins: "commodities, inflation-linked bonds", current: false },
  { k: "Growth ↓ · Inflation ↓", wins: "nominal bonds, cash", current: false },
  { k: "Growth ↓ · Inflation ↑", wins: "gold, inflation-linked bonds", current: false },
];

const SCENARIOS: { k: string; d: string; src: SourceKind }[] = [
  { k: "Soft landing", d: "Inflation eases, no recession", src: "model" },
  { k: "Recession", d: "Earnings fall, rates cut", src: "base" },
  { k: "Stagflation", d: "Weak growth, sticky inflation", src: "model" },
  { k: "Inflation boom", d: "Strong growth, rising prices", src: "mine" },
  { k: "Krone shock", d: "NOK −15% vs basket", src: "market" },
  { k: "Oil collapse", d: "Brent −40%, fiscal room shrinks", src: "base" },
];

const REFS = ["Mine", "All Weather", "60/40", "Permanent", "Barbell"];
const REF_ROWS: [string, string[]][] = [
  ["Equities", ["––%", "30%", "60%", "25%", "—"]],
  ["Long bonds", ["––%", "40%", "—", "25%", "—"]],
  ["Interm. bonds", ["––%", "15%", "40%", "—", "—"]],
  ["Gold", ["––%", "7.5%", "—", "25%", "—"]],
  ["Commodities", ["––%", "7.5%", "—", "—", "—"]],
  ["Cash", ["––%", "—", "—", "25%", "—"]],
  ["Very safe / convex", ["––%", "—", "—", "—", "~85–90 / 10–15"]],
  ["Max drawdown", ["––%", "––%", "––%", "––%", "––%"]],
  ["Crash payoff −40%", ["––", "––", "––", "––", "––"]],
];

function CrashPayoffChart() {
  const mx = (x: number) => ((x + 40) / 60) * 300;
  const my = (y: number) => 52 - (y / 40) * 78;
  const linear = [-40, 20].map((x) => `${mx(x)},${my(x * 0.75)}`).join(" ");
  const convex = Array.from({ length: 31 }, (_, i) => {
    const x = -40 + i * 2;
    const y = x * 0.75 + 0.022 * Math.max(0, -x - 8) ** 2 - 0.2;
    return `${mx(x).toFixed(1)},${my(y).toFixed(1)}`;
  }).join(" ");
  return (
    <div className="relative h-[130px] border border-border bg-ground" role="img" aria-label="Portfolio return versus market return, with and without a convex sleeve. Illustrative.">
      <svg viewBox="0 0 300 130" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
        <line x1="200" x2="200" y1="0" y2="130" stroke="#202A36" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="0" x2="300" y1="52" y2="52" stroke="#202A36" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polyline points={linear} fill="none" stroke="#8693A6" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <polyline points={convex} fill="none" stroke="#E8590C" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute left-[6px] top-1 text-[9.5px] font-medium text-faint">PORTFOLIO vs MARKET · ILLUSTRATIVE</span>
      <span className="absolute bottom-[3px] left-[6px] text-[9.5px] font-medium text-muted">−40%</span>
      <span className="absolute bottom-[3px] left-[62%] text-[9.5px] font-medium text-muted">0</span>
      <span className="absolute bottom-[3px] right-[6px] text-[9.5px] font-medium text-muted">+20%</span>
      <span className="absolute right-[6px] top-[18px] flex gap-[10px] text-[9.5px] font-medium">
        <span className="text-muted">┅ no hedges</span>
        <span className="text-ember">▬ with convex sleeve</span>
      </span>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-border bg-panel px-3 py-3 md:px-5">
        <h1 className="m-0 font-display text-[32px] uppercase leading-[0.9] md:text-[40px]">Portfolio lab</h1>
        {[
          { k: "VALUE", v: "––.–– NOK m" },
          { k: "HOLDINGS", v: "––" },
          { k: "VOLATILITY 1Y", v: "––%" },
          { k: "LAST IMPORT", v: "[DATE]" },
        ].map((t) => (
          <div key={t.k} className="flex flex-col gap-[2px] border-l border-border pl-5">
            <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">{t.k}</span>
            <span className="text-base font-semibold">{t.v}</span>
          </div>
        ))}
        <div className="flex gap-2 md:ml-auto">
          <ButtonLink href="/setup/import" variant="secondary">
            Import CSV
          </ButtonLink>
          <ButtonLink href="/journal">Test a change</ButtonLink>
        </div>
      </div>

      <main className="mx-auto flex max-w-[1600px] flex-col gap-10 px-3 pb-9 pt-3 md:px-8 md:pt-7">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="animate-rise [animation-delay:60ms]">
            <Allocation />
          </div>
          <section aria-labelledby="risk-h" className="flex animate-rise flex-col gap-2 [animation-delay:115ms]">
            <SectionHeader index="02" label={<span id="risk-h">Risk contribution vs capital weight</span>} meta="BRIDGEWATER-STYLE VIEW" />
            <div className="flex gap-4 text-[10.5px] font-medium text-muted">
              <span>
                <span className="mr-1 inline-block size-[10px] bg-muted align-[-1px]" /> Capital
              </span>
              <Tooltip
                title="Risk contribution"
                body="How much of the portfolio's total swings come from each holding, after accounting for how volatile it is and how it moves with the rest."
              >
                <span className="mr-1 inline-block size-[10px] bg-ember align-[-1px]" /> Share of risk (volatility)
              </Tooltip>
            </div>
            {RISK_ROWS.map((r) => (
              <div key={r} className="grid grid-cols-[120px_minmax(0,1fr)_96px] items-center gap-3 border-b border-raised py-1 md:grid-cols-[150px_minmax(0,1fr)_110px]">
                <span className="text-[11.5px] font-medium">{r}</span>
                <div className="flex flex-col gap-[2px]">
                  <span className="h-[7px]" style={{ background: "repeating-linear-gradient(90deg,#1A222D 0 16px,#060A0F 16px 18px)" }} />
                  <span className="h-[7px]" style={{ background: "repeating-linear-gradient(90deg,#3A1A08 0 16px,#060A0F 16px 18px)" }} />
                </div>
                <span className="text-right text-[11px] font-semibold">
                  ––% / <span className="text-ember-tint">––%</span>
                </span>
              </div>
            ))}
            <p className="prose-body m-0 text-[13px] text-ink-2">
              A small capital weight can carry most of the risk. Equities are usually far more volatile than bonds, so a 60/40 mix gets most of its swings from the 60.
            </p>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <section aria-labelledby="regime-x-h" className="flex animate-rise flex-col gap-2 [animation-delay:170ms]">
            <SectionHeader
              index="03"
              label={<span id="regime-x-h">Regime exposure</span>}
              meta={
                <Tooltip
                  title="Four regimes"
                  body="Dalio's frame: growth and inflation can each rise or fall versus expectations. A balanced portfolio holds something that works in each box."
                  align="right"
                >
                  DALIO
                </Tooltip>
              }
            />
            <div className="grid grid-cols-[20px_minmax(0,1fr)_minmax(0,1fr)] grid-rows-[auto_1fr_1fr] gap-1">
              <span />
              <span className="text-center text-[10px] font-semibold tracking-[0.06em] text-muted">INFLATION ↓</span>
              <span className="text-center text-[10px] font-semibold tracking-[0.06em] text-muted">INFLATION ↑</span>
              {[0, 1].map((row) => (
                <div key={row} className="contents">
                  <span className="rotate-180 text-center text-[10px] font-semibold text-muted [writing-mode:vertical-rl]">{row === 0 ? "GROWTH ↑" : "GROWTH ↓"}</span>
                  {REGIMES.slice(row * 2, row * 2 + 2).map((g) => (
                    <div
                      key={g.k}
                      className="flex flex-col gap-1 p-[10px]"
                      style={{ background: g.current ? "#3A1A08" : "#111821", borderTop: `3px solid ${g.current ? "#E8590C" : "#3A4757"}` }}
                    >
                      <span className={`text-[10.5px] font-semibold ${g.current ? "text-ember-tint" : ""}`}>{g.k}</span>
                      <span className="text-[20px] font-semibold">––%</span>
                      <span className="text-[10px] text-muted">{g.wins}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <span className="text-[10.5px] text-muted">Share of portfolio that tends to do well in each regime · ■ current regime: [REGIME] (sample)</span>
          </section>

          <section aria-labelledby="crash-h" className="flex animate-rise flex-col gap-[10px] [animation-delay:225ms]">
            <SectionHeader index="04" label={<span id="crash-h">Crash payoff</span>} meta="TALEB & SPITZNAGEL" />
            <div className="grid grid-cols-2 gap-x-6 border-t border-border">
              {["−20%", "−40%"].map((k) => (
                <div key={k} className="flex flex-col gap-[6px] border-b border-border p-3">
                  <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">IF GLOBAL EQUITIES</span>
                  <span className="font-display text-[44px] leading-[0.9] text-down">{k}</span>
                  <span className="text-[18px] font-semibold">
                    ––.–– <span className="text-[11px] text-muted">NOK m</span>
                  </span>
                  <span className="text-[10.5px] text-muted">portfolio ––% · hedges +––</span>
                </div>
              ))}
            </div>
            <CrashPayoffChart />
            <p className="prose-body m-0 text-[13px] text-ink-2">
              Does anything you own go <i>up</i> when markets break? <ConceptTooltip id="convexity">Convex</ConceptTooltip> positions — long volatility, long-duration bonds,
              gold — show here as the hedge offset.
            </p>
          </section>

          <div className="animate-rise [animation-delay:280ms]">
            <HedgeRatio />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <section aria-labelledby="scen-h" className="flex animate-rise flex-col [animation-delay:335ms]">
            <SectionHeader index="06" label={<span id="scen-h">Scenarios</span>} meta="12 MONTHS" />
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <div className="grid grid-cols-[minmax(0,1fr)_150px_70px_70px] gap-3 border-b border-border py-2 text-[10px] font-semibold tracking-[0.08em] text-muted">
                  <span>SCENARIO</span>
                  <span>PROBABILITY</span>
                  <span className="text-right">MINE</span>
                  <span className="text-right">60/40</span>
                </div>
                {SCENARIOS.map((s) => (
                  <div key={s.k} className="grid grid-cols-[minmax(0,1fr)_150px_70px_70px] items-center gap-3 border-b border-raised py-2">
                    <div className="flex flex-col gap-[2px]">
                      <span className="text-[12px] font-semibold">{s.k}</span>
                      <span className="text-[10.5px] text-muted">{s.d}</span>
                    </div>
                    <span className="flex items-center gap-[6px]">
                      <span className="text-[12px] font-semibold">––%</span>
                      <SourceTag kind={s.src} short />
                    </span>
                    <span className="text-right text-[12px] font-semibold">±––%</span>
                    <span className="text-right text-[12px] text-muted">±––%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="ref-h" className="flex animate-rise flex-col [animation-delay:390ms]">
            <SectionHeader index="07" label={<span id="ref-h">Compare with reference portfolios</span>} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-semibold tracking-[0.06em] text-muted">
                    <th className="w-[130px] py-2 text-left font-semibold" />
                    {REFS.map((r, i) => (
                      <th key={r} scope="col" className={`px-[6px] py-2 text-right font-semibold ${i === 0 ? "bg-ember-deep text-white" : ""}`}>
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REF_ROWS.map(([k, vals]) => (
                    <tr key={k} className="border-b border-raised">
                      <th scope="row" className="py-[7px] text-left text-[11px] font-medium text-ink-2">
                        {k}
                      </th>
                      {vals.map((v, i) => (
                        <td key={i} className={`px-[6px] py-[7px] text-right text-[11.5px] font-semibold ${i === 0 ? "bg-ember-deep text-white" : "text-ink-2"}`}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <span className="mt-2 text-[10.5px] leading-[1.5] text-muted">
              All Weather shown as the commonly published retail approximation. Barbell = mostly very safe assets plus a small convex sleeve. Risk figures computed from
              history once data is connected.
            </span>
          </section>
        </div>

        <section aria-labelledby="look-h" className="flex animate-rise flex-col gap-3 [animation-delay:445ms]">
          <SectionHeader index="08" label={<span id="look-h">Fund look-through</span>} meta="WHAT YOUR FUNDS ACTUALLY HOLD" />
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
            <div className="flex flex-col">
              <span className="pb-2 text-[10px] font-semibold tracking-[0.08em] text-muted">TOP COMPANIES · ALL FUNDS COMBINED</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="grid grid-cols-[20px_minmax(0,1fr)_56px] gap-2 border-b border-border py-[6px] text-[11.5px]">
                  <span className="text-muted">{n}</span>
                  <span>[COMPANY]</span>
                  <span className="text-right font-semibold">––%</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="pb-2 text-[10px] font-semibold tracking-[0.08em] text-muted">OVERLAP BETWEEN FUNDS</span>
              {["[FUND A] × [FUND B]", "[FUND A] × [FUND C]", "[FUND B] × [FUND C]"].map((p) => (
                <div key={p} className="grid grid-cols-[minmax(0,1fr)_56px] gap-2 border-b border-border py-[6px] text-[11.5px]">
                  <span>{p}</span>
                  <span className="text-right font-semibold">––%</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="pb-2 text-[10px] font-semibold tracking-[0.08em] text-muted">COSTS & TAX</span>
              {[
                ["Weighted fund fee (TER)", "––%"],
                ["NOK-hedged share", "––%"],
                ["ASK-eligible share", "––%"],
                ["Tracking difference vs index", "±––%"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[minmax(0,1fr)_56px] gap-2 border-b border-border py-[6px] text-[11.5px]">
                  <span>{k}</span>
                  <span className="text-right font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="prose-body m-0 max-w-[820px] text-[13px] text-ink-2">
            Holdings come from each fund provider&apos;s published lists and update without a new CSV. Index funds use an ETF tracking the same index as a daily stand-in;
            active funds are estimated from daily prices between disclosures.
          </p>
        </section>
      </main>
    </>
  );
}
