import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { StateTag } from "@/components/ui/tags";
import { INDICATORS } from "@/lib/data/indicators";

export const metadata: Metadata = { title: "Data sources" };

const SOURCES = [
  { name: "FRED · St. Louis Fed", covers: "US rates, spreads, liquidity, inflation, jobs", match: ["FRED", "Derived · FRED"] },
  { name: "Norges Bank", covers: "Policy rate, NOWA, krone, government yields", match: ["Norges Bank"] },
  { name: "Statistics Norway (SSB)", covers: "CPI-ATE, Mainland GDP, unemployment, household debt", match: ["SSB", "SSB · Norges Bank", "NAV · SSB"] },
  { name: "Market prices", covers: "Indices, FX, Brent, VIX, MOVE, breadth", match: ["Market data", "ICE", "Derived"] },
  { name: "Other official sources", covers: "Atlanta Fed, Chicago Fed, St. Louis Fed stress, Shiller, central banks", match: ["Atlanta Fed", "Chicago Fed", "St. Louis Fed", "Shiller data", "Fed · ECB · BoJ · PBoC", "Eiendom Norge"] },
];

/** Honest source status: nothing is connected yet, so every read is INCOMPLETE. */
export default function StatusPage() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-[14px] border-b border-border border-l-[3px] border-l-down bg-raised px-4 py-[10px] md:px-5">
        <span className="text-[11.5px] font-semibold text-down">▲ NO DATA SOURCES CONNECTED</span>
        <span className="font-sans text-[13px] text-ink-2">Every read is incomplete. Screens show labelled sample states until the data engine is running.</span>
      </div>
      <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-3 pb-9 pt-6 md:px-8">
        <h1 className="m-0 font-display text-[44px] uppercase leading-[0.9] md:text-[56px]">Data sources</h1>
        <section aria-labelledby="src-h" className="flex flex-col">
          <SectionHeader index="01" label={<span id="src-h">Sources</span>} meta="LAST SUCCESS · NEVER" />
          {SOURCES.map((s) => {
            const n = INDICATORS.filter((i) => s.match.includes(i.source.provider)).length;
            return (
              <div key={s.name} className="grid grid-cols-1 gap-2 border-b border-border py-3 md:grid-cols-[minmax(0,1fr)_120px_140px] md:items-center">
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[12.5px] font-semibold">{s.name}</span>
                  <span className="text-[11px] text-muted">{s.covers}</span>
                </div>
                <span className="text-[11px] text-ink-2">{n} series</span>
                <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">● NOT CONNECTED</span>
              </div>
            );
          })}
        </section>
        <section aria-labelledby="reads-h" className="flex flex-col gap-2">
          <SectionHeader index="02" label={<span id="reads-h">Affected reads</span>} />
          <p className="prose-body m-0 text-ink-2">
            A read built on missing data is shown as incomplete, never as calm. Once a source connects, its series fill in with live, stale or error states.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Posture", "Council", "Liquidity", "Macro", "Cycle", "Value", "Stress", "Norway", "Portfolio"].map((r) => (
              <span key={r} className="flex items-center gap-2 border border-border px-2 py-1 text-[11px]">
                {r} <StateTag state="incomplete" />
              </span>
            ))}
          </div>
        </section>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/setup">Setup steps</ButtonLink>
          <Link href="/" className="self-center text-[11px] font-medium">
            Back to the council →
          </Link>
        </div>
      </main>
    </>
  );
}
