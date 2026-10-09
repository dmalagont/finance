import Link from "next/link";
import { PANELS } from "@/lib/data/panels";
import { samplePanelScore } from "@/lib/data/sample";
import type { PanelId } from "@/lib/data/types";
import { STATE_COLOR, STATE_TAG, scoreState } from "@/lib/states";

/** Sub-tabs directly under the signature line; active = filled raised block. */
export function PanelTabs({ active }: { active: PanelId }) {
  return (
    <nav aria-label="Panels" className="flex overflow-x-auto border-b border-border bg-panel">
      {PANELS.map((p) => {
        const on = p.id === active;
        const st = scoreState(samplePanelScore[p.id]);
        return (
          <Link
            key={p.id}
            href={p.id === "norway" ? "/norway" : `/panels/${p.id}`}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2 border-r border-border px-[18px] text-[11px] font-semibold uppercase tracking-[0.08em] no-underline ${
              on ? "bg-raised text-ink hover:text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {p.title}
            <span style={{ color: STATE_COLOR[st].dark }} aria-label={`${STATE_TAG[st].word} (sample)`}>
              ■
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
