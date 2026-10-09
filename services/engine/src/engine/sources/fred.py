"""FRED / ALFRED client.

Observations endpoint: https://api.stlouisfed.org/fred/series/observations
With realtime_start/realtime_end spanning all time, FRED returns every vintage (ALFRED),
each row carrying the realtime window in which that value was the published one.
"""

from __future__ import annotations

import httpx
import pandas as pd

from ..catalog import SeriesDef
from .base import SourceError, get, normalise

BASE = "https://api.stlouisfed.org/fred/series/observations"


class FredFetcher:
    source_id = "fred"

    def __init__(self, client: httpx.Client, api_key: str | None):
        self.client = client
        self.api_key = api_key

    def fetch(self, series: SeriesDef, start: str) -> pd.DataFrame:
        if not self.api_key:
            raise SourceError("FRED_API_KEY is not set")
        params = {
            "series_id": series.key,
            "api_key": self.api_key,
            "file_type": "json",
            "observation_start": start,
        }
        if series.vintages:
            params |= {"realtime_start": "1776-07-04", "realtime_end": "9999-12-31"}
        data = get(self.client, BASE, params=params).json()
        obs = data.get("observations")
        if obs is None:
            raise SourceError(f"FRED: unexpected payload for {series.key}: {str(data)[:200]}")
        if not obs:
            return normalise(pd.DataFrame(columns=["obs_date", "value", "realtime_start"]))
        df = pd.DataFrame(obs).rename(columns={"date": "obs_date"})
        df["value"] = df["value"].replace(".", None)  # FRED marks missing values with "."
        if not series.vintages:
            df["realtime_start"] = None  # current vintage only: stamp with today
        return normalise(df)
