import { TICKER } from "@/lib/data/sample";

/** One row of SYMBOL · value · ±%; 70s marquee, pauses on hover. Values are placeholders until wired. */
export function Ticker() {
  const row = [...TICKER, ...TICKER];
  return (
    <div className="overflow-hidden border-b border-border bg-panel" role="region" aria-label="Market ticker (no live data yet)">
      <div className="marquee-track flex w-max animate-marquee">
        {row.map((sym, i) => (
          <span
            key={`${sym}-${i}`}
            aria-hidden={i >= TICKER.length}
            className="flex items-baseline gap-[9px] whitespace-nowrap border-r border-border px-3 py-[7px] text-[10.5px] font-medium text-muted md:px-[18px] md:py-2 md:text-[11.5px]"
          >
            <span>{sym}</span>
            <span className="text-ink">––.––</span>
            <span className="hidden md:inline">±––.––%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
