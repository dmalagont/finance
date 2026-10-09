"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_TABS, NAV } from "./nav";

export function MobileTabBar() {
  const path = usePathname();
  const tabs = NAV.filter((n) => MOBILE_TABS.includes(n.label));
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-panel pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map((t) => {
        const active = t.match(path) || (t.label === "Panels" && path.startsWith("/norway"));
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-14 flex-col items-center justify-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.06em] no-underline ${
              active ? "text-ink hover:text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <span className={`h-[3px] w-4 ${active ? "bg-ember" : "bg-border"}`} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
