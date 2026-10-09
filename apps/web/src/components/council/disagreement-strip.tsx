import { MEMBERS } from "@/lib/data/members";
import type { MemberId } from "@/lib/data/types";
import { STATE_COLOR, scoreState } from "@/lib/states";
import { Tooltip } from "@/components/ui/tooltip";

const ROW = 17;

/** Every member on a 1–5 axis, stacked above their score. Shown, never averaged. */
export function DisagreementStrip({ scores }: { scores: Record<MemberId, number> }) {
  const byScore = new Map<number, MemberId[]>();
  for (const m of MEMBERS) byScore.set(scores[m.id], [...(byScore.get(scores[m.id]) ?? []), m.id]);
  const maxStack = Math.max(...[...byScore.values()].map((v) => v.length));
  const axisTop = maxStack * ROW + 6;
  return (
    <div className="grid grid-cols-1 items-end gap-2 py-[6px] md:grid-cols-[150px_minmax(0,1fr)] md:gap-4">
      <div className="flex flex-col gap-[2px]">
        <Tooltip
          title="Why not average?"
          body="An average of 2 and 4 looks like a calm 3. Showing every member keeps the dissent visible — often the most useful signal on the board."
          side="top"
          className="self-start text-[10px] font-semibold uppercase tracking-[0.08em] text-ink"
        >
          Disagreement
        </Tooltip>
        <span className="text-[10.5px] text-muted">shown, never averaged</span>
      </div>
      <div className="relative mx-6 md:mx-8" style={{ height: axisTop + 26 }} role="img" aria-label="Member scores on a 1 to 5 axis (sample)">
        <div className="absolute inset-x-0 h-[2px] bg-border" style={{ top: axisTop }} />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n}>
            <div className="absolute h-[10px] w-px bg-card-ink-2" style={{ left: `${(n - 1) * 25}%`, top: axisTop - 4 }} />
            <span className="absolute -translate-x-1/2 text-[10px] font-medium text-muted" style={{ left: `${(n - 1) * 25}%`, top: axisTop + 10 }}>
              {n}
            </span>
          </div>
        ))}
        {[...byScore.entries()].flatMap(([score, ids]) =>
          ids.map((id, k) => {
            const m = MEMBERS.find((x) => x.id === id)!;
            return (
              <span
                key={id}
                title={m.name}
                className="absolute -translate-x-1/2 whitespace-nowrap border-l-2 bg-raised px-1 py-px text-[9.5px] font-bold leading-[14px] text-ink"
                style={{ left: `${(score - 1) * 25}%`, top: axisTop - 6 - (k + 1) * ROW, borderLeftColor: STATE_COLOR[scoreState(score)].dark }}
              >
                {m.abbr}
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}
