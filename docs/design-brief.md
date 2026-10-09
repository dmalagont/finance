# Design brief — Investment Cockpit (for Claude Design)

> **Superseded:** this brief produced the Claude Design exploration. The chosen design is now
> the handoff in [`design/handoff/`](../design/handoff/README.md) ("Gunmetal Ember", open layout).

**Canvas:** https://claude.ai/artifact/WGBMUyDkqNAi9NAUM4DJG5 — continue on this canvas; keep its three artboards (Council home, Indicator detail, Design system) as the baseline.

## What it is
A private web app for one investor based in Norway (NOK base). It monitors macro and market
risk, prices what may happen, and helps build a diversified portfolio. It is **educational**:
every number is explained simply and linked to concepts and the ideas of an "investor council".
Monitoring tool, not investment advice.

## Three questions every screen answers
1. **What happened** — long history, regimes, annotated events (2008, 2020, 2022).
2. **What is happening** — what changed this week, thresholds crossed, current reads.
3. **What may happen** — probabilities, always labelled by source: *Market-implied*, *Model*,
   *Base rate*, *My estimate*, each with a track record (hit rate).

## The council (each answers one question)
| Member | Question |
|---|---|
| Ray Dalio | What regime and debt cycle are we in? |
| Stanley Druckenmiller | Where is liquidity going, and does price confirm it? |
| Howard Marks | How hot are psychology and credit? |
| Buffett & Greenblatt | Are my holdings good businesses at good prices? |
| Taleb & Spitznagel | Where am I fragile, and what pays off if things break? |
| Paul Tudor Jones | Is the trend with me? |
| Bernstein & Bogle | Will this meet my goals, and what deep risks exist? |
| Charlie Munger | Red team: what would make this decision stupid? |

Each has a 1–5 gauge (supportive → risky), a state (Calm / Watch / Alert) and a one-line read.
Disagreement between members is shown, never averaged away. The headline is a **posture**
from Defensive to Aggressive, with its reasons.

## Visual identity: "Polar Night"
Dark, distinctive, financial but clean. **Not** a Bloomberg copy (no amber terminal, no F-keys).
- **Ground:** night `#090B0F` with a faint 22px dot grid `#171C26` ("graph paper at night").
- **Panels:** `#0F1218`, border `#1E2430`, radius 14. Raised `#161B24`.
- **Ink:** `#ECEAF2`, secondary `#C3C6D1`, muted `#9097A6`.
- **Brand:** violet `#A594FF` (structure, active nav, focus, chart subject); deep violet
  `#221D3D`; learning panels `#14112A`.
- **Semantic:** mint `#5CF2C2` up/calm · rose `#FF6B8B` down/alert · amber `#FFC56B` watch ·
  ice `#7CC8FF` links/comparison. Always paired with an arrow or word; rising *risk* is rose
  even when the number goes up.
- **Signature:** a thin aurora gradient line under the header (mint → ice → violet → rose),
  slowly shifting.
- **Type:** Instrument Serif (italic) for voice — big statements, council names, quotes;
  Familjen Grotesk for UI and explanations; JetBrains Mono for every figure and small caps labels.
- Panel headers: mono index in violet ("01") + sentence-case title.

## Motion (meaningful, never decorative noise)
- First load only: panels/rows rise 10px + fade, 480ms, `cubic-bezier(0.23,1,0.32,1)`,
  45–60ms stagger; gauges fill; posture marker slides in.
- Charts draw in once (1.6s, `cubic-bezier(0.77,0,0.175,1)`); range switches are instant.
- Market strip scrolls (70s loop, pauses on hover); value changes flash background mint/rose 400ms.
- Live dot pulses; "you are here" on the regime map rings.
- Teaching motion only in Learn (e.g. the Fear ↔ Greed pendulum).
- No animation on keyboard/command actions; press = scale 0.97, 160ms; hover only on
  fine pointers; `prefers-reduced-motion` settles everything to final state.

## Content rules
- No invented data: use placeholders (`––.––`, `[DATE]`, `[THRESHOLD]`) until real data exists.
- Quotes only with a verifiable source, shown with attribution.
- Every indicator gets four explainers: **What is this · Why it matters · How to read it now ·
  What the board says**, plus related concepts and data freshness.
- Works at phone width; WCAG contrast (4.5:1 text); real buttons and links.

## Screens to design next
1. **Norway panel** — Norges Bank policy rate and path, NOWA, NOK (I-44, EURNOK, USDNOK),
   Norwegian 10y, CPI-ATE, Mainland GDP, unemployment, household debt (~230–240% of income,
   mostly floating rate), house prices, Brent, oil fund and fiscal rule; tax notes (ASK,
   formuesskatt, IPS).
2. **Portfolio lab** — allocation by asset/region/sector/factor/currency, risk contribution vs
   capital weight, regime exposure, crash payoff (−20% / −40%), scenarios with probabilities,
   reference portfolios (All Weather, 60/40, Permanent, barbell), NOK hedge ratio.
3. **Journal** — decision log (consensus view, my view, what's priced in, invalidation,
   pre-mortem) with a Munger red-team checklist before saving.
4. **Learn library** — concepts, council profiles, sourced quotes; short lessons with
   teaching motion.
5. **Mobile** versions of Council home and Indicator detail.

## Stack it will be built in (for handoff)
Next.js + Tailwind + shadcn/ui on Cloudflare, charts in ECharts / TradingView Lightweight
Charts, data in Supabase. Keep components reusable: panel, gauge, state tag, source tag,
data cell (live / loading / stale / error), explainer card, quote block, concept tooltip.
