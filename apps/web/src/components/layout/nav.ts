export const NAV = [
  { label: "Council", href: "/", match: (p: string) => p === "/" || p.startsWith("/indicators") },
  { label: "Panels", href: "/panels/liquidity", match: (p: string) => p.startsWith("/panels") },
  { label: "Norway", href: "/norway", match: (p: string) => p.startsWith("/norway") },
  { label: "Portfolio", href: "/portfolio", match: (p: string) => p.startsWith("/portfolio") || p.startsWith("/setup") },
  { label: "Journal", href: "/journal", match: (p: string) => p.startsWith("/journal") },
  { label: "Learn", href: "/learn", match: (p: string) => p.startsWith("/learn") },
];

export const MOBILE_TABS = ["Council", "Panels", "Portfolio", "Journal", "Learn"];
