/**
 * SAMPLE STATE.
 *
 * Until the engine is wired, the app shows design sample states so every screen can be
 * reviewed. Every surface that renders this data labels it "SAMPLE". No market values
 * live here: figures stay as placeholders (null) until a real source exists.
 */
import type { MemberId, PanelId, SignalState, SourceKind, TagState } from "./types";

export const IS_SAMPLE = true;

export const POSTURE_STEPS = ["Defensive", "Cautious", "Neutral", "Leaning in", "Aggressive"] as const;

export const samplePosture = {
  level: 1, // Cautious
  instruction: "Hold risk near target. Add protection before adding exposure.",
  reasons: [
    { member: "marks" as MemberId, why: "Credit and sentiment running hot", state: "alert" as SignalState },
    { member: "taleb-spitznagel" as MemberId, why: "Portfolio has little convexity if equities fall", state: "alert" as SignalState },
    { member: "tudor-jones" as MemberId, why: "Trend still supportive — the dissent", state: "calm" as SignalState },
  ],
};

export const sampleCouncil: Record<MemberId, number> = {
  dalio: 3,
  druckenmiller: 2,
  marks: 4,
  "buffett-greenblatt": 3,
  "taleb-spitznagel": 4,
  "tudor-jones": 2,
  "bernstein-bogle": 3,
  munger: 3,
};

export interface Change {
  day: string;
  what: string;
  note: string;
  state: TagState;
  indicator?: string;
}

export const sampleChanges: Change[] = [
  { day: "MON", what: "HY OAS crossed watch line", note: "[THRESHOLD] · first since [DATE]", state: "watch", indicator: "hy-oas" },
  { day: "TUE", what: "EURNOK above 200-day", note: "Weaker krone raises imported inflation", state: "alert", indicator: "eurnok" },
  { day: "WED", what: "Norges Bank held at ––.––%", note: "Path implies [N] cuts by [DATE]", state: "new", indicator: "nb-policy-rate" },
  { day: "THU", what: "Brent ––.––% w/w", note: "Fiscal room and NOK both sensitive", state: "watch", indicator: "brent" },
  { day: "FRI", what: "S&P 500 trend intact", note: "Above 50 and 200-day averages", state: "calm", indicator: "price-confirmation" },
];

export const sampleQuestions = [
  { q: "Norges Bank cuts at next meeting" },
  { q: "Global equities −20% within 12 months" },
];

export const SOURCES: { kind: SourceKind; label: string; short: string; def: string; tip: string }[] = [
  { kind: "market", label: "Market-implied", short: "MARKET", def: "Derived from prices: futures, options, swaps", tip: "Probability backed out of market prices — futures, options or swaps. What traders are paying for, not a forecast by us." },
  { kind: "model", label: "Model", short: "MODEL", def: "Our quantitative model, back-tested", tip: "Output of our quantitative model, back-tested. Hit rate shows how often its past calls at this confidence came true." },
  { kind: "base", label: "Base rate", short: "BASE RATE", def: "How often it happened historically", tip: "How often this has happened historically in similar conditions. n = number of past episodes counted." },
  { kind: "mine", label: "My estimate", short: "MINE", def: "Your own call, logged in the Journal", tip: "Your own estimate, logged in the Journal so it can be scored later." },
];

/** Sample signal states per indicator (design sample only). */
export const sampleIndicatorState: Record<string, SignalState> = {
  "fed-balance-sheet": "watch",
  "us-net-liquidity": "watch",
  m2: "calm",
  "global-cb-balance-sheets": "watch",
  dxy: "alert",
  nfci: "calm",
  "us-10y-real-yield": "watch",
  "price-confirmation": "calm",
  gdpnow: "calm",
  "us-unemployment": "calm",
  "sahm-rule": "calm",
  "jobless-claims": "watch",
  "core-pce": "watch",
  cpi: "watch",
  "breakeven-5y": "calm",
  "forward-5y5y": "calm",
  "curve-2s10s": "watch",
  "curve-3m10y": "watch",
  "real-policy-rate": "watch",
  "lending-standards": "calm",
  "federal-debt-gdp": "alert",
  "household-debt-service": "calm",
  "buffett-indicator": "alert",
  cape: "alert",
  "equity-risk-premium": "alert",
  "index-concentration": "alert",
  "hy-effective-yield": "watch",
  "hy-oas": "watch",
  "ig-oas": "calm",
  "ccc-spread": "watch",
  vix: "calm",
  move: "watch",
  "stock-bond-correlation": "alert",
  stlfsi: "calm",
  "nb-policy-rate": "watch",
  nowa: "watch",
  i44: "alert",
  eurnok: "alert",
  usdnok: "watch",
  "no-10y": "watch",
  "cpi-ate": "alert",
  "mainland-gdp": "calm",
  "no-unemployment": "calm",
  "no-household-debt": "watch",
  "no-house-prices": "watch",
  brent: "calm",
};

export const samplePanelScore: Record<PanelId, number> = {
  liquidity: 3,
  macro: 3,
  cycle: 3,
  value: 4,
  stress: 4,
  norway: 3,
};

export const sampleNorwayThemes: { key: string; state: SignalState }[] = [
  { key: "Rates", state: "watch" },
  { key: "Krone", state: "alert" },
  { key: "Households", state: "watch" },
  { key: "Oil & fiscal", state: "calm" },
];

export const TICKER = ["OSEBX", "I-44", "EURNOK", "USDNOK", "NO 10Y", "NOWA", "BRENT", "MSCI ACWI", "S&P 500", "US 10Y", "HY OAS", "VIX", "GOLD", "DXY"];
