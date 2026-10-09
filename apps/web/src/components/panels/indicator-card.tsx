import Link from "next/link";
import { Sparkline } from "@/components/charts/sparkline";
import { StateTag } from "@/components/ui/tags";
import type { Indicator, SignalState } from "@/lib/data/types";
import { hashSeed } from "@/lib/illustrative";
import { STATE_COLOR } from "@/lib/states";

/** Panel indicator card. Every card links to its indicator detail. */
export function IndicatorCard({ ind, index, state, delayMs }: { ind: Indicator; index: number; state: SignalState; delayMs: number }) {
  return (
    <Link
      href={`/indicators/${ind.id}`}
      className="hover-row flex animate-rise flex-col gap-2 text-ink no-underline hover:text-ink"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-baseline gap-2 border-b border-ink pb-[10px] text-[10.5px] font-semibold uppercase tracking-[0.08em]">
        <span className="font-bold text-ember">{String(index).padStart(2, "0")}</span>
        <h3 className="m-0 truncate text-[10.5px] font-semibold">{ind.name}</h3>
        <span className="ml-auto shrink-0 font-medium text-muted">{ind.frequency}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[26px] font-semibold leading-none">
          ––.––<span className="ml-1 text-[12px] text-muted">{ind.unit}</span>
        </span>
        <StateTag state={state} />
      </div>
      <Sparkline seed={hashSeed(ind.id)} color={STATE_COLOR[state].dark} />
      <span className="min-h-[50px] text-[11.5px] leading-[1.45] text-ink-2 text-pretty">{ind.line}</span>
      <div className="flex justify-between gap-2 border-t border-border pt-[7px] text-[10.5px] font-medium text-muted">
        <span className="truncate">
          {ind.source.provider}
          {ind.source.series && !ind.source.series.includes(" ") ? ` · ${ind.source.series}` : ""}
        </span>
        <span className="shrink-0 text-link">Detail →</span>
      </div>
    </Link>
  );
}
