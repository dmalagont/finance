"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONCEPTS } from "@/lib/data/concepts";
import { INDICATORS } from "@/lib/data/indicators";
import { MEMBERS } from "@/lib/data/members";
import { PANELS } from "@/lib/data/panels";

const OPEN_EVENT = "cockpit:open-command";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

interface Item {
  kind: string;
  label: string;
  hint: string;
  href: string;
}

const ITEMS: Item[] = [
  ...INDICATORS.map((i) => ({ kind: "INDICATOR", label: `${i.short} · ${i.name}`, hint: i.category, href: `/indicators/${i.id}` })),
  ...PANELS.map((p) => ({ kind: "PANEL", label: p.title, hint: p.question, href: p.id === "norway" ? "/norway" : `/panels/${p.id}` })),
  ...MEMBERS.map((m) => ({ kind: "MEMBER", label: m.name, hint: m.question, href: `/learn#member-${m.id}` })),
  ...CONCEPTS.map((c) => ({ kind: "CONCEPT", label: c.term, hint: c.definition, href: `/learn#concept-${c.id}` })),
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s ? ITEMS.filter((i) => `${i.label} ${i.hint} ${i.kind}`.toLowerCase().includes(s)) : ITEMS.slice(0, 12);
    return list.slice(0, 30);
  }, [q]);

  const go = (item: Item | undefined) => {
    if (!item) return;
    setOpen(false);
    setQ("");
    router.push(item.href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search indicators, members and concepts"
        className="flex h-11 items-center gap-2 border-0 bg-transparent px-1 text-ember md:h-auto md:border md:border-border md:px-[6px] md:py-px md:text-muted"
      >
        <span className="text-base font-bold md:hidden">›</span>
        <span className="hidden text-[11px] md:inline">⌘K</span>
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && setOpen(false)}
        className="m-0 mx-auto mt-[12vh] w-[min(640px,calc(100vw-24px))] max-w-none border border-border border-t-2 border-t-ember bg-raised p-0 text-ink shadow-[0_10px_30px_rgba(0,0,0,.6)] backdrop:bg-black/70"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <span className="font-bold text-ember">›</span>
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              } else if (e.key === "Enter") {
                go(results[cursor]);
              }
            }}
            placeholder="Jump to an indicator, member or concept — e.g. HY OAS, Marks, convexity"
            aria-label="Search"
            className="h-12 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
          />
          <kbd className="border border-border px-[6px] text-[10px] text-muted">ESC</kbd>
        </div>
        <ul role="listbox" className="max-h-[50vh] overflow-y-auto">
          {results.map((r, i) => (
            <li key={`${r.kind}-${r.href}`} role="option" aria-selected={i === cursor}>
              <button
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(r)}
                className={`grid w-full grid-cols-[88px_minmax(0,1fr)] gap-3 border-0 border-b border-border px-4 py-[10px] text-left ${
                  i === cursor ? "bg-hover" : "bg-transparent"
                }`}
              >
                <span className="text-[10px] font-semibold tracking-[0.08em] text-ember">{r.kind}</span>
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="text-[12px] font-semibold text-ink">{r.label}</span>
                  <span className="truncate text-[11px] text-muted">{r.hint}</span>
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-4 py-4 text-[11px] text-muted">Nothing matches “{q}”.</li>}
        </ul>
      </dialog>
    </>
  );
}
