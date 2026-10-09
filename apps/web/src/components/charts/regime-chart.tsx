import { illustrativeSeries } from "@/lib/illustrative";

type RegimeKey = "gi" | "gI" | "Gi" | "GI"; // g = growth up, G = growth down; i = inflation down, I = inflation up

const LABEL: Record<RegimeKey, string> = { gi: "G↑ I↓", gI: "G↑ I↑", Gi: "G↓ I↓", GI: "G↓ I↑" };
const SHADE: Record<RegimeKey, string> = { gi: "#111821", gI: "#1A222D", Gi: "#0B1118", GI: "#232D3A" };

/** Sample regime history since 2000 (widths in % of the axis). Illustrative until the regime model runs. */
const BAND: [RegimeKey, number][] = [
  ["gi", 18],
  ["gI", 12],
  ["Gi", 5],
  ["gi", 22],
  ["Gi", 6],
  ["gi", 20],
  ["gI", 4],
  ["GI", 6],
  ["gi", 7],
];

const H = 170;
const top = (v: number) => 22 + (1 - v) * (H - 30);

/** "What happened": line on black with faint fade, event squares, regime strip and year axis. */
export function RegimeChart({ caption = "MSCI ACWI · NOK · ILLUSTRATIVE SHAPE — NOT DATA" }: { caption?: string }) {
  const hv = illustrativeSeries(77, 220, [
    [0.33, -3.5, 0.03],
    [0.74, -2.4, 0.012],
    [0.86, -1.6, 0.03],
    [0.6, 1.5, 0.3],
    [1, 2.5, 0.25],
  ]);
  const line = hv.map((v, i) => `${((i / (hv.length - 1)) * 1000).toFixed(1)},${top(v).toFixed(1)}`).join(" ");
  const area = `0,${H} ${line} 1000,${H}`;
  const events = (
    [
      ["2008", 0.33],
      ["2020", 0.74],
      ["2022", 0.86],
    ] as const
  ).map(([label, at]) => {
    const i0 = Math.round(at * (hv.length - 1));
    let j = i0;
    for (let k = i0 - 6; k <= i0 + 6; k++) if (hv[k] < hv[j]) j = k;
    const y = top(hv[j]);
    return { label, left: (j / (hv.length - 1)) * 100, topPct: (y / H) * 100, stem: Math.max(0, H - y - 26), labelTop: Math.max(10, H - y - 14) };
  });
  const years = [2000, 2004, 2008, 2012, 2016, 2020, 2024];

  return (
    <div className="flex flex-col gap-[6px]">
      <div className="relative h-[170px]">
        <svg viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full animate-draw [animation-delay:600ms]" aria-hidden>
          <defs>
            <linearGradient id="regime-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#EAF0F7" stopOpacity=".10" />
              <stop offset="1" stopColor="#EAF0F7" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.33, 0.66].map((f) => (
            <line key={f} x1="0" x2="1000" y1={f * H} y2={f * H} stroke="#16202B" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <polygon points={area} fill="url(#regime-fade)" />
          <polyline points={line} fill="none" stroke="#EAF0F7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {events.map((e) => (
          <div key={e.label} className="absolute size-0" style={{ left: `${e.left}%`, top: `${e.topPct}%` }}>
            <span className="absolute -left-1 -top-1 size-2 bg-ember shadow-[0_0_0_3px_#000]" />
            <span className="absolute left-[-0.5px] top-[10px] w-px bg-border-strong" style={{ height: e.stem }} />
            <span className="absolute -left-10 w-20 whitespace-nowrap text-center text-[10px] font-semibold text-ink" style={{ top: e.labelTop }}>
              {e.label}
            </span>
          </div>
        ))}
        <span className="absolute right-0 top-0 text-[9.5px] font-medium text-faint md:text-[10px]">{caption}</span>
      </div>
      <div className="flex h-5 gap-px" role="img" aria-label="Regime history: sample">
        {BAND.map(([k, w], i) => {
          const last = i === BAND.length - 1;
          return (
            <span
              key={i}
              className="flex items-center justify-center overflow-hidden whitespace-nowrap text-[9.5px] font-semibold tracking-[0.04em]"
              style={{
                width: `${w}%`,
                background: last ? "#3A1A08" : SHADE[k],
                color: last ? "#FF9A5C" : "#8693A6",
                boxShadow: last ? "inset 0 0 0 1px #E8590C" : "none",
              }}
            >
              {w >= 5 ? LABEL[k] : ""}
            </span>
          );
        })}
      </div>
      <div className="relative h-[14px]">
        {years.map((y) => (
          <span key={y} className="absolute -translate-x-1/2 text-[9.5px] font-medium text-faint" style={{ left: `${((y - 2000) / 26) * 100}%` }}>
            {y}
          </span>
        ))}
      </div>
    </div>
  );
}

/** "You are here" 2×2 growth × inflation map with a dashed trail. */
export function YouAreHere({ quadrant = "gi" }: { quadrant?: RegimeKey }) {
  const cells: [RegimeKey, string, "start" | "end"][] = [
    ["gi", "GROWTH ↑\nINFLATION ↓", "start"],
    ["gI", "GROWTH ↑\nINFLATION ↑", "start"],
    ["Gi", "GROWTH ↓\nINFLATION ↓", "end"],
    ["GI", "GROWTH ↓\nINFLATION ↑", "end"],
  ];
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">YOU ARE HERE</span>
      <div className="relative grid size-[170px] grid-cols-2 grid-rows-2 gap-px bg-border" role="img" aria-label={`Current regime: ${LABEL[quadrant]} (sample position)`}>
        {cells.map(([k, label, just]) => (
          <div
            key={k}
            className={`flex flex-col whitespace-pre-line p-[6px] text-[9.5px] font-semibold leading-[1.3] ${just === "end" ? "justify-end" : "justify-start"}`}
            style={{ background: k === quadrant ? "#111821" : "#060A0F", color: k === quadrant ? "#B8C4D3" : "#5D6878" }}
          >
            {label}
          </div>
        ))}
        <svg viewBox="0 0 170 170" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          <polyline points="40,120 62,96 96,104 110,70 72,48" fill="none" stroke="#8693A6" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
        <span className="absolute left-[72px] top-[48px] -ml-[5px] -mt-[5px] size-[10px] bg-ember shadow-[0_0_0_3px_#000]" />
      </div>
      <span className="text-[10.5px] leading-[1.4] text-muted">Dashed trail = last [N] quarters · sample position</span>
    </div>
  );
}
