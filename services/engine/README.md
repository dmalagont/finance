# Cockpit engine

Python service that ingests public data, keeps every revision point-in-time, computes the
cockpit's indicators and council outputs, and writes them to Supabase Postgres.

```
sources (FRED/ALFRED · Norges Bank · SSB · Yahoo)
   → raw.observations   (every vintage, with its realtime window)
   → signals.indicator_values + signals.readings   (value, changes, percentile, state, freshness)
   → council.reads · council.posture · council.regime · probabilities.estimates
```

## Run locally

```bash
uv venv && uv pip install -e ".[dev]"
cp .env.example .env            # DATABASE_URL, FRED_API_KEY, ENGINE_API_TOKEN
.venv/bin/cockpit-engine run    # sync + ingest + compute
.venv/bin/cockpit-engine --memory run   # dry run, nothing saved
.venv/bin/cockpit-engine serve  # HTTP API on :8080
```

Commands: `sync` (sources, series, indicators, default thresholds) · `ingest [--source X] [--series Y]`
· `compute [--as-of YYYY-MM-DD]` · `run` · `serve`.

## Tests

```bash
.venv/bin/pytest                         # unit + end-to-end on an in-memory store
../../supabase/tests/run_local.sh        # migrations + RLS tests on a throwaway Postgres
KEEP=1 ../../supabase/tests/run_local.sh /tmp/cockpit-pg 54329
PG_TEST_DSN="host=/tmp port=54329 dbname=cockpit user=postgres" .venv/bin/pytest   # adds Postgres end-to-end
```

All test data is synthetic (random walks and hand-written payloads in each source's format).

## What is computed (v0, rule-based and explainable)

- **34 indicators** from 40 source series (`src/engine/compute/indicators.py`). Ids match the web app.
  Twelve indicators are listed as `PENDING` with the reason (licensed data or a source not wired yet);
  the app should show them as incomplete.
- **Readings**: latest value, changes (1w/13w/1y or 1m/3m/1y), percentile over full history,
  z-score, 52-week range, state from thresholds, status `live | stale | error | missing`.
- **Thresholds**: defaults in code, written to `ref.thresholds` with `is_default = true`.
  Edit a row and set `is_default = false` to keep your own; the engine never overwrites it.
  Most defaults are percentiles of the series' own history; a few are level rules (Sahm 0.5,
  inverted curves) and some are judgement calls, labelled as such in the `note` column.
- **Council**: each member's score is the mean of their indicators' states (calm 1, watch 3,
  alert 5), half-up rounded; under 50% coverage the member is **incomplete, never calm**.
  Munger has no automatic score. **Posture** maps the mean score onto five steps.
- **Regime**: z-scored 6-month changes in growth (INDPRO, PAYEMS, −UNRATE) and inflation
  (core PCE, CPI). Direction only — not surprises versus consensus.
- **Probabilities**: US recession in 12 months from the 10y–3m spread with NY Fed-style probit
  coefficients (verify against the NY Fed's current page). Market-implied and base-rate
  sources are not implemented yet.

## Caveats

- Series keys marked `check: true` in `catalog/series.yaml` (some Norges Bank, SSB and Yahoo keys)
  are best guesses until the first successful live fetch; failures are logged per series.
- Yahoo is unofficial; swap the fetcher for a paid source when it matters.
- Tudor Jones currently reads only one indicator; trend/breadth inputs are pending.
