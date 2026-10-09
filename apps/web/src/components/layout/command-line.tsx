"use client";

import { openCommandPalette } from "./command-palette";

/** `›` in ember + hint text, ⌘K chip. No blinking cursor. */
export function CommandLine() {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className="hidden w-full items-center gap-3 border-0 border-b border-border bg-transparent px-5 py-2 text-left text-[12px] font-medium md:flex"
    >
      <span className="font-bold text-ember">›</span>
      <span className="text-muted">Jump to an indicator, member or concept — e.g. HY OAS, Marks, convexity</span>
      <span className="ml-auto border border-border px-[6px] py-px text-muted">⌘K</span>
    </button>
  );
}
