import datetime as dt
import math

import pandas as pd
import pytest

from engine.compute import transforms as tf
from engine.compute.council import council_reads, posture
from engine.compute.indicators import INDICATORS, buffett_indicator, net_liquidity
from engine.compute.probabilities import recession_probability
from engine.compute.signals import classify, make_reading
from engine.store.base import Reading, ThresholdDef


def s(values, start="2020-01-01", freq="MS"):
    return pd.Series(values, index=pd.date_range(start, periods=len(values), freq=freq), dtype=float)


def test_yoy_monthly():
    x = s([100] * 12 + [110])
    assert tf.yoy_pct(x, "M").iloc[-1] == pytest.approx(10.0)


def test_sahm_rule_matches_definition():
    u = s([3.5] * 12 + [3.5, 3.9, 4.3])  # 3m avg rises to 3.9 vs prior 12m min of 3.5
    assert tf.sahm_rule(u).iloc[-1] == pytest.approx(0.4)


def test_percentile_and_range():
    x = s(list(range(1, 101)), freq="D")
    assert tf.percentile_rank(x) == 100.0
    assert tf.percentile_rank(x, 50) == 50.0
    r = tf.range_52w(x)
    assert r["position"] == 1.0


def test_change_over_uses_value_at_or_before_window():
    x = s([1, 2, 3, 4, 5], freq="W-WED")
    assert tf.change_over(x, "14D") == 2.0


def test_net_liquidity_units():
    d = pd.date_range("2026-01-07", periods=2, freq="W-WED")
    series = {
        "walcl": pd.Series([7_000_000.0, 7_100_000.0], index=d),  # USD mn
        "wtregen": pd.Series([800.0, 700.0], index=d),  # USD bn
        "rrpontsyd": pd.Series([200.0, 100.0], index=d),  # USD bn
    }
    out = net_liquidity(lambda k: series[k])
    assert out.tolist() == pytest.approx([6.0, 6.3])  # USD tn


def test_buffett_indicator_units():
    d = pd.date_range("2026-01-01", periods=1, freq="QS")
    series = {"ncbeilq027s": pd.Series([60_000_000.0], index=d), "gdp": pd.Series([30_000.0], index=d)}
    assert buffett_indicator(lambda k: series[k]).iloc[0] == pytest.approx(200.0)


def test_classify_level_and_percentile():
    hist = s(list(range(100)), freq="D")
    assert classify(0.6, hist, ThresholdDef("x", "level", 0.3, 0.5, "higher")) == "alert"
    assert classify(-0.1, hist, ThresholdDef("x", "level", 0.5, 0.0, "lower")) == "alert"
    assert classify(0.3, hist, ThresholdDef("x", "level", 0.5, 0.0, "lower")) == "watch"
    assert classify(95, hist, ThresholdDef("x", "percentile", 75, 90, "higher")) == "alert"
    assert classify(5, hist, ThresholdDef("x", "percentile", 25, 10, "lower")) == "alert"
    assert classify(20, hist, ThresholdDef("x", "percentile", 25, 10, "lower")) == "watch"
    assert classify(50, hist, ThresholdDef("x", "percentile", 85, 95, "both")) == "calm"
    assert classify(2, hist, ThresholdDef("x", "percentile", 85, 95, "both")) == "alert"


def test_reading_staleness_and_missing():
    x = s([1.0, 2.0], start="2026-01-01", freq="D")
    r = make_reading("x", x, "D", ThresholdDef("x", "level", 5, 10, "higher"), dt.date(2026, 3, 1))
    assert r.status == "stale" and r.stale_days == 58 and r.state == "calm"
    empty = make_reading("x", pd.Series(dtype=float), "D", None, dt.date(2026, 3, 1))
    assert empty.state == "incomplete" and empty.status == "missing"
    failed = make_reading("x", pd.Series(dtype=float), "D", None, dt.date(2026, 3, 1), source_failed=True)
    assert failed.status == "error"


def test_recession_probability_known_points():
    assert recession_probability(0.0) == pytest.approx(0.5 * (1 + math.erf(-0.5333 / math.sqrt(2))))
    assert recession_probability(-1.0) > recession_probability(0.0) > recession_probability(2.0)


def _reading(i, state, status="live"):
    return Reading(i, dt.date(2026, 10, 9), 1.0, dt.date(2026, 10, 8), {}, 50.0, 0.0, None, state, status, None)


def test_council_incomplete_without_coverage_never_calm():
    reads = {r.member_id: r for r in council_reads({}, dt.date(2026, 10, 9))}
    assert all(r.state == "incomplete" for r in reads.values())
    assert posture(list(reads.values()), dt.date(2026, 10, 9)).level is None


def test_council_scores_and_posture():
    readings = {i.id: _reading(i.id, "alert") for i in INDICATORS}
    reads = council_reads(readings, dt.date(2026, 10, 9))
    scored = [r for r in reads if r.score is not None]
    assert scored and all(r.score >= 4 for r in scored)
    p = posture(reads, dt.date(2026, 10, 9))
    assert p.complete and p.level == 0  # Defensive

    calm = {i.id: _reading(i.id, "calm") for i in INDICATORS}
    p2 = posture(council_reads(calm, dt.date(2026, 10, 9)), dt.date(2026, 10, 9))
    assert p2.level == 4  # Aggressive


def test_errored_indicators_do_not_count():
    readings = {i.id: _reading(i.id, "calm", status="error") for i in INDICATORS}
    reads = council_reads(readings, dt.date(2026, 10, 9))
    assert all(r.state == "incomplete" for r in reads)
