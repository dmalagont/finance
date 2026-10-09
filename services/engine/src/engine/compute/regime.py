"""Regime model v0: is growth rising or falling, and is inflation rising or falling?

Growth score: average of standardised 6-month changes in industrial production growth,
payroll growth and (inverted) unemployment. Inflation score: average of standardised
6-month changes in core PCE and CPI inflation. Positive = rising. This is a transparent
first version, not Bridgewater's model; it measures direction, not surprises versus
expectations, which would need consensus forecasts.
"""

from __future__ import annotations

import datetime as dt
from collections.abc import Callable

import pandas as pd

from ..store.base import Regime
from . import transforms as tf

METHOD = "regime-v0: z-scored 6m changes; growth = INDPRO y/y, PAYEMS y/y, −UNRATE; inflation = core PCE y/y, CPI y/y"


def _z6(s: pd.Series) -> pd.Series:
    d = tf.clean(s).diff(6)
    return ((d - d.mean()) / d.std(ddof=0)).dropna()


def regime_history(get: Callable[[str], pd.Series]) -> pd.DataFrame:
    growth_parts = [
        _z6(tf.yoy_pct(get("indpro"), "M")),
        _z6(tf.yoy_pct(get("payems"), "M")),
        -_z6(tf.clean(get("unrate"))),
    ]
    infl_parts = [_z6(tf.yoy_pct(get("pcepilfe"), "M")), _z6(tf.yoy_pct(get("cpiaucsl"), "M"))]
    growth = pd.concat(growth_parts, axis=1, sort=True).mean(axis=1, skipna=True)
    infl = pd.concat(infl_parts, axis=1, sort=True).mean(axis=1, skipna=True)
    df = pd.concat({"growth_score": growth, "inflation_score": infl}, axis=1, sort=True).dropna()
    return df


def current_regime(get: Callable[[str], pd.Series], as_of: dt.date) -> Regime:
    df = regime_history(get)
    if df.empty:
        return Regime(as_of, None, None, None, None, {"reason": "insufficient data"}, METHOD)
    last = df.iloc[-1]
    g, i = float(last["growth_score"]), float(last["inflation_score"])
    trail = [
        {"date": d.date().isoformat(), "growth": float(r["growth_score"]), "inflation": float(r["inflation_score"])}
        for d, r in df.iloc[-12:].iterrows()
    ]
    return Regime(
        as_of=as_of,
        growth="up" if g >= 0 else "down",
        inflation="up" if i >= 0 else "down",
        growth_score=g,
        inflation_score=i,
        details={"data_through": df.index[-1].date().isoformat(), "trail": trail},
        method=METHOD,
    )
