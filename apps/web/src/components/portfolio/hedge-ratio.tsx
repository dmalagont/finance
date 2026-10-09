"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { ConceptTooltip } from "@/components/ui/tooltip";

function note(h: number) {
  if (h < 30)
    return "Low hedge: when markets fall the krone often weakens too, so foreign assets lose less in NOK. A natural cushion — but your NOK return swings with the currency.";
  if (h > 70)
    return "High hedge: returns follow local markets, not the krone. Steadier in calm times, but you lose the cushion a weaker krone often gives in a crisis.";
  return "Middle ground: part currency cushion in a crisis, part protection if the krone strengthens. Hedging also has a cost or gain from the interest-rate gap.";
}

export function HedgeRatio() {
  const [h, setH] = useState(50);
  return (
    <section aria-labelledby="hedge-h" className="flex flex-col gap-[10px]">
      <SectionHeader
        index="05"
        label={
          <span id="hedge-h">
            <ConceptTooltip id="currency-hedge">NOK hedge ratio</ConceptTooltip>
          </span>
        }
      />
      <div className="flex items-baseline gap-[10px]">
        <output htmlFor="hedge" className="text-[40px] font-semibold leading-none">
          {h}%
        </output>
        <span className="text-[11px] text-muted">of foreign assets hedged to NOK · current ––%</span>
      </div>
      <input
        id="hedge"
        type="range"
        min={0}
        max={100}
        step={5}
        value={h}
        onChange={(e) => setH(Number(e.target.value))}
        aria-label="Hedge ratio"
        className="h-11 w-full accent-ember md:h-auto"
      />
      <div className="flex justify-between text-[10px] font-medium text-muted">
        <span>0 · FULL CURRENCY RISK</span>
        <span>100 · FULLY HEDGED</span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 border-t border-border">
        {["IF NOK +10%", "IF NOK −10%"].map((k) => (
          <div key={k} className="border-b border-border px-[10px] py-2">
            <div className="text-[10px] font-semibold tracking-[0.08em] text-muted">{k}</div>
            <div className="text-[15px] font-semibold">––.–– NOK m</div>
          </div>
        ))}
      </div>
      <p className="prose-body m-0 text-[13px] text-ink-2" aria-live="polite">
        {note(h)}
      </p>
    </section>
  );
}
