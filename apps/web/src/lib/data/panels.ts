import type { MemberId, PanelId } from "./types";

export interface Panel {
  id: PanelId;
  title: string;
  lead: MemberId[];
  question: string;
  how: string;
}

export const PANELS: Panel[] = [
  {
    id: "liquidity",
    title: "Liquidity",
    lead: ["druckenmiller"],
    question: "Where is liquidity going, and does price confirm it?",
    how: "Liquidity is the amount of money and credit available to chase assets. When central banks add reserves or credit eases, asset prices tend to be supported; when liquidity drains, risk assets lose a tailwind. Cards read level and direction; the panel turns Alert when most drain together and price stops confirming.",
  },
  {
    id: "macro",
    title: "Macro",
    lead: ["dalio"],
    question: "Is growth rising or falling, and is inflation rising or falling?",
    how: "The four regimes come from two questions: is growth beating or missing expectations, and is inflation rising or falling? Growth cards cover output and jobs; inflation cards cover prices and what bond markets expect. Together they place us on the regime map on the Council page.",
  },
  {
    id: "cycle",
    title: "Cycle",
    lead: ["dalio"],
    question: "Where are we in the short-term and long-term debt cycle?",
    how: "Short debt cycles are driven by central-bank rates and bank lending; the long debt cycle by how much debt has built up across decades. The yield curve and lending standards are the fast signals; debt and debt-service ratios move slowly and set the backdrop.",
  },
  {
    id: "value",
    title: "Value",
    lead: ["buffett-greenblatt"],
    question: "Are we paying a sensible price?",
    how: "Valuation says little about the next few months but a lot about the next ten years. These cards compare prices with earnings, with the economy and with safe bonds, and show how concentrated the market has become.",
  },
  {
    id: "stress",
    title: "Stress",
    lead: ["marks", "taleb-spitznagel"],
    question: "How hot are psychology and credit, and where is fragility?",
    how: "Stress shows up first in credit and in the price of insurance. Spreads measure what lenders demand; volatility measures what protection costs; the stock–bond correlation tells you whether your cushion still works.",
  },
  {
    id: "norway",
    title: "Norway",
    lead: ["bernstein-bogle"],
    question: "What do rates, the krone, oil and housing mean for my NOK goals?",
    how: "See the full Norway panel for rates and the policy path, the krone, households, oil and the fiscal rule, and Norwegian tax notes.",
  },
];

export const panel = (id: PanelId) => PANELS.find((p) => p.id === id)!;
