import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Setup" };

const STEPS = [
  { n: "01", k: "Connect data", v: "FRED, Norges Bank, SSB and market prices feed the council. Needs the data engine and API keys.", cta: "Source status", href: "/status", primary: true },
  { n: "02", k: "Import your portfolio", v: "A transactions CSV from Nordnet, DNB, Sbanken or any broker. Account type (ASK, IPS, regular) is kept for tax notes.", cta: "Import CSV", href: "/setup/import", primary: false },
  { n: "03", k: "Set a goal", v: "Target return, horizon and the drawdown you can live with. Bernstein & Bogle read everything against it.", cta: "Coming soon", href: "", primary: false },
];

export default function SetupPage() {
  return (
    <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-4 py-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:px-12 md:py-10">
      <div className="flex flex-col gap-[14px]">
        <span className="text-[11px] font-semibold tracking-[0.1em] text-ember">WELCOME · SETUP 0 / 3</span>
        <h1 className="m-0 font-display text-[48px] uppercase leading-[0.86] md:text-[64px]">The council has nothing to read yet</h1>
        <p className="prose-body m-0 text-ink-2">
          Connect data, add your portfolio and set a goal. Every gauge stays empty until real data arrives — nothing is estimated in the meantime. Until then, screens show
          clearly labelled sample states.
        </p>
        <span className="text-[10.5px] font-medium text-muted">Monitoring tool, not investment advice.</span>
      </div>
      <ol className="m-0 flex list-none flex-col self-start border-t border-border p-0">
        {STEPS.map((s) => (
          <li key={s.n} className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-[14px] border-b border-border p-4 sm:grid-cols-[36px_minmax(0,1fr)_auto]">
            <span className="text-[20px] font-bold text-ember">{s.n}</span>
            <div className="flex flex-col gap-[3px]">
              <span className="text-[13px] font-semibold">{s.k}</span>
              <span className="font-sans text-[13px] leading-[1.45] text-muted">{s.v}</span>
            </div>
            <div className="col-start-2 sm:col-start-3">
              {s.href ? (
                <ButtonLink href={s.href} variant={s.primary ? "primary" : "secondary"}>
                  {s.cta}
                </ButtonLink>
              ) : (
                <span className="inline-block border border-border bg-raised px-3 py-[9px] text-[10.5px] font-semibold tracking-[0.08em] text-faint">{s.cta.toUpperCase()}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
