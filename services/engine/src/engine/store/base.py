from __future__ import annotations

import datetime as dt
from dataclasses import dataclass, field
from typing import Any, Protocol

import pandas as pd

from ..catalog import Catalog


@dataclass
class IndicatorMeta:
    id: str
    name: str
    panel: str
    unit: str
    frequency: str
    risk_when: str
    inputs: list[str]
    method: str
    notes: str | None = None


@dataclass
class ThresholdDef:
    indicator_id: str
    method: str  # level | percentile
    watch: float | None
    alert: float | None
    direction: str  # higher | lower | both
    is_default: bool = True
    note: str | None = None


@dataclass
class Reading:
    indicator_id: str
    as_of: dt.date
    value: float | None
    last_obs_date: dt.date | None
    change: dict[str, float | None]
    percentile: float | None
    zscore: float | None
    range_52w: dict[str, float] | None
    state: str  # calm | watch | alert | incomplete
    status: str  # live | stale | error | missing
    stale_days: int | None


@dataclass
class CouncilRead:
    member_id: str
    as_of: dt.date
    score: int | None
    state: str
    read: str
    drivers: list[dict[str, Any]]
    method: str


@dataclass
class Regime:
    as_of: dt.date
    growth: str | None
    inflation: str | None
    growth_score: float | None
    inflation_score: float | None
    details: dict[str, Any]
    method: str


@dataclass
class Posture:
    as_of: dt.date
    level: int | None
    reasons: list[dict[str, Any]]
    disagreement: float | None
    complete: bool
    method: str


@dataclass
class Estimate:
    question_id: str
    question: str
    source: str
    p: float
    as_of: dt.date
    method: str
    p_low: float | None = None
    p_high: float | None = None
    n: int | None = None
    details: dict[str, Any] = field(default_factory=dict)
    horizon_days: int | None = None


class Store(Protocol):
    def sync_reference(
        self, catalog: Catalog, indicators: list[IndicatorMeta], thresholds: list[ThresholdDef]
    ) -> None: ...
    def thresholds(self) -> dict[str, ThresholdDef]: ...
    def start_run(self, job: str) -> int: ...
    def finish_run(self, run_id: int, status: str, stats: dict[str, Any], error: str | None = None) -> None: ...
    def write_observations(self, series_id: str, incoming: pd.DataFrame, run_id: int | None) -> dict[str, int]: ...
    def series(self, series_id: str, as_of: dt.date | None = None) -> pd.Series: ...
    def write_indicator_values(self, indicator_id: str, values: pd.Series, run_id: int | None) -> None: ...
    def write_readings(self, readings: list[Reading], run_id: int | None) -> None: ...
    def write_council(self, reads: list[CouncilRead]) -> None: ...
    def write_regime(self, regime: Regime) -> None: ...
    def write_posture(self, posture: Posture) -> None: ...
    def write_estimates(self, estimates: list[Estimate]) -> None: ...
