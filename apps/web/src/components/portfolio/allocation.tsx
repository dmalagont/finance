"use client";

import { useState } from "react";

const DIMS: Record<string, string[]> = {
  "Asset class": ["Global equities", "Norwegian equities", "Bonds · NOK", "Bonds · global", "Gold", "Cash · NOK"],
  Region: ["Norway", "Nordics ex-NO", "Europe", "North America", "Asia-Pacific", "Emerging"],
  Sector: ["Technology", "Financials", "Energy", "Healthcare", "Industrials", "Other"],
  Factor: ["Market", "Value", "Quality", "Momentum", "Size", "Low volatility"],
  Currency: ["NOK", "USD", "EUR", "SEK / DKK", "GBP", "Other"],
};

const TICKS = "repeating-linear-gradient(90deg,#111821 0 16px,#060A0F 16px 18px)";

export function Allocation() {
  const [dim, setDim] = useState("Asset class");
  return (
    <section aria-labelledby="alloc-h" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-[10px] border-b border-ink text-[11px] font-semibold uppercase tracking-[0.08em]">
        <span className="font-bold text-ember">01</span>
        <h2 id="alloc-h" className="m-0 py-[7px] text-[11px] font-semibold">
          Allocation
        </h2>
        <div role="tablist" aria-label="Allocation dimension" className="ml-auto flex overflow-x-auto">
          {Object.keys(DIMS).map((d) => (
            <button
              key={d}
              role="tab"
              type="button"
              aria-selected={dim === d}
              onClick={() => setDim(d)}
              className={`min-h-9 shrink-0 border-0 border-l border-border px-[10px] text-[10.5px] font-semibold uppercase tracking-[0.06em] ${
                dim === d ? "bg-panel text-ink shadow-[inset_0_2px_0_#E8590C]" : "bg-transparent text-muted hover:text-ink"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      {DIMS[dim].map((a) => (
        <div key={a} className="grid grid-cols-[120px_minmax(0,1fr)_44px_56px] items-center gap-3 border-b border-raised py-[5px] md:grid-cols-[150px_minmax(0,1fr)_60px_60px]">
          <span className="text-[11.5px] font-medium">{a}</span>
          <span className="h-3" style={{ background: TICKS }} />
          <span className="text-right text-[12px] font-semibold">––%</span>
          <span className="text-right text-[10.5px] text-muted">tgt ––%</span>
        </div>
      ))}
      <span className="text-[10.5px] text-muted">Bars fill from imported holdings · target from your plan</span>
    </section>
  );
}
