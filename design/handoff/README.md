# Handoff: Investment Cockpit

## Overview
A private web app for one investor in Norway (NOK base). It monitors macro and market risk, prices what may happen and helps build a diversified portfolio. It is **educational**: every number is explained simply and linked to concepts and to an eight-member "investor council". It is a monitoring tool, **not investment advice**.

Every screen answers three questions:
1. **What happened** — long history, regimes, annotated events (2008, 2020, 2022).
2. **What is happening** — this week's changes, thresholds crossed, current reads.
3. **What may happen** — probabilities, always labelled by source: *Market-implied*, *Model*, *Base rate*, *My estimate*, each with a hit rate. Sources are never blended.

## About the design files
The files in `designs/` are **design references created in HTML**. They are prototypes that show the intended look and behaviour, not production code to copy. Recreate them in the target stack:

**Next.js (App Router) + Tailwind + shadcn/ui on Cloudflare; charts in ECharts or TradingView Lightweight Charts; data in Supabase.**

Each `.dc.html` file opens directly in a browser (it needs `support.js` next to it, which is included). The markup is inline-styled, so every exact value can be read from the source. Logic lives in the `<script data-dc-script>` class at the bottom of each file.

## Fidelity
**High-fidelity.** Colours, type, spacing, states and motion are final. Recreate the UI pixel-precisely using Tailwind tokens and shadcn primitives, restyled to this system (radius 0 everywhere).

**Data:** all figures are placeholders (`––.––`, `[DATE]`, `[THRESHOLD]`). Plots are labelled "ILLUSTRATIVE SHAPE — NOT DATA" and their lines are generated from a seeded random function. **Never ship invented data.** Wire every value to a real source, and show the loading, stale or error state until data exists.

---

## Design tokens

### Colour — dark (default)
| Token | Hex | Use |
|---|---|---|
| ground | `#000000` | page background |
| panel | `#060A0F` | rare boxed surfaces, tickers, sidebars |
| raised | `#111821` | active tab fill, tags, tooltips, empty gauge segments |
| hover | `#0B1118` | row/card hover |
| border | `#202A36` | hairlines between rows |
| border-strong | `#3A4757` | inputs, unchecked boxes |
| ink | `#EAF0F7` | primary text; **section header rule** |
| ink-2 | `#B8C4D3` | body text |
| muted | `#8693A6` | labels, meta |
| faint | `#5D6878` | axis labels, placeholders |
| ember (brand) | `#E8590C` | index numbers, 2px signature line, primary button, focus, event dots, current regime |
| ember-tint | `#FF9A5C` | "Model" source tag, current-regime label |
| ember-deep | `#3A1A08` | current-regime fill, highlighted table column |
| on-ember | `#FFFFFF` | text on ember |
| up / calm | `#22C55E` | |
| down / alert | `#EF4444` | |
| watch | `#FFB84D` | |
| link / market-implied | `#3B82F6` (hover `#7AA9F8`) | |

### Colour — light headline card (posture only; formerly also quotes)
| Token | Hex |
|---|---|
| card bg | `#E8ECF1` |
| header strip | `#DAE0E8` |
| raised | `#D3DBE5` |
| border | `#C5CEDA` |
| ink | `#0A0F16` |
| ink-2 | `#2E3947` |
| muted | `#536071` |
| index | `#A93D08` |
| up | `#0A7A42` |
| down | `#C01E2D` |
| watch | `#855600` |
| link | `#1C5BA8` |
| ember-pale (posture steps left of active) | `#F6D6C2` |

**Semantic rules:** colour is always paired with an arrow and a word (▼ CALM, ◆ WATCH, ▲ ALERT). Rising *risk* is red even when the number goes up. **Regimes are never green or red.** They use grey segments, and only the current regime is ember.

### Typography
- **Display:** Barlow Condensed 700 *italic*, UPPERCASE. Used for council names, posture word, big section titles and quotes.
  - Sizes: 210 (editorial hero), 84 (posture), 72 (page title), 56 / 52 / 40 (section titles), 34 / 30 / 24 / 22 / 21 / 19 / 17 (names, quotes).
  - Line-height 0.84–1.02.
- **Everything else:** IBM Plex Mono 400 / 500 / 600 / 700, including all UI text and every figure.
  - Body 12–12.5px, line-height 1.45–1.6.
  - Labels and section headers 10–11px, 600, UPPERCASE, letter-spacing .08em.
  - Figures: 600 weight; 44 hero, 36, 26–28 cell, 15–20 table, 12–13 row.
- Fonts come from Google Fonts: `Barlow Condensed:ital,wght@1,700` and `IBM Plex Mono:wght@400;500;600;700`.

### Shape and spacing
- Radius **0** everywhere, except the live dot (circle) and phone frames.
- Page padding 28px 32px 36px (desktop). Header bar 48px high, padding 0 32px.
- Column gap **40px**; vertical gap between sections 36–40px; card grids gap 28px 32px.
- Rows: padding 10–14px 0, separated by 1px `#202A36`.
- Mobile: page padding 12px, all tap targets ≥ 44px.

---

## Layout system: "Open layout" (approved)
Use **fewer boxes**. Rules, space and type do the grouping.

- **Default section:** no background and no border.
  - Header row: mono index in ember (`01`, `02` …) plus an UPPERCASE label, with optional right-aligned meta in muted.
  - Then a **1px `#EAF0F7` rule** below, with padding-bottom 10px.
  - Content rows are split by 1px `#202A36` hairlines.
- **Small grids of cells** (stat strips, tax notes, profiles): `border-top:1px #202A36`; each cell has `border-bottom:1px #202A36`; column gap 24px.
- **Boxes only where they earn it:**
  - The **light posture card**.
  - Charts.
  - Tags, buttons and inputs.
  - Tooltips.
  - The featured lesson (2px ember top).
  - Error and stale states (3px semantic left bar).
  - Journal form steps.
- **Quotes:** 2px ember left rule, padding-left 24px, no card.
- **Signature:** a 2px solid ember line directly under the header bar.
- **Nav active tab:** a filled `#111821` block (`box-shadow: inset 0 0 0 200px #111821`) with ink text. **No orange underline**, because it creates a double line with the signature line. Sub-tabs directly under the signature line follow the same rule. Keyboard focus is a 1px ember outline at offset −3px.

---

## Reusable components
Build these as shared components.

| Component | Spec |
|---|---|
| **SectionHeader** | index (ember, mono 700 11px) + label (mono 600 11px, .08em, uppercase) + optional meta; 1px ink rule below |
| **CouncilGauge** | 5 segments, each 16.4×10px with 2px gaps (total ≈90×10). Filled segments use the level colour: 1–2 up, 3 watch, 4–5 down. Empty segments are `#111821`. Value `n/5` in the level colour. Reveals left→right with clip-path, 420ms |
| **StateTag** | mono 600 10px, .08em; padding 2px 7px 2px 6px; bg raised; **3px left bar** in the state colour; text in the state colour. Values: `▼ CALM` / `◆ WATCH` / `▲ ALERT`, plus `— NEW` (ink-2) and `INCOMPLETE` (muted) |
| **SourceTag** | mono 500 9.5px uppercase, .06em; padding 1px 5px; 1px border in the source colour. Market-implied `#3B82F6`, Model `#FF9A5C`, Base rate `#B8C4D3`, My estimate `#EAF0F7` (**dashed** border). Always followed by `hit ––%` (and `n=––` for base rate) |
| **PostureSelector** | 5 steps (Defensive · Cautious · Neutral · Leaning in · Aggressive); bars 12–22px high, `skewX(-14deg)`, gap 4px. Active step ember, steps left of it ember-pale, steps right of it raised. Labels mono 600 9.5–11px |
| **DataCell** | label + state dot; value mono 600 24–28px; 52-week range rail (4px track, 2px×12px marker, LOW/HIGH labels at 9.5px); note. Four states: **live** (green dot), **loading** (shimmer bar 1.4s linear), **stale Nd** (watch dot, value in muted), **error** (red dot, value `—`, RETRY outline button in down colour) |
| **ExplainerCard** | four tabs: What is this · Why it matters · How to read it now · What the board says. Active tab is a raised fill with a 2px ember top line. Footer: Related concept links + source and freshness |
| **QuoteBlock** | Barlow 24–30px; attribution mono 11px muted, "— Name · Publication, year". **Only with a verifiable source**; otherwise render the slot `[VERIFIED QUOTE …]` |
| **ConceptTooltip** | trigger: dotted 1px ember underline, `cursor:help`, `tabIndex=0`. Box: bg `#111821`, 1px border, **2px ember top**, padding 8px 10px, width 260–320px, shadow `0 10px 30px rgba(0,0,0,.6)`; title mono 600 10px uppercase plus body 11px/1.45, optional "Open concept →". Opens on hover **and** focus |
| **Ticker** | one row of SYMBOL · value · ±% with 1px separators; 70s linear marquee (content duplicated, `translateX(-50%)`); **pauses on hover** |
| **CommandLine** | `›` in ember + hint text, ⌘K chip on the right. **No blinking cursor** |
| **Buttons** | Primary: ember bg, white mono 600 11px, .08em, padding 9–10px 14–16px. Secondary: raised bg with a 1px border. Link: link colour, underline offset 3px. Press = `scale(0.97)` 160ms. Disabled: bg raised, text faint |

### Plots (approved style)
- Line on black: 1.5–2px stroke (ink on the home chart, ember on indicator charts).
- Faint top-down area fade, from 10% to 0% opacity.
- 2–4 faint gridlines in `#111821` / `#16202B`.
- **Events** (2008, 2020, 2022): an 8×8 ember square on the line at the local extreme, with a 3px black ring and a short label. **No full-height dashed lines.**
- Thresholds (watch / alert) **are** dashed horizontal lines in the semantic colour, labelled at the right.
- **Regime strip** under the chart:
  - Labelled grey segments `G↑ I↓`, `G↑ I↑`, `G↓ I↓`, `G↓ I↑`.
  - The current segment is ember-deep with an ember inset ring and ember-tint text.
  - Year axis below.
- **"You are here"** 2×2 map (growth × inflation), 170px. The current quadrant is lighter; a dashed trail of recent quarters ends in a 10px ember square.
- Indicator chart hover: a 1px crosshair, a dot on the line, and a tooltip box showing date, value, zone (below watch / watch / above alert) and any nearby event.
- Draw-in: clip-path reveal 1.6s `cubic-bezier(0.77,0,0.175,1)`, once. Range switches are **instant**.
- Until data is connected, label each plot "ILLUSTRATIVE SHAPE — NOT DATA".

---

## Screens

### 1. Council home (`Council Home Open.dc.html` is the approved layout; `Investment Cockpit.dc.html#council-home` uses the same open style)
- **Header:** COCKPIT wordmark, nav (Council · Panels · Norway · Portfolio · Journal · Learn), live dot + date + NOK. Then the signature line and the ticker.
- **Row 1** (5fr / 4fr / 3fr, gap 40):
  - **Posture:** the light card. Posture word at 84px, one-line instruction, posture selector, three reasons (council name coloured by state plus a short reason), Log decision button and "Red team it" link.
  - **What changed:** five rows, each with arrow (semantic), title, note and day.
  - **What may happen:** two questions, each with four source figures (2px top border in the source colour).
- **The council** (Barlow 40px title):
  - Disagreement strip in the header row: a 1–5 axis with one 8px square per member at their score. **Shown, never averaged.**
  - Below, a 4-column grid with name, n, gauge, state, question and one-line read. Each item links to its indicator or panel.
- **Row 3** (8fr / 4fr):
  - Regime chart + regime strip + "You are here".
  - Quote with an ember left rule, plus a lesson link.
- Alternatives explored (not chosen) are in `Council Home Directions.dc.html` (A Rows, B Board room, C Editorial).

### 2. Indicator detail (`Investment Cockpit.dc.html#indicator-detail`, HY OAS example)
- Breadcrumb: Council / Marks · Credit / HY OAS.
- Title at Barlow 52px; "Option-adjusted spread" is a tooltip trigger.
- State tag, value at 44px (flashes green on update), change w/w.
- Four stats with range rails.
- **What happened:** range switch 1Y / 5Y / 10Y / 25Y / MAX (active = ember fill); chart 300px with thresholds, event dots and hover crosshair.
- **ExplainerCard** with the four tabs.
- **Right column:** What may happen (4 sources, each with a tooltip, "Add my estimate"), Who reads this (3 members), quote slot.

### 3. Panel page template (`Panel Template.dc.html`)
- Sub-tabs: Liquidity · Macro · Cycle · Value · Stress · Norway, each with a state square.
- Light summary card: title at 72px, guiding question, lead voice, panel read (gauge, n/5, tag, summary), and signal mix (count bars per state).
- **8 indicator cards** (4×2): index, name, frequency, value + unit, state tag, sparkline (5y, area fade in the state colour, end dot), one-line explanation, source, "Detail →". **Every card links to its indicator detail.**
- "How this panel works" paragraph.
- Liquidity is fully specified (Fed balance sheet, US net liquidity, M2, global CB balance sheets, DXY, NFCI, US 10y real yield, price confirmation). The other panels use the same slots.

### 4. Norway panel (`Norway Panel.dc.html`)
- **Summary card:** four themes (Rates, Krone, Households, Oil & fiscal), each with a state.
- **Policy rate & path:**
  - Four stats: rate, last decision, next meeting, 12-month path.
  - Chart: step-line history, Norges Bank path (ember) with an uncertainty fan, and the market-implied path (blue, dashed). TODAY marker.
  - Four next-meeting probabilities, one per source.
  - "MPR" tooltip.
- **The krone:** I-44, EUR/NOK and USD/NOK, each with a range rail and note ("higher = weaker krone" tooltip).
- **8 cells:** NOWA, Norway 10y, CPI-ATE, Mainland GDP, unemployment, household debt (~230–240% of income, mostly floating), house prices, Brent. Each has a 10y sparkline.
- **Oil fund & fiscal rule:** GPFG value, share of the fund spent, and a 0–5% rail with the 3% rule marker (tooltip).
- **Norwegian tax notes:** ASK, formuesskatt, IPS. All thresholds are placeholders, and the card says "RULES CHANGE YEARLY · VERIFY ON SKATTEETATEN.NO".

### 5. Portfolio lab (`Portfolio Lab.dc.html`)
- **Header strip:** value, holdings, 1y volatility, last import; Import CSV and Test a change buttons.
- **Allocation:**
  - Tabs: Asset class / Region / Sector / Factor / Currency.
  - Each row: name, tick-bar, %, and target %.
- **Risk contribution vs capital weight:** paired bars (capital in grey, risk in ember), with a tooltip.
- **Regime exposure:** a 2×2 with % in each quadrant and which assets win there.
- **Crash payoff:**
  - −20% and −40% values in NOK.
  - Payoff curve: market move on x, portfolio on y. Linear dashed line for no hedges; convex ember line with a convex sleeve.
- **NOK hedge ratio:**
  - Range slider, 0–100 in steps of 5.
  - NOK ±10% impact.
  - The explanation text changes at <30 / 30–70 / >70.
- **Scenarios:** six rows, each with probability, source tag, mine vs 60/40.
- **Reference portfolios** (Mine column highlighted in ember-deep):
  - All Weather (retail approx. 30 / 40 / 15 / 7.5 / 7.5).
  - 60/40.
  - Permanent (4×25).
  - Barbell (~85–90 safe / 10–15 convex).
  - Rows for each weight, max drawdown and crash payoff.

### 6. Journal + Munger red team (`Journal.dc.html`, clickable)
- **Left rail:** New decision button and the decision log (title, review date, tag OPEN / RIGHT / WRONG).
- **Stepper:** 01 Decision → 02 Red team → 03 Saved.
- **Step 1 — Decision form:**
  - Fields: Decision*, Consensus view, My view*, What's priced in, Invalidation*, Pre-mortem.
  - Source chips for "priced in".
  - **Continue is disabled until all * fields are non-empty.**
  - A light snapshot card freezes posture, council states and prices with the entry.
- **Step 2 — Red team:** eight checks. **Save requires all 8 checks plus a review date.** The counter shows n/8 (watch until 8, then up). The hint explains what's missing.
  1. Confirmation bias
  2. Incentives
  3. Social proof
  4. Overconfidence
  5. Availability
  6. Anchoring
  7. Loss aversion & sunk cost
  8. Inversion
- **Step 3 — Saved:** the light card with the decision title and all fields, "✓ RED-TEAMED 8/8", review date, New decision / Edit. The entry is prepended to the log.

### 7. Learn library + lesson (`Learn.dc.html`)
- **Library:**
  - Search filters the A–Z concept index (each entry linked to its panel).
  - Eight council profiles (portrait placeholder, question, core idea).
  - Featured lesson card.
  - Sourced quotes (unsourced ones show as empty slots).
- **Lesson "The pendulum":**
  - A pendulum swings ±40°, 2.6s ease-in-out alternate, with FEAR on the left and GREED on the right.
  - Hold / Swing toggle.
  - Three stage buttons (Fear · The middle · Greed) stop the swing and set the angle (700ms ease) and the bob colour. The detail grid updates (Investors / Prices / Credit).
  - Also: an idea paragraph, a quote slot and a one-question quiz with feedback.
  - **Teaching motion only appears in Learn.**

### 8. Mobile 390×844 (`Mobile.dc.html`)
- **M1 Council home:**
  - Status bar, header, signature line, ticker.
  - Posture card (56px word, 5 steps, reasons).
  - What changed (3).
  - Council list (name, tag, question, mini gauge 10×7). Each row ≥ 44px.
  - Bottom tab bar (5).
- **M2 Indicator detail:**
  - Back button, + Journal.
  - Title, value, tag, range rail.
  - Chart 190px with the range buttons (44px).
  - Accordion of the four explainers (one open at a time).
  - Sources.
- **Tooltips on mobile:** tap to open, not hover. This still needs implementing.

### 9. States and first run (`States.dc.html`)
- **S1 Empty / first run:** "The council has nothing to read yet". Three setup steps: connect data → import CSV → set a goal. Gauges stay empty until real data arrives.
- **S2 CSV import** (step 2 of 3, map columns):
  - Source column → app field.
  - A row that needs attention (account type ASK / IPS / regular) is flagged in watch.
  - Preview of the first 3 rows; Back / Confirm import.
  - Accepted from Nordnet, DNB, Sbanken and generic CSV.
- **S3 Loading:** a shimmering signature line, skeleton posture and rows, and eight member skeletons.
- **S4 Stale:**
  - Watch banner "3 sources older than expected" with Refresh now.
  - Stale cells have a tinted border, the age, and the value in muted.
- **S5 Failed source:**
  - Error card with a 3px red left bar, "Statistics Norway isn't responding", last success, the affected series shown as `—`, and Retry / Source status buttons.
  - An affected-reads list shows those reads as INCOMPLETE. **Never show them as calm.**

### 10. Design system sheet (`Investment Cockpit.dc.html#design-system`)
Swatches, type, gauge and tags, source tags, buttons and tooltip, the four data-cell states, the explainer, light quote and tags, and the motion spec. Exploration history is in `Design System Options.dc.html`; **14c is the one chosen**.

---

## Interactions and motion
- **First load only:** sections rise 10px and fade in over 480ms, `cubic-bezier(0.23,1,0.32,1)`, staggered 55ms.
- **After sections land:** gauges and posture steps reveal left→right (clip-path, 260–420ms). On the board-room variant, gauges grow from the bottom instead.
- **Value changes:** a 400ms background flash in green or red at about 30% opacity.
- **Live dot:** pulse 2s (expanding box-shadow ring).
- **Loading:** shimmer 1.4s linear.
- **Press:** `scale(0.97)` over 160ms. Hover effects only on fine pointers. No animation on keyboard or command actions.
- `prefers-reduced-motion`: disable all animation and render the final state.
- Tooltips open on hover and focus, and close on leave and blur.

## State (suggested)
- **Global:**
  - posture `{level 0–4, reasons[]}`
  - council `[{id, name, question, score 1–5, state, read, updatedAt}]`
  - indicators `{id → {value, unit, asOf, status: live|loading|stale|error, thresholds{watch, alert}, series[], events[]}}`
  - probabilities `{questionId → {marketImplied, model, baseRate, mine} each {p, hitRate, n}}`
- **Portfolio:** `holdings[]` (from CSV), targets, hedgeRatio, scenarios[].
- **Journal:** `entries[{id, title, consensus, mine, priced, pricedSource, invalidation, premortem, checks[8], reviewDate, snapshot, outcome?}]`.
- **UI:** range, explainer tab, allocation dimension, panel tab, open tooltip id.
- **Staleness:** derive it from `asOf` versus the expected frequency per source.

## Data sources referenced
FRED (WALCL, M2SL, DFII10, BAMLH0A0HYM2, NFCI), Norges Bank (policy rate, MPR path, NOWA, I-44, 10y), SSB (CPI-ATE, Mainland GDP, LFS, household debt), NAV, Eiendom Norge, ICE (Brent, DXY), NBIM (GPFG), market data for indices, FX and VIX.

## Assets
No images. Portraits are placeholders (striped boxes). All icons are text glyphs (▲ ▼ ◆ › ← ✓). Fonts come from Google Fonts.

## Files (in `designs/`)
| File | Contents |
|---|---|
| `Council Home Open.dc.html` | **Approved** council home: open layout and new regime plot |
| `Investment Cockpit.dc.html` | Council home, Indicator detail (interactive chart and tabs), Design system sheet; index of all files |
| `Council Home Directions.dc.html` | Alternatives A / B / C |
| `Panel Template.dc.html` | Panel page template with sub-tabs |
| `Norway Panel.dc.html` | Norway panel |
| `Portfolio Lab.dc.html` | Portfolio lab (interactive tabs and hedge slider) |
| `Journal.dc.html` | Journal + red-team prototype (full flow) |
| `Learn.dc.html` | Library + pendulum lesson |
| `Mobile.dc.html` | Mobile home + indicator |
| `States.dc.html` | Empty, import, loading, stale, error |
| `Design System Options.dc.html` | Exploration history (14c chosen) |
| `support.js` | Runtime needed to open the `.dc.html` files |
| `../DESIGN_RULES.md` | Condensed design rules (tokens, open layout, plot rules). Good to drop into the repo as `CLAUDE.md` |
