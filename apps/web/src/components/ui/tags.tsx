import type { SourceKind, TagState } from "@/lib/data/types";
import { SOURCE_COLOR, STATE_COLOR, STATE_TAG } from "@/lib/states";
import { SOURCES } from "@/lib/data/sample";

/** Stripe state tag: 3px left bar in the state colour. */
export function StateTag({
  state,
  surface = "dark",
  suffix,
  className = "",
}: {
  state: TagState;
  surface?: "dark" | "light";
  suffix?: string;
  className?: string;
}) {
  const c = STATE_COLOR[state][surface];
  const t = STATE_TAG[state];
  return (
    <span
      className={`inline-block shrink-0 whitespace-nowrap border-l-[3px] py-[2px] pl-[6px] pr-[7px] text-[10px] font-semibold tracking-[0.08em] ${
        surface === "dark" ? "bg-raised" : "bg-card-raised"
      } ${className}`}
      style={{ borderLeftColor: c, color: c }}
    >
      {t.glyph ? `${t.glyph} ` : ""}
      {t.word}
      {suffix ? ` · ${suffix}` : ""}
    </span>
  );
}

export function SourceTag({ kind, short = false }: { kind: SourceKind; short?: boolean }) {
  const c = SOURCE_COLOR[kind];
  const s = SOURCES.find((x) => x.kind === kind)!;
  return (
    <span
      className="inline-block whitespace-nowrap px-[5px] py-px text-[9.5px] font-medium uppercase tracking-[0.06em]"
      style={{ color: c, border: `1px ${kind === "mine" ? "dashed" : "solid"} ${c}` }}
    >
      {short ? s.short : s.label}
    </span>
  );
}

export function SampleBadge({ surface = "dark" }: { surface?: "dark" | "light" }) {
  return (
    <span className={`font-medium ${surface === "dark" ? "text-muted" : "text-card-muted"}`} title="Design sample state — no live data yet">
      SAMPLE
    </span>
  );
}
