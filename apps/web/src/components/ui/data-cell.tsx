import type { DataStatus } from "@/lib/data/types";
import { LiveDot } from "./live-dot";
import { RetryButton } from "./retry-button";

export function RangeRail({ position = null, low = "––.––", high = "––.––", compact = false }: { position?: number | null; low?: string; high?: string; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="relative mt-[2px] h-1 bg-raised">
        {position != null && <div className="absolute -top-1 h-3 w-[2px] bg-muted" style={{ left: `${position * 100}%` }} />}
      </div>
      {!compact && (
        <div className="flex justify-between text-[9.5px] text-muted">
          <span>52W LOW {low}</span>
          <span>HIGH {high}</span>
        </div>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<DataStatus, string> = { live: "LIVE", loading: "LOADING", stale: "STALE", error: "ERROR" };
const STATUS_TEXT: Record<DataStatus, string> = { live: "text-up", loading: "text-muted", stale: "text-watch", error: "text-down" };

/** Label + status dot, value, 52-week rail, note. Four states: live, loading, stale, error. */
export function DataCell({
  label,
  status,
  value = "––.––",
  unit,
  note,
  staleDays,
  rail = true,
}: {
  label: string;
  status: DataStatus;
  value?: string;
  unit?: string;
  note?: string;
  staleDays?: number;
  rail?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-[6px] ${status === "stale" ? "border border-watch/40 p-2" : ""}`}>
      <div className="flex justify-between text-[10px] font-semibold tracking-[0.08em] text-muted">
        <span>{label}</span>
        <span className={`flex items-center gap-[6px] ${STATUS_TEXT[status]}`}>
          <LiveDot status={status} pulse={false} />
          {STATUS_LABEL[status]}
          {status === "stale" && staleDays != null ? ` ${staleDays}D` : ""}
        </span>
      </div>
      {status === "loading" ? (
        <div className="shimmer h-7 w-[70%]" aria-label="Loading" />
      ) : (
        <span className={`text-[26px] font-semibold leading-[1.1] ${status === "live" ? "text-ink" : "text-muted"}`}>
          {status === "error" ? "—" : value}
          {unit && status !== "error" && <span className="ml-1 text-[12px] text-muted">{unit}</span>}
        </span>
      )}
      {rail && <RangeRail compact />}
      <div className="flex items-center justify-between text-[10.5px] text-ink-2">
        <span>{note}</span>
        {status === "error" && <RetryButton />}
      </div>
    </div>
  );
}
