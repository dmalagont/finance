import { POSTURE_STEPS } from "@/lib/data/sample";

/** Five skewed steps; active = ember, left of it = ember-pale, right = raised. */
export function PostureSelector({ level, compact = false }: { level: number; compact?: boolean }) {
  return (
    <div
      className={`grid grid-cols-5 ${compact ? "gap-[3px]" : "gap-1"}`}
      role="img"
      aria-label={`Posture: ${POSTURE_STEPS[level]} (${level + 1} of 5, from defensive to aggressive)`}
    >
      {POSTURE_STEPS.map((label, i) => {
        const bg = i === level ? "#E8590C" : i < level ? "#F6D6C2" : "#D3DBE5";
        return (
          <div key={label} className="flex flex-col gap-[6px]">
            <div
              className={`${compact ? "h-[10px]" : "h-[14px]"} -skew-x-[14deg] animate-[reveal_260ms_var(--ease-out-strong)_both]`}
              style={{ background: bg, animationDelay: `${300 + i * 70}ms` }}
            />
            {!compact && (
              <span
                className={`text-[9.5px] font-semibold uppercase tracking-[0.04em] md:text-[10px] ${i === level ? "text-card-ink" : "text-card-muted"}`}
              >
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
