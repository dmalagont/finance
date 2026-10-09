import type { SignalState, SourceKind, TagState } from "./data/types";

export const STATE_TAG: Record<TagState, { glyph: string; word: string }> = {
  calm: { glyph: "▼", word: "CALM" },
  watch: { glyph: "◆", word: "WATCH" },
  alert: { glyph: "▲", word: "ALERT" },
  new: { glyph: "—", word: "NEW" },
  incomplete: { glyph: "", word: "INCOMPLETE" },
};

/** Text colour per state on dark and light surfaces. */
export const STATE_COLOR: Record<TagState, { dark: string; light: string }> = {
  calm: { dark: "#22C55E", light: "#0A7A42" },
  watch: { dark: "#FFB84D", light: "#855600" },
  alert: { dark: "#EF4444", light: "#C01E2D" },
  new: { dark: "#B8C4D3", light: "#2E3947" },
  incomplete: { dark: "#8693A6", light: "#536071" },
};

export const scoreState = (n: number): SignalState => (n <= 2 ? "calm" : n === 3 ? "watch" : "alert");

export const SOURCE_COLOR: Record<SourceKind, string> = {
  market: "#3B82F6",
  model: "#FF9A5C",
  base: "#B8C4D3",
  mine: "#EAF0F7",
};

export const FREQ_LABEL = { D: "daily", W: "weekly", M: "monthly", Q: "quarterly", A: "yearly" } as const;
