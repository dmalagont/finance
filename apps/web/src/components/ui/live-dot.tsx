import type { DataStatus } from "@/lib/data/types";

const COLOR: Record<DataStatus, string> = {
  live: "bg-up",
  loading: "bg-muted",
  stale: "bg-watch",
  error: "bg-down",
};

export function LiveDot({ status, pulse = status === "live" }: { status: DataStatus; pulse?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-[7px] shrink-0 rounded-full ${COLOR[status]} ${pulse ? "animate-live" : ""}`}
    />
  );
}
