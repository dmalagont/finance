"""Postgres store (Supabase). Connects with a role that bypasses RLS (service role / postgres)."""

from __future__ import annotations

import datetime as dt
import json
import math
from typing import Any

import pandas as pd
import psycopg
from psycopg.types.json import Jsonb

from ..catalog import Catalog
from .base import CouncilRead, Estimate, IndicatorMeta, Posture, Reading, Regime, ThresholdDef
from .pit import ROW, as_of_view, diff_rows, merge_vintages


def _num(v: Any) -> float | None:
    if v is None:
        return None
    f = float(v)
    return None if math.isnan(f) or math.isinf(f) else f


def _clean(obj: Any) -> Any:
    """Make a structure JSON-safe (NaN → null)."""
    if isinstance(obj, dict):
        return {k: _clean(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_clean(v) for v in obj]
    if isinstance(obj, float):
        return _num(obj)
    if isinstance(obj, dt.date):
        return obj.isoformat()
    return obj


class PostgresStore:
    def __init__(self, dsn: str):
        self.conn = psycopg.connect(dsn, autocommit=False)

    def close(self) -> None:
        self.conn.close()

    # ── reference ────────────────────────────────────────────────────────────
    def sync_reference(self, catalog: Catalog, indicators: list[IndicatorMeta], thresholds: list[ThresholdDef]) -> None:
        with self.conn.cursor() as cur:
            for s in catalog.sources.values():
                cur.execute(
                    "insert into ref.sources (id, name, url) values (%s, %s, %s) "
                    "on conflict (id) do update set name = excluded.name, url = excluded.url",
                    (s.id, s.name, s.url),
                )
            for s in catalog.series.values():
                cur.execute(
                    """insert into ref.series (id, source_id, source_key, name, unit, frequency, params, verified, notes)
                       values (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                       on conflict (id) do update set source_id = excluded.source_id, source_key = excluded.source_key,
                         name = excluded.name, unit = excluded.unit, frequency = excluded.frequency,
                         params = excluded.params, notes = excluded.notes""",
                    (s.id, s.source, s.key, s.name, s.unit, s.frequency, Jsonb(s.params), not s.check, s.notes),
                )
            for i in indicators:
                cur.execute(
                    """insert into ref.indicators (id, name, panel, unit, frequency, risk_when, inputs, method, notes)
                       values (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                       on conflict (id) do update set name = excluded.name, panel = excluded.panel, unit = excluded.unit,
                         frequency = excluded.frequency, risk_when = excluded.risk_when, inputs = excluded.inputs,
                         method = excluded.method, notes = excluded.notes""",
                    (i.id, i.name, i.panel, i.unit, i.frequency, i.risk_when, i.inputs, i.method, i.notes),
                )
            for t in thresholds:
                # Never overwrite thresholds the owner has customised (is_default = false).
                cur.execute(
                    """insert into ref.thresholds (indicator_id, method, watch, alert, direction, is_default, note)
                       values (%s, %s, %s, %s, %s, true, %s)
                       on conflict (indicator_id) do update set method = excluded.method, watch = excluded.watch,
                         alert = excluded.alert, direction = excluded.direction, note = excluded.note
                       where ref.thresholds.is_default""",
                    (t.indicator_id, t.method, t.watch, t.alert, t.direction, t.note),
                )
        self.conn.commit()

    def thresholds(self) -> dict[str, ThresholdDef]:
        with self.conn.cursor() as cur:
            cur.execute("select indicator_id, method, watch, alert, direction, is_default, note from ref.thresholds")
            return {r[0]: ThresholdDef(*r) for r in cur.fetchall()}

    # ── runs ─────────────────────────────────────────────────────────────────
    def start_run(self, job: str) -> int:
        with self.conn.cursor() as cur:
            cur.execute("insert into ops.runs (job) values (%s) returning id", (job,))
            run_id = cur.fetchone()[0]
        self.conn.commit()
        return run_id

    def finish_run(self, run_id: int, status: str, stats: dict[str, Any], error: str | None = None) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                "update ops.runs set finished_at = now(), status = %s, stats = %s, error = %s where id = %s",
                (status, Jsonb(_clean(stats)), error, run_id),
            )
        self.conn.commit()

    # ── observations ─────────────────────────────────────────────────────────
    def _existing(self, series_id: str) -> pd.DataFrame:
        with self.conn.cursor() as cur:
            cur.execute(
                "select obs_date, value, realtime_start, realtime_end from raw.observations where series_id = %s",
                (series_id,),
            )
            rows = cur.fetchall()
        return pd.DataFrame(rows, columns=ROW)

    def write_observations(self, series_id: str, incoming: pd.DataFrame, run_id: int | None) -> dict[str, int]:
        existing = self._existing(series_id)
        desired = merge_vintages(existing, incoming)
        ins, upd, dele = diff_rows(existing, desired)
        with self.conn.cursor() as cur:
            if len(dele):
                cur.executemany(
                    "delete from raw.observations where series_id = %s and obs_date = %s and realtime_start = %s",
                    [(series_id, r.obs_date, r.realtime_start) for r in dele.itertuples()],
                )
            if len(upd):
                cur.executemany(
                    "update raw.observations set value = %s, realtime_end = %s, run_id = %s "
                    "where series_id = %s and obs_date = %s and realtime_start = %s",
                    [
                        (
                            _num(r.value),
                            None if pd.isna(r.realtime_end) else r.realtime_end,
                            run_id,
                            series_id,
                            r.obs_date,
                            r.realtime_start,
                        )
                        for r in upd.itertuples()
                    ],
                )
            if len(ins):
                with cur.copy(
                    "copy raw.observations (series_id, obs_date, value, realtime_start, realtime_end, run_id) from stdin"
                ) as copy:
                    for r in ins.itertuples():
                        copy.write_row(
                            (
                                series_id,
                                r.obs_date,
                                _num(r.value),
                                r.realtime_start,
                                None if pd.isna(r.realtime_end) else r.realtime_end,
                                run_id,
                            )
                        )
        self.conn.commit()
        return {"inserted": len(ins), "updated": len(upd), "deleted": len(dele)}

    def series(self, series_id: str, as_of: dt.date | None = None) -> pd.Series:
        return as_of_view(self._existing(series_id), as_of)

    # ── computed ─────────────────────────────────────────────────────────────
    def write_indicator_values(self, indicator_id: str, values: pd.Series, run_id: int | None) -> None:
        clean = values.dropna()
        with self.conn.cursor() as cur:
            cur.execute("delete from signals.indicator_values where indicator_id = %s", (indicator_id,))
            with cur.copy("copy signals.indicator_values (indicator_id, obs_date, value, run_id) from stdin") as copy:
                for d, v in clean.items():
                    copy.write_row((indicator_id, pd.Timestamp(d).date(), float(v), run_id))
        self.conn.commit()

    def write_readings(self, readings: list[Reading], run_id: int | None) -> None:
        with self.conn.cursor() as cur:
            for r in readings:
                cur.execute(
                    """insert into signals.readings (indicator_id, as_of, value, last_obs_date, change, percentile, zscore,
                         range_52w, state, status, stale_days, run_id)
                       values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                       on conflict (indicator_id, as_of) do update set value = excluded.value,
                         last_obs_date = excluded.last_obs_date, change = excluded.change, percentile = excluded.percentile,
                         zscore = excluded.zscore, range_52w = excluded.range_52w, state = excluded.state,
                         status = excluded.status, stale_days = excluded.stale_days, run_id = excluded.run_id,
                         computed_at = now()""",
                    (
                        r.indicator_id,
                        r.as_of,
                        _num(r.value),
                        r.last_obs_date,
                        Jsonb(_clean(r.change)),
                        _num(r.percentile),
                        _num(r.zscore),
                        Jsonb(_clean(r.range_52w)) if r.range_52w else None,
                        r.state,
                        r.status,
                        r.stale_days,
                        run_id,
                    ),
                )
        self.conn.commit()

    def write_council(self, reads: list[CouncilRead]) -> None:
        with self.conn.cursor() as cur:
            for r in reads:
                cur.execute(
                    """insert into council.reads (member_id, as_of, score, state, read, drivers, method)
                       values (%s, %s, %s, %s, %s, %s, %s)
                       on conflict (member_id, as_of) do update set score = excluded.score, state = excluded.state,
                         read = excluded.read, drivers = excluded.drivers, method = excluded.method, computed_at = now()""",
                    (r.member_id, r.as_of, r.score, r.state, r.read, Jsonb(_clean(r.drivers)), r.method),
                )
        self.conn.commit()

    def write_regime(self, regime: Regime) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                """insert into council.regime (as_of, growth, inflation, growth_score, inflation_score, details, method)
                   values (%s, %s, %s, %s, %s, %s, %s)
                   on conflict (as_of) do update set growth = excluded.growth, inflation = excluded.inflation,
                     growth_score = excluded.growth_score, inflation_score = excluded.inflation_score,
                     details = excluded.details, method = excluded.method, computed_at = now()""",
                (
                    regime.as_of,
                    regime.growth,
                    regime.inflation,
                    _num(regime.growth_score),
                    _num(regime.inflation_score),
                    Jsonb(_clean(regime.details)),
                    regime.method,
                ),
            )
        self.conn.commit()

    def write_posture(self, posture: Posture) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                """insert into council.posture (as_of, level, reasons, disagreement, complete, method)
                   values (%s, %s, %s, %s, %s, %s)
                   on conflict (as_of) do update set level = excluded.level, reasons = excluded.reasons,
                     disagreement = excluded.disagreement, complete = excluded.complete, method = excluded.method,
                     computed_at = now()""",
                (
                    posture.as_of,
                    posture.level,
                    Jsonb(_clean(posture.reasons)),
                    _num(posture.disagreement),
                    posture.complete,
                    posture.method,
                ),
            )
        self.conn.commit()

    def write_estimates(self, estimates: list[Estimate]) -> None:
        with self.conn.cursor() as cur:
            for e in estimates:
                cur.execute(
                    "insert into probabilities.questions (id, text, horizon_days) values (%s, %s, %s) "
                    "on conflict (id) do update set text = excluded.text, horizon_days = excluded.horizon_days",
                    (e.question_id, e.question, e.horizon_days),
                )
                cur.execute(
                    "delete from probabilities.estimates where question_id = %s and source = %s and as_of = %s and owner is null",
                    (e.question_id, e.source, e.as_of),
                )
                cur.execute(
                    """insert into probabilities.estimates (question_id, source, p, p_low, p_high, n, method, details, as_of, owner)
                       values (%s, %s, %s, %s, %s, %s, %s, %s, %s, null)""",
                    (e.question_id, e.source, e.p, e.p_low, e.p_high, e.n, e.method, Jsonb(_clean(e.details)), e.as_of),
                )
        self.conn.commit()


def dumps(obj: Any) -> str:
    return json.dumps(_clean(obj))
