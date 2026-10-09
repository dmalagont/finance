import type { ReactNode } from "react";
import { quote as findQuote } from "@/lib/data/quotes";

/**
 * Quote with a 2px ember left rule. Only verified quotes render text; otherwise the
 * slot shows what is missing so no unsourced quote ever ships.
 */
export function QuoteBlock({
  id,
  slot,
  size = "lg",
  children,
}: {
  id?: string;
  /** Placeholder shown when no verified quote exists, e.g. "Howard Marks on credit cycles". */
  slot?: string;
  size?: "md" | "lg";
  children?: ReactNode;
}) {
  const q = id ? findQuote(id) : undefined;
  const text = size === "lg" ? "text-[24px] md:text-[30px]" : "text-[22px] md:text-[24px]";
  return (
    <figure className="m-0 flex flex-col gap-3 border-l-2 border-ember pl-6">
      {q ? (
        <>
          <blockquote className={`m-0 font-display uppercase leading-[1.02] text-pretty ${text}`}>“{q.text}”</blockquote>
          <figcaption className="text-[11px] text-muted">
            — {q.author} · {q.source}, {q.year}
          </figcaption>
        </>
      ) : (
        <>
          <blockquote className={`m-0 font-display uppercase leading-[1.02] text-faint ${text}`}>[VERIFIED QUOTE — {slot ?? "SOURCE REQUIRED"}]</blockquote>
          <figcaption className="text-[11px] text-muted">— source required before a quote is shown</figcaption>
        </>
      )}
      {children}
    </figure>
  );
}
