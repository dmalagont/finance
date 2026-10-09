import type { ReactNode } from "react";

/** Mono index in ember + uppercase label + optional meta, with a 1px ink rule below. */
export function SectionHeader({
  index,
  label,
  meta,
  display,
  as: Tag = "h2",
  className = "",
}: {
  index: string;
  label: ReactNode;
  meta?: ReactNode;
  /** Use the Barlow display face for big section titles. */
  display?: boolean;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={`flex items-baseline gap-[10px] border-b border-ink pb-[10px] text-[11px] font-semibold uppercase tracking-[0.08em] ${className}`}
    >
      <span className="font-bold text-ember">{index}</span>
      {display ? (
        <Tag className="m-0 font-display text-[32px] uppercase leading-[0.9] tracking-normal md:text-[40px]">{label}</Tag>
      ) : (
        <Tag className="m-0 text-[11px] font-semibold">{label}</Tag>
      )}
      {meta != null && <span className="ml-auto font-medium normal-case tracking-normal text-muted md:uppercase md:tracking-[0.08em]">{meta}</span>}
    </div>
  );
}

/** Header strip inside a light headline card. */
export function CardStrip({ index, label, meta }: { index: string; label: ReactNode; meta?: ReactNode }) {
  return (
    <div className="-mx-3 -mt-[10px] flex items-baseline gap-[10px] border-b border-card-border bg-card-strip px-3 py-[6px] text-[11px] font-semibold uppercase tracking-[0.08em]">
      <span className="font-bold text-card-index">{index}</span>
      <h2 className="m-0 text-[11px] font-semibold">{label}</h2>
      {meta != null && <span className="ml-auto font-medium text-card-muted">{meta}</span>}
    </div>
  );
}

export function LightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`border border-card-border bg-card px-3 pb-[14px] pt-[10px] text-card-ink ${className}`}>{children}</section>
  );
}
