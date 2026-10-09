import type { Quote } from "./types";

/**
 * Only quotes with a verifiable source belong here. Anything else renders as an
 * empty `[VERIFIED QUOTE …]` slot.
 */
export const QUOTES: Quote[] = [
  {
    id: "buffett-fearful",
    text: "We simply attempt to be fearful when others are greedy and to be greedy only when others are fearful.",
    author: "Warren Buffett",
    source: "Berkshire Hathaway shareholder letter",
    year: 1986,
  },
  {
    id: "marks-prepare",
    text: "You can't predict. You can prepare.",
    author: "Howard Marks",
    source: "Oaktree memo title",
    year: 2001,
  },
  {
    id: "druckenmiller-fed",
    text: "Earnings don't move the overall market; it's the Federal Reserve Board.",
    author: "Stanley Druckenmiller",
    source: "in Jack Schwager, The New Market Wizards",
    year: 1992,
  },
];

export const quote = (id: string) => QUOTES.find((q) => q.id === id);
