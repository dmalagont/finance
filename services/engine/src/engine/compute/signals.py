"""Turn an indicator series into a reading: latest value, changes, percentile, state, freshness."""

from __future__ import annotations

import datetime as dt

import pandas as pd

from ..store.base import Reading, ThresholdDef
from . import transforms as tf

# Maximum age of the latest observation (by observation date) before a series counts as
# stale. Monthly and quarterly data are published weeks after the period they cover.
MAX_AGE_DAYS = {"D": 7, "W": 14, "M": 75, "Q": 150, "A": 450}

CHANGE_WINDOWS = {
    "D": {"1w": "7D", "13w": "91D", "1y": "365D"},
    "W": {"1w": "7D", "13w": "91D", "1y": "365D"},
    "M": {"1m": "31D", "3m": "92D", "1y": "365D"},
    "Q": {"1q": "92D", "1y": "365D"},
    "A": {"1y": "365D"},
}


def classify(value: float, history: pd.Series, t: ThresholdDef) -> str:
    """calm / watch / alert from a level or percentile threshold."""
    if t.method == "level":
        if t.direction == "lower":
            if t.alert is not None and value <= t.alert:
                return "alert"
            if t.watch is not None and value <= t.watch:
                return "watch"
            return "calm"
        if t.alert is not None and value >= t.alert:
            return "alert"
        if t.watch is not None and value >= t.watch:
            return "watch"
        return "calm"
    pr = tf.percentile_rank(history, value)
    if pr is None:
        return "incomplete"
    if t.direction == "lower":
        pr = 100 - pr
    elif t.direction == "both":
        pr = 50 + abs(pr - 50)  # distance from the median, mapped onto 50..100
    if t.alert is not None and pr >= (t.alert if t.direction != "lower" else 100 - t.alert):
        return "alert"
    if t.watch is not None and pr >= (t.watch if t.direction != "lower" else 100 - t.watch):
        return "watch"
    return "calm"


def make_reading(
    indicator_id: str,
    values: pd.Series,
    frequency: str,
    threshold: ThresholdDef | None,
    as_of: dt.date,
    source_failed: bool = False,
) -> Reading:
    s = tf.clean(values)
    if s.empty:
        return Reading(
            indicator_id,
            as_of,
            None,
            None,
            {},
            None,
            None,
            None,
            "incomplete",
            "error" if source_failed else "missing",
            None,
        )
    last_date = s.index[-1].date()
    age = (as_of - last_date).days
    stale = age > MAX_AGE_DAYS[frequency]
    status = "error" if source_failed else ("stale" if stale else "live")
    value = float(s.iloc[-1])
    change = {k: tf.change_over(s, off) for k, off in CHANGE_WINDOWS[frequency].items()}
    state = classify(value, s, threshold) if threshold else "incomplete"
    return Reading(
        indicator_id=indicator_id,
        as_of=as_of,
        value=value,
        last_obs_date=last_date,
        change=change,
        percentile=tf.percentile_rank(s),
        zscore=tf.zscore(s),
        range_52w=tf.range_52w(s),
        state=state,
        status=status,
        stale_days=age if stale else None,
    )
