# Cockpit — web app

Next.js 16 (App Router, Cache Components) + Tailwind CSS v4, built from the Claude Design
handoff in [`design/handoff/`](../../design/handoff/README.md) ("Gunmetal Ember", open layout).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

## Status

- **No live data yet.** Every figure is a placeholder (`––.––`, `[DATE]`), charts are seeded
  "ILLUSTRATIVE SHAPE — NOT DATA" curves, and council/indicator states are design samples
  labelled `SAMPLE`. The header links to `/status`, which reports all sources as not connected.
- Journal entries and CSV imports are kept in the browser (localStorage) until Supabase is wired.

## Routes

| Route | Screen |
|---|---|
| `/` | Council home: posture, what changed, what may happen, council, regimes, quote |
| `/indicators/[id]` | Indicator detail (46 indicators from `src/lib/data/indicators.ts`) |
| `/panels/[panel]` | Panel template: liquidity, macro, cycle, value, stress |
| `/norway` | Norway panel |
| `/portfolio` | Portfolio lab, incl. fund look-through |
| `/journal` | Decision journal with the Munger red team (8 checks + review date to save) |
| `/learn`, `/learn/pendulum` | Concept index, council profiles, sourced quotes; pendulum lesson |
| `/setup`, `/setup/import` | First run; CSV import with column mapping (parsed in the browser) |
| `/status` | Data source status |

## Structure

```
src/app/            routes
src/components/ui/  SectionHeader, StateTag, SourceTag, CouncilGauge, PostureSelector,
                    DataCell, ExplainerCard, QuoteBlock, Tooltip/ConceptTooltip, Button
src/components/     charts/, layout/ (header, ticker, ⌘K palette), panels/, portfolio/, …
src/lib/data/       indicator registry, members, concepts, verified quotes, sample states
```

Design rules carried into code: quotes only with a verifiable source, probability sources
never blended, regimes never green/red, long-form text in IBM Plex Sans for readability,
`prefers-reduced-motion` renders final states.
