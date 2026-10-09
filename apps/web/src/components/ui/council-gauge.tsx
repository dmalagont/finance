import { STATE_COLOR, scoreState } from "@/lib/states";

/** Five tick segments; filled ones take the level colour. Reveals left→right. */
export function CouncilGauge({
  score,
  delayMs = 0,
  size = "md",
  surface = "dark",
  showValue = true,
}: {
  score: number | null;
  delayMs?: number;
  size?: "sm" | "md" | "lg";
  surface?: "dark" | "light";
  showValue?: boolean;
}) {
  const color = score ? STATE_COLOR[scoreState(score)][surface] : undefined;
  const dims = size === "sm" ? "h-[7px] w-[10px]" : size === "lg" ? "h-[14px] w-[28px]" : "h-[10px] w-[16.4px]";
  const empty = surface === "dark" ? "#111821" : "#D3DBE5";
  return (
    <span className="inline-flex items-center gap-[10px]">
      <span
        className="flex gap-[2px] animate-reveal"
        style={{ animationDelay: `${delayMs}ms` }}
        role="img"
        aria-label={score ? `Score ${score} of 5` : "No score yet"}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={dims} style={{ background: score && i <= score ? color : empty }} />
        ))}
      </span>
      {showValue && (
        <span className={`font-bold ${size === "lg" ? "text-base" : "text-[12px]"}`} style={{ color: color ?? "#8693A6" }}>
          {score ? `${score}/5` : "–/5"}
        </span>
      )}
    </span>
  );
}
