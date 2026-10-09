"""Pure time-series transforms. Series are float, indexed by sorted Timestamps."""

from __future__ import annotations

import numpy as np
import pandas as pd

PERIODS_PER_YEAR = {"D": 252, "W": 52, "M": 12, "Q": 4, "A": 1}


def clean(s: pd.Series) -> pd.Series:
    return s.dropna().sort_index()


def yoy_pct(s: pd.Series, freq: str) -> pd.Series:
    """Year-over-year % change for regular monthly/quarterly/weekly series."""
    s = clean(s)
    return (s / s.shift(PERIODS_PER_YEAR[freq]) - 1.0) * 100.0


def change_over(s: pd.Series, offset: str) -> float | None:
    """Latest value minus the last value at or before (latest date - offset)."""
    s = clean(s)
    if len(s) < 2:
        return None
    target = s.index[-1] - pd.tseries.frequencies.to_offset(offset)
    prior = s[s.index <= target]
    if prior.empty:
        return None
    return float(s.iloc[-1] - prior.iloc[-1])


def asof_align(base: pd.Series, other: pd.Series) -> pd.Series:
    """Value of `other` known at or before each date of `base`."""
    other = clean(other)
    if other.empty:
        return pd.Series(np.nan, index=base.index)
    return other.reindex(other.index.union(base.index)).ffill().reindex(base.index)


def to_month_avg(s: pd.Series) -> pd.Series:
    s = clean(s)
    out = s.resample("MS").mean()
    return out.dropna()


def percentile_rank(s: pd.Series, value: float | None = None) -> float | None:
    """Share of history (in %) at or below `value` (latest by default)."""
    s = clean(s)
    if s.empty:
        return None
    v = s.iloc[-1] if value is None else value
    return float((s <= v).mean() * 100.0)


def zscore(s: pd.Series) -> float | None:
    s = clean(s)
    if len(s) < 3 or s.std(ddof=0) == 0:
        return None
    return float((s.iloc[-1] - s.mean()) / s.std(ddof=0))


def range_52w(s: pd.Series) -> dict[str, float] | None:
    s = clean(s)
    if s.empty:
        return None
    window = s[s.index > s.index[-1] - pd.DateOffset(weeks=52)]
    lo, hi = float(window.min()), float(window.max())
    pos = 0.5 if hi == lo else (float(s.iloc[-1]) - lo) / (hi - lo)
    return {"low": lo, "high": hi, "position": pos}


def sahm_rule(unrate: pd.Series) -> pd.Series:
    """3-month average unemployment minus its minimum over the prior 12 months."""
    u = clean(unrate)
    avg3 = u.rolling(3).mean()
    prior_min = avg3.shift(1).rolling(12, min_periods=12).min()
    return (avg3 - prior_min).dropna()
