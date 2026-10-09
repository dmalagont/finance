# Investment Cockpit — Design

A private, educational cockpit for monitoring macro and market risk, pricing what may
happen, and building a well-diversified portfolio. Based in Norway (NOK investor), with a
global and US macro core.

> Status: design agreed in conversation, nothing built yet. This document is the source of
> truth for scope and decisions; update it when a decision changes.

---

## 1. Goals

1. **Understand the past** — long history of every indicator, regime timeline, major events
   annotated (1970s, 2000, 2008, 2020, 2022) so signals can be judged in context.
2. **See the present** — "what changed this week / month": signal moves, thresholds
   crossed, each council member's current read.
3. **Price the future** — probabilities, always labelled by origin:
   - *Market-implied*: policy-rate odds from futures, option-implied distributions,
     credit-implied default probabilities.
   - *Model-based*: yield-curve recession probability, regime-transition likelihoods,
     VaR / expected shortfall, stress tests.
   - *Base rates*: what historically followed similar readings.
   - *Personal*: my own scenario probabilities, scored against outcomes.
4. **Build and follow a diversified portfolio** — across assets, regions, sectors, factors
   and currencies; track real and model portfolios against cockpit signals over time.
5. **Teach** — every number explained simply, linked to concepts, the board's ideas and
   sourced quotes.

### Principles

- **Conditions, not predictions.** "You can't predict. You can prepare." (Marks)
- **Honest uncertainty.** Every probability shows its source, range and track record.
- **Point-in-time data.** Store what was known when; never flatter backtests with revised data.
- **Disagreement is information.** The council is not blended into one number.
- **Simple first.** Plain language on top, depth one click away.

---

## 2. The Board (Investor Council)

Each member answers one distinct question. Capped at this roster.

| Member | Question | Key contributions |
|---|---|---|
| **Ray Dalio** | What regime and debt cycle are we in? | Growth × inflation quadrants, short/long-term debt cycle, Big Cycle, risk parity, "Holy Grail" of 10–15 uncorrelated streams |
| **Stanley Druckenmiller** (+ Soros) | Where is liquidity going, and does price confirm it? | Global liquidity rate of change, market-implied policy path, intermarket signals, conviction sizing, reflexivity |
| **Howard Marks** | How hot are psychology and credit? | Market temperature checklist, credit cycle, risk = permanent loss, second-level thinking, "yield is destiny" |
| **Warren Buffett + Joel Greenblatt** | Are my holdings good businesses at good prices? | Buffett indicator, Berkshire cash, quality/moat, margin of safety, Magic Formula, market earnings yield, special situations |
| **Nassim Taleb / Mark Spitznagel** | Where am I fragile; what pays off if things break? | Barbell, crash payoff (convexity), hedge cost, hidden leverage |
| **Paul Tudor Jones** | Is the trend with me? | 200-day rule, CTA / CFTC positioning |
| **William Bernstein / Jack Bogle** | Will this meet my goals; what deep risks exist? | Deep vs shallow risk (inflation, deflation, confiscation, devastation), costs, taxes, behaviour gap |
| **Charlie Munger** (role: Red Team) | What would make this decision stupid? | Inversion, bias checklist, audits every journal entry |

Folded in rather than seated: **Jeremy Grantham** (2-sigma bubble detector → valuation
layer), **Ed Thorp** (Kelly sanity check → sizing panel).

**Council home view:** one gauge + one-line read per member, plus a disagreement indicator.
**Posture dial:** Regime (Dalio) × Temperature (Marks) × Liquidity/stress → defensive ↔
aggressive, always with the reasons.

---

## 3. Panels (by layer)

### 3.1 Macro machine — Dalio, Druckenmiller

**Regime (growth × inflation)**
- Growth: PMIs, GDPNow, jobless claims, unemployment / Sahm rule, retail sales.
- Inflation: CPI, core PCE, 5y & 10y breakevens, 5y5y forward, commodities, wages.
- Output: 2×2 quadrant with 12-month trail; assets that historically favour each quadrant.

**Short-term debt cycle & liquidity**
- Fed funds vs neutral, real policy rate, 2s10s and 3m10y curves (inversion and
  un-inversion flagged), market-implied rate path vs Fed guidance.
- Net liquidity = Fed balance sheet − TGA − reverse repo; extended to ECB, BoJ, PBoC,
  Norges Bank. Focus on rate of change.
- M2, bank lending standards (SLOOS), NFCI.

**Long-term debt cycle**
- Debt/GDP by sector; federal interest expense / revenue; deficit % GDP; r vs g;
  term premium; auction quality; central-bank and foreign Treasury holdings.

**Big Cycle**
- USD reserve share (IMF COFER), DXY, central-bank gold buying, gold in multiple
  currencies, gold/Treasuries ratio; manual quarterly scores for internal and external
  conflict.

**Intermarket / price action**
- Copper/gold, cyclicals vs defensives, small vs large, transports, semis, banks,
  credit vs equities, dollar trend. Alert when price contradicts the thesis.

### 3.2 Cycle & psychology — Marks

- **Temperature checklist** (paired opposites, data proxy or manual 1–5 score):
  lenders eager/reticent, terms easy/restrictive, spreads narrow/wide,
  investors optimistic/pessimistic, markets crowded/starved, recent performance,
  prices high/low, prospective returns, popular traits aggressive/disciplined.
- **Credit cycle**: HY / IG / CCC spreads and their change, defaults and distress
  ratio, covenant-lite share, LBO leverage, PIK issuance, private credit growth.
- Sentiment: AAII, put/call, fund flows, margin debt, IPO/SPAC activity.

### 3.3 Market valuation — Buffett, Greenblatt, Marks, Grantham

- Buffett indicator (equity market value / GDP), CAPE, equity risk premium,
  market earnings yield percentile → historical forward returns, bubble detector
  (2σ from trend), starting yields as return estimates.

### 3.4 Stress & tail risk — Taleb, Spitznagel

- VIX, MOVE, SKEW, VIX term structure, stock–bond correlation, funding stress
  (SOFR spreads, cross-currency basis), concentration of the index.

### 3.5 Norway

| Source | Data |
|---|---|
| Norges Bank API | Policy rate and projected path, NOWA, NOK FX incl. I-44, government yields |
| SSB (Statistics Norway) API | CPI, CPI-ATE, Mainland GDP, unemployment (LFS + NAV), wages, credit indicator K2, house prices |
| Brent oil | Core NOK and economy driver |
| NBIM / Ministry of Finance | Oil fund value, fiscal rule (3%), structural non-oil deficit |
| Oslo Børs | OSEBX and sector indices |
| Finanstilsynet / Eiendom Norge | Household debt and housing risk |

Norway-specific signals:
- **Household debt** (~230–240% of disposable income, mostly floating rate) — the main
  domestic vulnerability; policy rate transmits fast.
- **NOK as a risk-off currency** — tends to weaken in global stress and oil drops, so
  unhedged foreign assets act as a natural hedge. Hedge ratio is a key portfolio decision.
- **Tax layer** — aksjesparekonto (ASK), formuesskatt, IPS; after-tax returns in the
  Bernstein/Bogle panel.

---

## 4. Portfolio lab

- **Holdings**: import (broker CSV first), allocation by asset class, region, sector,
  factor, currency; liquidity and concentration.
- **Risk**: risk contribution (not just capital weights), regime exposure per holding,
  correlation matrix and count of effectively independent streams, drawdowns,
  VaR / expected shortfall.
- **Fragility**: crash payoff at −20% / −40% equity, barbell breakdown, hidden leverage.
- **Fund look-through** (primary — the portfolio is mostly funds):
  - True exposure across all funds combined: region, sector, currency, top companies,
    overlap between funds, hidden concentration (e.g. share in the largest US tech names).
  - Holdings from issuer files (ETF daily holdings, mutual-fund monthly/semi-annual reports).
  - Returns-based style analysis: regress each fund's NAV history on factors and regimes to
    estimate its real exposure (equity beta, rates, USD/NOK, value/growth) — needs only prices.
  - Costs (TER, platform fees), NOK-hedged vs unhedged share classes, ASK eligibility and
    equity share for tax, tracking difference vs index.
- **Stock scorecard** (secondary, small watchlist; phase 2b): council-based checks per stock
  (Buffett quality, Greenblatt Magic Formula, Marks downside, Taleb fragility, Tudor Jones
  trend, regime sensitivity) and a reverse DCF ("what growth is priced in?") instead of paid
  analyst forecasts. Data: SEC EDGAR XBRL for US; ESEF filings or a paid fundamentals API for
  Oslo/Europe. Own visual, not a copy of any commercial product.
- **Security level**: quality (ROIC history, leverage, margins, share count), Magic
  Formula score, margin-of-safety band, moat and circle-of-competence (manual).
- **Sizing**: conviction score vs position size, Kelly sanity check, thesis-invalidation
  triggers.
- **Scenarios**: 4–6 named scenarios (soft landing, stagflation, deflationary bust, dollar
  crisis, oil shock / NOK, …) with my probabilities and portfolio outcome under each;
  historical stress replays (1970s, 2000, 2008, 2020, 2022).
- **Reference portfolios** tracked alongside mine: All Weather, 60/40, Permanent
  Portfolio, Taleb barbell, global market portfolio (NOK base).
- **Follow-up loop**: every signal reading and council read is logged; periodic review of
  how signals behaved and how each portfolio responded.

## 5. Journal & playbook

- Decision log: consensus view, my view, why different, what's priced in, invalidation,
  pre-mortem; Munger red-team audit required before saving.
- Playbook: pre-committed "if X then Y" rules and rebalancing bands.
- Track record: scores for indicators, council reads and my own scenario probabilities.

## 6. Educational layer

- Each chart/indicator: **What is this · Why it matters · How to read it now · What the
  board says** + related concepts.
- Concept library (debt cycle, pendulum, convexity, margin of safety, r vs g, …),
  council profiles, sourced quotes (only quotes with a verifiable source).
- Content lives in the repo as MDX/YAML; each indicator has a definition file:
  source, series ids, transform, thresholds, explanation, council member, concepts, quotes.
- Optional AI layer (Claude API): weekly memo and "explain this" button, grounded only in
  computed data and the vetted quote library.

---

## 7. Architecture

**Decision:** Supabase + Cloudflare only (two vendors).

```
                     Cloudflare Access (only my identity)
                                   │
┌──────────────────────────── Cloudflare ─────────────────────────────┐
│ Web app: Next.js (TypeScript) on Workers                            │
│ UI: Tailwind + shadcn/ui · Charts: ECharts, TradingView Lightweight │
│ Content: MDX                                                        │
│                                                                     │
│ Cron Triggers ──► Worker ──► Engine (Python) on Cloudflare Containers│
│                              FastAPI: ingestion jobs, compute jobs, │
│                              on-demand analytics                    │
└───────────────┬─────────────────────────────────┬───────────────────┘
                │ reads (server-side)             │ writes (service key)
                ▼                                 ▼
        ┌──────────────── Supabase (eu-north-1, Stockholm) ───────────┐
        │ Postgres + RLS · Auth · Storage · pg_cron · daily backups   │
        └─────────────────────────────────────────────────────────────┘
```

- **Web app** reads precomputed results; heavy maths stays in the engine.
- **Engine** is one Docker image (pandas, statsmodels, riskfolio-lib …) with two modes:
  scheduled batch (ingest → compute) and on-demand API. Jobs are kept short and chunked
  (Containers is newer; avoid very long runs). Portable to Cloud Run / Fly.io if needed.
- **Scheduling**: Cloudflare Cron Triggers call the engine; ingestion log records each run.

### Data model (Postgres schemas)

| Schema | Contents |
|---|---|
| `ref` | sources, series, indicator definitions, events |
| `raw` | observations with `as_of` / vintage (point-in-time) |
| `signals` | computed indicator values, z-scores, percentiles, states |
| `probabilities` | market-implied, model and base-rate probabilities |
| `council` | per-member reads, posture, disagreement |
| `portfolio` | accounts, holdings, transactions, model portfolios, risk results |
| `journal` | decisions, scenarios, playbook rules, Munger audits, track record |
| `ops` | ingestion runs, freshness, errors |

### Data sources (initial)

- **FRED / ALFRED** (US macro, rates, spreads, liquidity; ALFRED for vintages). Note: ISM
  PMI is not on FRED; check history depth for licensed series (e.g. ICE BofA spreads).
- **Yahoo Finance** (prices; unofficial — plan a paid fallback such as EODHD).
- **Norges Bank**, **SSB**, **NBIM**, **Oslo Børs** (Norway).
- **CFTC** Commitments of Traders, **NY Fed** (recession probability, ACM term premium),
  **US Treasury** (TGA, auctions), **IMF COFER**, **BIS**, **ECB SDW**.
- **SEC EDGAR XBRL** for company fundamentals (if holding individual stocks).
- Manual inputs: temperature scores, Big Cycle scores, moat/competence, scenarios.

### Cross-cutting

- **Security**: Cloudflare Access in front; RLS on every table; service key only in the
  engine; secrets in Cloudflare and GitHub.
- **Quality**: freshness checks, ingestion log, status page; golden tests for calculations.
- **Engineering**: Supabase migrations in repo, generated TS types, CI (lint/test),
  preview deploys, Sentry.
- **Alerts**: email (Resend) or Telegram on threshold crossings; weekly memo.

### Repository layout

```
apps/web/          Next.js app
services/engine/   Python: ingestion, compute, FastAPI
supabase/          migrations, seed, RLS policies
content/           concepts, council, quotes, indicator definitions (MDX/YAML)
docs/              DESIGN.md, ADRs
```

### Cost estimate (Oct 2026, verify before subscribing)

| Stage | Items | ≈ / month |
|---|---|---|
| Build | Supabase Free + Workers Paid ($5) | $5 |
| Live | Supabase Pro ($25, Micro compute included) + Workers Paid ($5) + container overage (~$0–2) + domain (~$1) | $31–35 |
| Optional | Claude API (memo / explain), paid price data (~$20–30) | extra |

---

## 8. Design (Claude Design)

**Source of truth:** the Claude Design handoff in [`design/handoff/`](../design/handoff/README.md)
(high fidelity). Design system **"Gunmetal Ember"** (option 14c) with the approved **open
layout**; it supersedes the earlier "Polar Night" and "Nordic Terminal" explorations and the
canvas brief in `docs/design-brief.md`.

- Tokens, components, plot rules and motion: `design/handoff/README.md` and
  `design/handoff/DESIGN_RULES.md`.
- Screens (open `designs/*.dc.html` in a browser next to `support.js`): Council home
  (`Council Home Open` approved), Indicator detail, Panel template, Norway panel, Portfolio
  lab, Journal + red team, Learn + pendulum lesson, Mobile, States / first run, Design system.
- Build mapping: tokens → Tailwind theme; shared components (SectionHeader, CouncilGauge,
  StateTag, SourceTag, PostureSelector, DataCell, ExplainerCard, QuoteBlock, ConceptTooltip,
  Ticker, CommandLine, Buttons) → shadcn/ui primitives restyled with radius 0.
- Rules that carry into code: never ship invented data (placeholders + loading/stale/error
  until wired); quotes only with a verifiable source; probability sources never blended;
  regimes never green/red; failed sources make reads INCOMPLETE, never calm.

---

## 9. Phases

1. **Foundation + macro**: repo scaffold, Supabase schemas, engine with FRED + Norges Bank
   + SSB + Yahoo ingestion, regime / liquidity / credit / stress / valuation panels,
   first temperature dial, Council home, deployed privately.
2. **Portfolio**: holdings import, risk contribution, regime exposure, fragility,
   conviction & invalidation, journal with Munger audit, quality and Magic Formula scores.
3. **Synthesis**: long-term debt and Big Cycle panels, manual scoring forms, posture dial,
   scenarios and probabilities, reference portfolios, alerts, weekly memo, track record.

## 10. Open questions

- Holdings: how they arrive (broker CSV / manual / API); mostly ETFs or single stocks?
- Time horizon and main goal (for the Bernstein/Bogle panel).
- FRED API key; Supabase project and Cloudflare account access.
- Alerts channel: email or Telegram.
