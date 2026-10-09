export type SignalState = "calm" | "watch" | "alert";
export type TagState = SignalState | "new" | "incomplete";
export type SourceKind = "market" | "model" | "base" | "mine";
export type DataStatus = "live" | "loading" | "stale" | "error";
export type Frequency = "D" | "W" | "M" | "Q" | "A";
export type PanelId = "liquidity" | "macro" | "cycle" | "value" | "stress" | "norway";
export type MemberId =
  | "dalio"
  | "druckenmiller"
  | "marks"
  | "buffett-greenblatt"
  | "taleb-spitznagel"
  | "tudor-jones"
  | "bernstein-bogle"
  | "munger";

export interface Member {
  id: MemberId;
  name: string;
  /** Short name used in reasons and tight layouts. */
  short: string;
  abbr: string;
  question: string;
  /** One-paragraph core idea for Learn profiles. */
  idea: string;
  panel?: PanelId;
}

export interface Reader {
  member: MemberId;
  how: string;
}

export interface Indicator {
  id: string;
  name: string;
  /** Ticker-style label, e.g. "HY OAS". */
  short: string;
  panel: PanelId;
  category: string;
  frequency: Frequency;
  unit: string;
  source: { provider: string; series?: string };
  /** One plain sentence for cards. */
  line: string;
  explainer: { what: string; why: string; how: string };
  readers: Reader[];
  concepts: string[];
  /** Direction in which the indicator signals more risk. */
  riskWhen: "higher" | "lower" | "both";
}

export interface Concept {
  id: string;
  term: string;
  definition: string;
  panel?: PanelId;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  /** Publication or occasion, verifiable. */
  source: string;
  year: number;
}

/** A value as the app knows it. `value` stays null until a real source is wired. */
export interface Reading {
  value: number | null;
  asOf: string | null;
  status: DataStatus;
  staleDays?: number;
  state?: SignalState;
}
