import Link from "next/link";
import { CommandPalette } from "./command-palette";
import { NavLinks } from "./nav-links";
import { LiveDot } from "@/components/ui/live-dot";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 bg-ground">
      <div className="flex h-11 items-center gap-3 border-b border-border px-4 md:h-12 md:gap-7 md:px-8">
        <Link href="/" className="flex items-baseline gap-2 text-ink no-underline hover:text-ink">
          <span className="font-display text-[22px] uppercase leading-none md:text-2xl">Cockpit</span>
          <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">NOK</span>
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-4 text-[11px] font-medium text-muted">
          <span className="hidden lg:inline">[DATE] · 07:00 CET</span>
          <Link href="/status" className="hidden items-center gap-[7px] text-ink-2 no-underline hover:text-ink sm:flex" title="No data sources connected yet">
            <LiveDot status="loading" pulse={false} />
            SAMPLE DATA
          </Link>
          <span className="hidden border border-border px-[7px] py-[3px] text-ink-2 xl:inline">MONITORING · NOT ADVICE</span>
          <CommandPalette />
        </div>
      </div>
      <div className="h-[2px] bg-ember" />
    </header>
  );
}
