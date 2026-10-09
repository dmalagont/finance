import datetime as dt

import pandas as pd

from engine.store.memory import MemoryStore
from engine.store.pit import merge_vintages

D = dt.date


def frame(rows):
    return pd.DataFrame(rows, columns=["obs_date", "value", "realtime_start"])


def test_revision_closes_old_vintage():
    store = MemoryStore()
    store.write_observations("x", frame([(D(2026, 1, 1), 1.0, D(2026, 2, 1))]), None)
    stats = store.write_observations("x", frame([(D(2026, 1, 1), 1.2, D(2026, 3, 1))]), None)
    assert stats["inserted"] == 1 and stats["updated"] == 1
    rows = store.obs["x"].sort_values("realtime_start")
    assert list(rows["value"]) == [1.0, 1.2]
    assert rows.iloc[0]["realtime_end"] == D(2026, 2, 28)
    assert pd.isna(rows.iloc[1]["realtime_end"])


def test_unchanged_value_is_not_a_revision():
    store = MemoryStore()
    store.write_observations("x", frame([(D(2026, 1, 1), 1.0, D(2026, 2, 1))]), None)
    stats = store.write_observations("x", frame([(D(2026, 1, 1), 1.0, D(2026, 3, 1))]), None)
    assert stats == {"inserted": 0, "updated": 0, "deleted": 0}


def test_as_of_returns_what_was_known_then():
    store = MemoryStore()
    store.write_observations("x", frame([(D(2026, 1, 1), 1.0, D(2026, 2, 1))]), None)
    store.write_observations("x", frame([(D(2026, 1, 1), 1.2, D(2026, 3, 1))]), None)
    assert store.series("x", D(2026, 2, 15)).iloc[0] == 1.0
    assert store.series("x", D(2026, 3, 15)).iloc[0] == 1.2
    assert store.series("x").iloc[0] == 1.2
    assert store.series("x", D(2026, 1, 15)).empty  # not yet published


def test_full_vintage_history_from_alfred():
    incoming = frame(
        [(D(2026, 1, 1), 4.0, D(2026, 2, 6)), (D(2026, 1, 1), 4.1, D(2026, 3, 6)), (D(2026, 2, 1), 4.2, D(2026, 3, 6))]
    )
    out = merge_vintages(pd.DataFrame(columns=["obs_date", "value", "realtime_start", "realtime_end"]), incoming)
    jan = out[out["obs_date"] == D(2026, 1, 1)].sort_values("realtime_start")
    assert list(jan["realtime_end"].isna()) == [False, True]
    assert len(out) == 3


def test_missing_values_are_kept_as_null():
    store = MemoryStore()
    store.write_observations("x", frame([(D(2026, 1, 1), float("nan"), D(2026, 1, 2))]), None)
    stats = store.write_observations("x", frame([(D(2026, 1, 1), float("nan"), D(2026, 1, 3))]), None)
    assert stats["inserted"] == 0
