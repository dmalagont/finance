"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { concept as findConcept } from "@/lib/data/concepts";

/**
 * Tooltip trigger with a dotted ember underline. Opens on hover and focus,
 * closes on leave and blur, and toggles on tap for touch screens.
 */
export function Tooltip({
  title,
  body,
  href,
  children,
  side = "bottom",
  align = "left",
  accent = "#E8590C",
  className = "",
  plain = false,
}: {
  title: string;
  body: ReactNode;
  href?: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left";
  align?: "left" | "right";
  accent?: string;
  className?: string;
  /** Don't draw the dotted underline (trigger is already styled). */
  plain?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const pos =
    side === "top"
      ? "bottom-[calc(100%+8px)]"
      : side === "left"
        ? "right-[calc(100%+8px)] -top-[6px]"
        : "top-[calc(100%+8px)]";
  const horiz = side === "left" ? "" : align === "right" ? "right-0" : "left-0";
  return (
    <span
      className={`relative inline-block cursor-help ${plain ? "" : "border-b border-dotted border-ember"} ${className}`}
      tabIndex={0}
      aria-describedby={open ? id : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      {children}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute z-50 flex w-[min(300px,80vw)] flex-col gap-1 whitespace-normal border border-border bg-raised px-[10px] py-2 text-left normal-case tracking-normal shadow-[0_10px_30px_rgba(0,0,0,.6)] ${pos} ${horiz}`}
          style={{ borderTop: `2px solid ${accent}` }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink">{title}</span>
          <span className="text-[11px] font-normal leading-[1.45] text-ink-2">{body}</span>
          {href && (
            <Link href={href} className="text-[10.5px] font-medium">
              Open concept →
            </Link>
          )}
        </span>
      )}
    </span>
  );
}

/** Tooltip bound to a concept in the glossary. */
export function ConceptTooltip({ id, children, side, align }: { id: string; children: ReactNode; side?: "top" | "bottom"; align?: "left" | "right" }) {
  const c = findConcept(id);
  if (!c) return <>{children}</>;
  return (
    <Tooltip title={c.term} body={c.definition} href={`/learn#concept-${c.id}`} side={side} align={align}>
      {children}
    </Tooltip>
  );
}
