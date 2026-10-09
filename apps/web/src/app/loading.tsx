/** S3 · Loading: shimmering signature, skeleton posture and rows, eight member skeletons. */
export default function Loading() {
  const bar = (w: string, h = 14) => <div className="shimmer" style={{ width: w, height: h }} />;
  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-10 px-3 pb-9 pt-3 md:px-8 md:pt-7" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-3 border border-card-border bg-card px-3 pb-3 pt-[10px]">
          <div className="-mx-3 -mt-[10px] border-b border-card-border bg-card-strip px-3 py-[6px] text-[11px] font-semibold tracking-[0.08em] text-card-ink">
            <span className="text-card-index">01</span> POSTURE
          </div>
          <div
            className="h-14 w-[70%] animate-shimmer"
            style={{ background: "linear-gradient(90deg,#D3DBE5 0%,#E8ECF1 50%,#D3DBE5 100%)", backgroundSize: "200% 100%" }}
          />
          <div className="h-3 animate-shimmer" style={{ background: "linear-gradient(90deg,#D3DBE5 0%,#E8ECF1 50%,#D3DBE5 100%)", backgroundSize: "200% 100%" }} />
        </div>
        <div className="flex flex-col gap-[10px]">
          <div className="border-b border-ink pb-[10px] text-[11px] font-semibold tracking-[0.08em]">
            <span className="text-ember">02</span> WHAT IS HAPPENING
          </div>
          {["90%", "75%", "82%", "60%"].map((w) => (
            <div key={w}>{bar(w)}</div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
        {["DALIO", "DRUCKENMILLER", "MARKS", "BUFFETT & GREENBLATT", "TALEB & SPITZNAGEL", "TUDOR JONES", "BERNSTEIN & BOGLE", "MUNGER"].map((k) => (
          <div key={k} className="flex flex-col gap-[9px] border border-border bg-panel p-3">
            <span className="text-[10px] font-semibold tracking-[0.06em] text-muted">{k}</span>
            {bar("90px", 10)}
            {bar("70%", 10)}
          </div>
        ))}
      </div>
    </main>
  );
}
