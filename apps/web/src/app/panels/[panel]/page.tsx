import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndicatorCard } from "@/components/panels/indicator-card";
import { PanelTabs } from "@/components/panels/panel-tabs";
import { CouncilGauge } from "@/components/ui/council-gauge";
import { CardStrip, LightCard, SectionHeader } from "@/components/ui/section-header";
import { StateTag } from "@/components/ui/tags";
import { Tooltip } from "@/components/ui/tooltip";
import { indicatorsFor } from "@/lib/data/indicators";
import { member } from "@/lib/data/members";
import { PANELS } from "@/lib/data/panels";
import { samplePanelScore, sampleIndicatorState } from "@/lib/data/sample";
import type { PanelId, SignalState } from "@/lib/data/types";
import { STATE_COLOR, scoreState } from "@/lib/states";

const PANEL_IDS = PANELS.filter((p) => p.id !== "norway").map((p) => p.id);

export function generateStaticParams() {
  return PANEL_IDS.map((panel) => ({ panel }));
}

export async function generateMetadata({ params }: PageProps<"/panels/[panel]">): Promise<Metadata> {
  const { panel } = await params;
  return { title: PANELS.find((p) => p.id === panel)?.title ?? "Panel" };
}

export default async function PanelPage({ params }: PageProps<"/panels/[panel]">) {
  const { panel: id } = await params;
  const panel = PANELS.find((p) => p.id === id && p.id !== "norway");
  if (!panel) notFound();

  const cards = indicatorsFor(panel.id as PanelId);
  const states = cards.map((c) => sampleIndicatorState[c.id] ?? "watch");
  const score = samplePanelScore[panel.id];
  const mix: { label: string; key: SignalState }[] = [
    { label: "CALM", key: "calm" },
    { label: "WATCH", key: "watch" },
    { label: "ALERT", key: "alert" },
  ];

  return (
    <>
      <PanelTabs active={panel.id} />
      <main className="mx-auto flex max-w-[1600px] flex-col gap-10 px-3 pb-9 pt-3 md:px-8 md:pt-7">
        <LightCard className="grid animate-rise grid-cols-1 gap-6 [animation-delay:60ms] lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]">
          <div className="lg:col-span-3">
            <CardStrip index="01" label="Panel summary" meta="SAMPLE STATE · UPDATED [DATE]" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="m-0 font-display text-[56px] uppercase leading-[0.86] md:text-[72px]">{panel.title}</h1>
            <span className="text-[12.5px] font-medium leading-[1.45] text-card-ink-2">{panel.question}</span>
            <span className="text-[11px] font-medium text-card-muted">
              Lead voice · <b className="text-card-ink">{panel.lead.map((m) => member(m).name).join(" · ")}</b>
            </span>
          </div>
          <div className="flex flex-col gap-[10px]">
            <Tooltip
              title="Panel read"
              body="The lead voice scores the panel 1–5 from the cards below. It is a judgement, not an average, and always names what drives it."
              className="self-start text-[10px] font-semibold tracking-[0.08em] text-card-muted"
            >
              PANEL READ
            </Tooltip>
            <div className="flex flex-wrap items-center gap-3">
              <CouncilGauge score={score} size="lg" surface="light" delayMs={360} />
              <StateTag state={scoreState(score)} surface="light" />
            </div>
            <span className="text-[12px] leading-[1.5] text-card-ink-2">[ONE-SENTENCE PANEL SUMMARY — what the indicators say together, and where they disagree]</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <Tooltip
              title="Signal mix"
              body="How many indicators in this panel are calm, on watch or on alert. A split mix means the panel disagrees with itself — read the cards."
              className="self-start text-[10px] font-semibold tracking-[0.08em] text-card-muted"
            >
              SIGNAL MIX
            </Tooltip>
            {mix.map((m) => {
              const n = states.filter((s) => s === m.key).length;
              const c = STATE_COLOR[m.key].light;
              return (
                <div key={m.key} className="grid grid-cols-[80px_minmax(0,1fr)_24px] items-center gap-2 text-[10.5px] font-semibold" style={{ color: c }}>
                  <span>{m.label}</span>
                  <span className="relative h-2 bg-card-raised">
                    <span className="absolute inset-y-0 left-0" style={{ width: `${(n / states.length) * 100}%`, background: c }} />
                  </span>
                  <span className="text-right">{n}</span>
                </div>
              );
            })}
            <span className="mt-1 text-[10.5px] text-card-muted">Counts of indicators by state · sample</span>
          </div>
        </LightCard>

        <section aria-label="Indicators" className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((ind, i) => (
            <IndicatorCard key={ind.id} ind={ind} index={i + 2} state={states[i]} delayMs={120 + i * 55} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div className="flex flex-col gap-2">
            <SectionHeader index={String(cards.length + 2).padStart(2, "0")} label="How this panel works" />
            <p className="prose-body m-0 text-ink-2">{panel.how}</p>
          </div>
        </section>
      </main>
    </>
  );
}
