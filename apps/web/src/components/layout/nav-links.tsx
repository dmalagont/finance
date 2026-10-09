"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav";

export function NavLinks() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden md:flex">
      {NAV.map((n) => {
        const active = n.match(path);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-12 items-center px-3 text-[11px] font-semibold uppercase tracking-[0.08em] no-underline ${
              active ? "bg-raised text-ink hover:text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
