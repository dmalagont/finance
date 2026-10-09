import type { Member, MemberId } from "./types";

export const MEMBERS: Member[] = [
  {
    id: "dalio",
    name: "Ray Dalio",
    short: "Dalio",
    abbr: "Dalio",
    question: "What regime and debt cycle are we in?",
    idea: "Asset returns depend on whether growth and inflation come in above or below expectations, and on where we are in short and long debt cycles. Balance the portfolio so no single regime can sink it.",
    panel: "cycle",
  },
  {
    id: "druckenmiller",
    name: "Stanley Druckenmiller",
    short: "Druckenmiller",
    abbr: "Druck",
    question: "Where is liquidity going, and does price confirm it?",
    idea: "Liquidity and central banks move the overall market more than earnings do. Look 18–24 months ahead, size up when conviction is high, and cut fast when price disagrees with you.",
    panel: "liquidity",
  },
  {
    id: "marks",
    name: "Howard Marks",
    short: "Marks",
    abbr: "Marks",
    question: "How hot are psychology and credit?",
    idea: "Markets swing like a pendulum between greed and fear. Risk is the chance of permanent loss, not volatility. Take the market's temperature and prepare rather than predict.",
    panel: "stress",
  },
  {
    id: "buffett-greenblatt",
    name: "Buffett & Greenblatt",
    short: "Buffett & Greenblatt",
    abbr: "B&G",
    question: "Are my holdings good businesses at good prices?",
    idea: "Own durable, high-return businesses bought with a margin of safety. Greenblatt systematises it: rank by earnings yield and return on capital, and let time do the work.",
    panel: "value",
  },
  {
    id: "taleb-spitznagel",
    name: "Taleb & Spitznagel",
    short: "Taleb & Spitznagel",
    abbr: "T&S",
    question: "Where am I fragile, and what pays off if things break?",
    idea: "Rare, large shocks dominate long-run results. Avoid hidden leverage, keep the fragile middle small, and hold some convexity that pays when everything else falls.",
    panel: "stress",
  },
  {
    id: "tudor-jones",
    name: "Paul Tudor Jones",
    short: "Tudor Jones",
    abbr: "PTJ",
    question: "Is the trend with me?",
    idea: "Defence first. A simple trend filter, such as price against its 200-day average, keeps you out of the worst of long declines.",
    panel: "liquidity",
  },
  {
    id: "bernstein-bogle",
    name: "Bernstein & Bogle",
    short: "Bernstein & Bogle",
    abbr: "B&B",
    question: "Will this meet my goals, and what deep risks exist?",
    idea: "Costs, taxes and behaviour decide what you keep. Shallow risk is a temporary drawdown; deep risk is permanent loss of real wealth through inflation, deflation, confiscation or devastation.",
    panel: "norway",
  },
  {
    id: "munger",
    name: "Charlie Munger",
    short: "Munger",
    abbr: "Munger",
    question: "Red team: what would make this decision stupid?",
    idea: "Invert: ask how a decision could fail before asking how it succeeds. Check incentives and the standard biases before you commit.",
  },
];

export const member = (id: MemberId): Member => {
  const m = MEMBERS.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown member ${id}`);
  return m;
};
