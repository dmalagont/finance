"use client";

import { useMemo, useState } from "react";
import { hashSeed, illustrativeSeries, toPoints, type Bump } from "@/lib/illustrative";

const RANGES = ["1Y", "5Y", "10Y", "25Y", "MAX"] as const;
type Range = (typeof RANGES)[number];

const SHAPES: Record<Range, [number, Bump[]]> = {
  "1Y": [120, [[0.6, 1.2, 0.08]]],
  "5Y": [160, [[0.15, 3, 0.05], [0.55, 1.6, 0.06]]],
  "10Y": [200, [[0.4, 3.2, 0.03], [0.75, 1.8, 0.04]]],
  "25Y": [240, [[0.18, 2.2, 0.04], [0.47, 4.5, 0.03], [0.9, 2.6, 0.015], [0.97, 1.8, 0.02]]],
  MAX: [260, [[0.13, 2.4, 0.04], [0.45, 4.6, 0.03], [0.88, 2.6, 0.015], [0.96, 1.8, 0.02]]],
};

const EVENTS = [
  { label: "2008 · GFC", year: 2008.7 },
  { label: "2020 · COVID", year: 2020.2 },
  { label: "2022 · RATE SHOCK", year: 2022.5 },
];
const RANGE_YEARS: Record<Range, number> = { "1Y": 1, "5Y": 5, "10Y": 10, "25Y": 25, MAX: 30 };
const NOW = 2026.8;

const ALERT_TOP = 0.38;
const WATCH_TOP = 0.58;

/**
 * Indicator history: ember line with area fade, watch/alert thresholds, event squares,
 * hover crosshair. Range switches are instant (no re-animation).
 */
export function IndicatorChart({ id, label, riskWhen }: { id: string; label: string; riskWhen: "higher" | "lower" | "both" }) {
  const [range, setRange] = useState<Range>("10Y");
  const [hx, setHx] = useState<number | null>(null);
  const seed = hashSeed(id) + RANGES.indexOf(range) * 13;

  const series = useMemo(() => {
    const [n, bumps] = SHAPES[range];
    return illustrativeSeries(seed, n, bumps);
  }, [range, seed]);

  const span = RANGE_YEARS[range];
  const dots = EVENTS.filter((e) => NOW - e.year < span).map((e) => {
    const n = series.length - 1;
    const i0 = Math.round((1 - (NOW - e.year) / span) * n);
    let j = i0;
    for (let k = Math.max(0, i0 - 20); k <= Math.min(n, i0 + 20); k++) if (series[k] > series[j]) j = k;
    return { label: e.label.split(" · ")[0], full: e.label, x: j / n, y: 1 - series[j] };
  });

  const line = toPoints(series, 1000, 300);
  const hover = (() => {
    if (hx == null) return null;
    const i = Math.round(hx * (series.length - 1));
    const t = 1 - series[i];
    const ev = dots.find((d) => Math.abs(d.x - hx) < 0.025);
    const zone = t < ALERT_TOP ? ["▲ above alert line", "#EF4444"] : t < WATCH_TOP ? ["◆ in watch zone", "#FFB84D"] : ["▼ below watch line", "#22C55E"];
    return { x: hx, y: t, zone: zone[0], zoneC: zone[1], event: ev?.full };
  })();
  const higher = riskWhen !== "lower";

  return (
    <section className="flex flex-col gap-[10px]">
      <div className="flex flex-wrap items-center gap-[10px] border-b border-ink pb-[10px] text-[11px] font-semibold uppercase tracking-[0.08em]">
        <span className="font-bold text-ember">01</span>
        <h2 className="m-0 text-[11px] font-semibold">What happened</h2>
        <div role="group" aria-label="Range" className="ml-auto flex">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={r === range}
              onClick={() => setRange(r)}
              className={`min-h-11 border-0 px-[10px] text-[10.5px] font-semibold tracking-[0.06em] md:min-h-0 md:py-1 ${
                r === range ? "bg-ember text-white" : "bg-panel text-ink-2 hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div
        className="relative h-[190px] cursor-crosshair border border-border bg-panel md:h-[300px]"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHx(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
        }}
        onMouseLeave={() => setHx(null)}
        role="img"
        aria-label={`${label} history, ${range}. Illustrative shape, not data.`}
      >
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 size-full animate-draw [animation-delay:200ms]" aria-hidden>
          {[0.2, 0.4, 0.6, 0.8].map((f) => (
            <line key={f} x1="0" x2="1000" y1={f * 300} y2={f * 300} stroke="#111821" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <polygon points={`0,300 ${line} 1000,300`} fill="rgba(232,89,12,.10)" />
          <polyline points={line} fill="none" stroke="#E8590C" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <span key={f} className="absolute left-2 -translate-y-1/2 text-[9.5px] font-medium text-faint" style={{ top: `${f * 100}%` }}>
            ––.––
          </span>
        ))}
        <span className="absolute left-3 top-[10px] max-w-[calc(100%-24px)] truncate bg-ground px-[5px] py-px text-[10.5px] font-medium text-ink-2">
          {label} · {range} · ILLUSTRATIVE SHAPE — NOT DATA<span className="hidden md:inline"> · hover to read</span>
        </span>
        {higher && (
          <>
            <Threshold top={ALERT_TOP} color="#EF4444" label="ALERT ≥ [THRESHOLD]" />
            <Threshold top={WATCH_TOP} color="#FFB84D" label="WATCH ≥ [THRESHOLD]" />
          </>
        )}
        {dots.map((d) => (
          <div key={d.label} className="pointer-events-none absolute size-0" style={{ left: `${d.x * 100}%`, top: `${d.y * 100}%` }}>
            <span className="absolute -left-1 -top-1 size-2 bg-ember shadow-[0_0_0_3px_#000]" />
            <span className="absolute -left-10 -top-6 w-20 whitespace-nowrap text-center text-[10px] font-semibold text-ink">{d.label}</span>
          </div>
        ))}
        {hover && (
          <>
            <div className="pointer-events-none absolute inset-y-0 border-l border-muted" style={{ left: `${hover.x * 100}%` }} />
            <div
              className="pointer-events-none absolute -ml-[4.5px] -mt-[4.5px] size-[9px] bg-ember shadow-[0_0_0_3px_#000]"
              style={{ left: `${hover.x * 100}%`, top: `${hover.y * 100}%` }}
            />
            <div
              className="pointer-events-none absolute top-[34px] z-10 flex min-w-[150px] flex-col gap-[2px] border border-border border-t-2 border-t-ember bg-raised px-[9px] py-[6px]"
              style={{ left: `${hover.x * 100}%`, transform: hover.x > 0.7 ? "translateX(calc(-100% - 12px))" : "translateX(12px)" }}
            >
              <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">[DATE]</span>
              <span className="text-[15px] font-semibold text-ink">––.––</span>
              {higher && <span className="text-[10.5px] font-medium" style={{ color: hover.zoneC }}>{hover.zone}</span>}
              {hover.event && <span className="text-[10.5px] font-semibold text-ember">{hover.event}</span>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Threshold({ top, color, label }: { top: number; color: string; label: string }) {
  return (
    <div className="absolute inset-x-0 border-t border-dashed" style={{ top: `${top * 100}%`, borderColor: color }}>
      <span className="absolute -top-[18px] right-2 text-[10px] font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
