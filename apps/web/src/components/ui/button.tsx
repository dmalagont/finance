import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "secondary-light" | "danger";

const BASE =
  "press inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] no-underline disabled:bg-raised disabled:text-faint disabled:border-border";

const VARIANT: Record<Variant, string> = {
  primary: "border-0 bg-ember px-4 py-[10px] text-white hover:text-white",
  secondary: "border border-border bg-raised px-[14px] py-[9px] text-ink hover:text-ink",
  "secondary-light": "border border-card-border bg-card-raised px-[14px] py-[9px] text-card-ink hover:text-card-ink",
  danger: "border border-down bg-transparent px-2 py-[3px] text-[10px] text-down hover:text-down",
};

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={`${BASE} ${VARIANT[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  href,
  children,
}: {
  variant?: Variant;
  className?: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`text-[11px] font-medium ${className}`}>
      {children}
    </Link>
  );
}
