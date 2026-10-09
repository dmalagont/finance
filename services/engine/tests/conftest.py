"""Shared fixtures. All series here are SYNTHETIC test data, not market values."""

from __future__ import annotations

import datetime as dt

import numpy as np
import pandas as pd
import pytest

from engine.catalog import Catalog, SeriesDef, load_catalog
from engine.config import ROOT


@pytest.fixture(scope="session")
def catalog() -> Catalog:
    return load_catalog(ROOT / "catalog" / "series.yaml")


def synthetic(series: SeriesDef, end: dt.date, years: int = 30, seed: int = 0) -> pd.DataFrame:
    """A smooth random walk at the series' frequency, positive, labelled synthetic."""
    freq = {"D": "B", "W": "W-WED", "M": "MS", "Q": "QS", "A": "YS"}[series.frequency]
    idx = pd.date_range(
        end=pd.Timestamp(end), periods={"B": 252, "W-WED": 52, "MS": 12, "QS": 4, "YS": 1}[freq] * years, freq=freq
    )
    rng = np.random.default_rng(abs(hash(series.id)) % 2**32 + seed)
    walk = 100 + np.cumsum(rng.normal(0, 1, len(idx)))
    return pd.DataFrame({"obs_date": idx.date, "value": walk, "realtime_start": end})


class FakeFetcher:
    """Serves synthetic frames; series ids in `fail` raise a SourceError."""

    def __init__(self, source_id: str, end: dt.date, fail: set[str] | None = None):
        self.source_id = source_id
        self.end = end
        self.fail = fail or set()

    def fetch(self, series: SeriesDef, start: str) -> pd.DataFrame:
        from engine.sources.base import SourceError, normalise

        if series.id in self.fail or series.source in self.fail:
            raise SourceError("synthetic failure")
        return normalise(synthetic(series, self.end))
