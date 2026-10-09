import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IndicatorChart } from "@/components/charts/indicator-chart";
import { ButtonLink } from "@/components/ui/button";
import { RangeRail } from "@/components/ui/data-cell";
import { ExplainerCard } from "@/components/ui/explainer-card";
import { CardStrip, LightCard, SectionHeader } from "@/components/ui/section-header";
import { SourceTag, StateTag } from "@/components/ui/tags";
import { ConceptTooltip, Tooltip } from "@/components/ui/tooltip";
import { INDICATORS, indicator } from "@/lib/data/indicators";
import { member } from "@/lib/data/members";
import { SOURCES, sampleIndicatorState } from "@/lib/data/sample";
import { quote } from "@/lib/data/quotes";
import { FREQ_LABEL } from "@/lib/states";

export function generateStaticParams() {
  return INDICATORS.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: PageProps<"/indicators/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: indicator(id)?.name ?? "Indicator" };
}

const QUOTE_FOR_PANEL: Record<string, string | undefined> = { liquidity: "druckenmiller-fed" };

export default async function IndicatorPage({ params }: PageProps<"/indicators/[id]">) {
  const { id } = await params;
  const ind = indicator(id);
  if (!ind) notFound();

  const state = sampleIndicatorState[ind.id] ?? "watch";
  const lead = member(ind.readers[0].member);
  const quoteId = QUOTE_FOR_PANEL[ind.panel];
  const q = quoteId ? quote(quoteId) : undefined;
  const board = ind.readers.map((r) => `${member(r.member).short}: ${r.how}`).join(" ") + " Current board view: [CURRENT READ].";
  const panelHref = ind.panel === "norway" ? "/norway" : `/panels/${ind.panel}`;
  const sourceLine = `Source: ${ind.source.provider}${ind.source.series ? ` · ${ind.source.series}` : ""} · updated ${FREQ_LABEL[ind.frequency]} · last [DATE]`;
  const headConcept = ind.concepts[0];

  return (
    <main className="mx-auto grid max-w-[1600px] grid-cols-1 items-start gap-10 px-3 pb-9 pt-3 md:px-8 md:pt-7 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
      <div className="flex min-w-0 flex-col gap-9">
        <nav aria-label="Breadcrumb" className="-mb-5 text-[11px] font-medium tracking-[0.06em] text-muted">
          <Link href="/" className="text-muted no-underline hover:text-ink">
            COUNCIL
          </Link>{" "}
          /{" "}
          <Link href={panelHref} className="text-muted no-underline hover:text-ink">
            {lead.short.toUpperCase()} · {ind.panel.toUpperCase()}
          </Link>{" "}
          / <span className="text-ink">{ind.short}</span>
        </nav>

        <section className="grid animate-rise grid-cols-1 gap-x-6 gap-y-[10px] [animation-delay:60ms] md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex flex-col gap-[6px]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
              {ind.category} · {FREQ_LABEL[ind.frequency]}
            </span>
            <h1 className="m-0 font-display text-[38px] uppercase leading-[0.9] md:text-[52px]">{ind.name}</h1>
            <span className="text-[12px] text-ink-2">
              {headConcept ? (
                <ConceptTooltip id={headConcept}>
                  <span className="text-ink">{ind.short}</span>
                </ConceptTooltip>
              ) : (
                <span className="text-ink">{ind.short}</span>
              )}{" "}
              · {ind.unit} · {ind.source.provider}
            </span>
          </div>
          <div className="flex items-end justify-between gap-[6px] md:flex-col md:items-end">
            <span className="order-2 md:order-1">
              <StateTag state={state} suffix="SAMPLE" />
            </span>
            <span className="order-1 animate-[flash-up_5s_ease-out_2s_infinite] px-1 text-[36px] font-semibold leading-none md:order-2 md:text-[44px]">
              ––.––
            </span>
            <span className="order-3 hidden text-[11px] font-medium text-muted md:block">±–– w/w · [DATE]</span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-6 border-t border-border md:col-span-2 md:grid-cols-4">
            {[
              { k: "CURRENT", v: `––.–– ${ind.unit}`, rail: true },
              { k: "1Y CHANGE", v: "±––", rail: false },
              { k: "PERCENTILE · FULL HISTORY", v: "––th", rail: false },
              { k: "52-WEEK RANGE", v: "––.–– → ––.––", rail: true },
            ].map((s) => (
              <div key={s.k} className="flex flex-col gap-[5px] border-b border-border px-[10px] py-2">
                <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">{s.k}</span>
                <span className="text-[15px] font-semibold">{s.v}</span>
                {s.rail && <RangeRail />}
              </div>
            ))}
          </div>
        </section>

        <div className="animate-rise [animation-delay:115ms]">
          <IndicatorChart id={ind.id} label={ind.short} riskWhen={ind.riskWhen} />
        </div>

        <div className="animate-rise [animation-delay:170ms]">
          <ExplainerCard index="02" bodies={[ind.explainer.what, ind.explainer.why, ind.explainer.how, board]} concepts={ind.concepts} sourceLine={sourceLine} />
        </div>
      </div>

      <aside className="flex flex-col gap-9">
        <section aria-labelledby="may-h" className="flex animate-rise flex-col gap-2 [animation-delay:225ms]">
          <SectionHeader index="03" label={<span id="may-h">What may happen</span>} />
          <div className="text-[12px] font-semibold leading-[1.35]">
            {ind.short} in the alert zone within 12 months
          </div>
          {SOURCES.map((s) => (
            <div key={s.kind} className="grid grid-cols-[118px_1fr_auto] items-center gap-2 py-[3px]">
              <Tooltip title={s.label} body={s.tip} plain side="top">
                <SourceTag kind={s.kind} />
              </Tooltip>
              <span className="text-[14px] font-semibold">––%</span>
              <span className="text-[10.5px] text-muted">hit ––%{s.kind === "base" ? " · n=––" : ""}</span>
            </div>
          ))}
          <ButtonLink href="/journal" variant="secondary" className="mt-1 self-start">
            Add my estimate
          </ButtonLink>
        </section>

        <section aria-labelledby="who-h" className="flex animate-rise flex-col [animation-delay:280ms]">
          <SectionHeader index="04" label={<span id="who-h">Who reads this</span>} />
          {ind.readers.map((r) => (
            <div key={r.member} className="flex flex-col gap-[3px] border-b border-border py-[9px]">
              <span className="font-display text-[19px] uppercase leading-none">{member(r.member).name}</span>
              <span className="text-[11.5px] leading-[1.4] text-ink-2">{r.how}</span>
            </div>
          ))}
        </section>

        <LightCard className="flex animate-rise flex-col gap-[10px] [animation-delay:335ms]">
          <CardStrip index="05" label="Quote" />
          {q ? (
            <>
              <blockquote className="m-0 font-display text-[24px] uppercase leading-[1.02]">“{q.text}”</blockquote>
              <span className="text-[11px] text-card-muted">
                — {q.author} · {q.source}, {q.year}
              </span>
            </>
          ) : (
            <>
              <div className="font-display text-[24px] uppercase leading-[1.02]">[VERIFIED QUOTE ON {ind.category.split(" · ")[0].toUpperCase()}]</div>
              <span className="text-[11px] text-card-muted">— {lead.name} · [SOURCE], [YEAR] · source required</span>
            </>
          )}
        </LightCard>
      </aside>
    </main>
  );
}
