import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-[800px] flex-col gap-4 px-4 py-16">
      <span className="text-[11px] font-semibold tracking-[0.1em] text-ember">404</span>
      <h1 className="m-0 font-display text-[48px] uppercase leading-[0.9]">Nothing to read here</h1>
      <p className="prose-body m-0 text-ink-2">This page or indicator doesn&apos;t exist. Try the command line (⌘K) to jump to an indicator, member or concept.</p>
      <Link href="/" className="text-[11px] font-medium">
        Back to the council →
      </Link>
    </main>
  );
}
