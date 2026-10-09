import { useId } from "react";
import { illustrativeSeries, toPoints, type Bump } from "@/lib/illustrative";

/** Small illustrative sparkline with area fade and end dot, in the state colour. */
export function Sparkline({
  seed,
  color,
  label = "5Y · ILLUSTRATIVE",
  height = 46,
  bumps,
  area = true,
}: {
  seed: number;
  color: string;
  label?: string;
  height?: number;
  bumps?: Bump[];
  area?: boolean;
}) {
  const id = useId();
  const v = illustrativeSeries(seed, 60, bumps ?? [[0.85 + (seed % 3) * 0.05, (seed % 2 ? -1 : 1) * 1.4, 0.1]], 0.12);
  const pts = toPoints(v, 100, height);
  return (
    <div className="relative border border-border bg-ground" style={{ height }} aria-hidden>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="absolute inset-0 size-full">
        {area && (
          <>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color} stopOpacity=".14" />
                <stop offset="1" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,${height} ${pts} 100,${height}`} fill={`url(#${id})`} />
          </>
        )}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {area && <span className="absolute -right-[3px] -mt-[3px] size-[6px]" style={{ top: `${(1 - v[v.length - 1]) * 100}%`, background: color }} />}
      <span className="absolute left-[5px] top-[2px] text-[9px] font-medium text-faint">{label}</span>
    </div>
  );
}
