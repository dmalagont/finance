"""In-memory store for tests and dry runs."""

from __future__ import annotations

import datetime as dt
from typing import Any

import pandas as pd

from ..catalog import Catalog
from .base import CouncilRead, Estimate, IndicatorMeta, Posture, Reading, Regime, ThresholdDef
from .pit import ROW, as_of_view, diff_rows, merge_vintages


class MemoryStore:
    def __init__(self) -> None:
        self.obs: dict[str, pd.DataFrame] = {}
        self.indicator_values: dict[str, pd.Series] = {}
        self.readings: dict[str, Reading] = {}
        self.council: dict[str, CouncilRead] = {}
        self.regime: Regime | None = None
        self.posture: Posture | None = None
        self.estimates: list[Estimate] = []
        self.runs: list[dict[str, Any]] = []
        self.catalog: Catalog | None = None
        self.indicators: list[IndicatorMeta] = []
        self._thresholds: dict[str, ThresholdDef] = {}

    def sync_reference(self, catalog: Catalog, indicators: list[IndicatorMeta], thresholds: list[ThresholdDef]) -> None:
        self.catalog, self.indicators = catalog, indicators
        self._thresholds = {t.indicator_id: t for t in thresholds}

    def thresholds(self) -> dict[str, ThresholdDef]:
        return dict(self._thresholds)

    def start_run(self, job: str) -> int:
        self.runs.append(
            {"id": len(self.runs) + 1, "job": job, "status": "running", "started_at": dt.datetime.now(dt.UTC)}
        )
        return len(self.runs)

    def finish_run(self, run_id: int, status: str, stats: dict[str, Any], error: str | None = None) -> None:
        self.runs[run_id - 1] |= {"status": status, "stats": stats, "error": error}

    def write_observations(self, series_id: str, incoming: pd.DataFrame, run_id: int | None) -> dict[str, int]:
        existing = self.obs.get(series_id, pd.DataFrame(columns=ROW))
        desired = merge_vintages(existing, incoming)
        ins, upd, dele = diff_rows(existing, desired)
        self.obs[series_id] = desired
        return {"inserted": len(ins), "updated": len(upd), "deleted": len(dele)}

    def series(self, series_id: str, as_of: dt.date | None = None) -> pd.Series:
        return as_of_view(self.obs.get(series_id, pd.DataFrame(columns=ROW)), as_of)

    def write_indicator_values(self, indicator_id: str, values: pd.Series, run_id: int | None) -> None:
        self.indicator_values[indicator_id] = values

    def write_readings(self, readings: list[Reading], run_id: int | None) -> None:
        for r in readings:
            self.readings[r.indicator_id] = r

    def write_council(self, reads: list[CouncilRead]) -> None:
        for r in reads:
            self.council[r.member_id] = r

    def write_regime(self, regime: Regime) -> None:
        self.regime = regime

    def write_posture(self, posture: Posture) -> None:
        self.posture = posture

    def write_estimates(self, estimates: list[Estimate]) -> None:
        self.estimates.extend(estimates)
