from __future__ import annotations

import datetime as dt
from typing import Protocol

import httpx
import pandas as pd

from ..catalog import SeriesDef

COLUMNS = ["obs_date", "value", "realtime_start"]


class SourceError(RuntimeError):
    """A source failed or returned something we could not parse."""


class Fetcher(Protocol):
    source_id: str

    def fetch(self, series: SeriesDef, start: str) -> pd.DataFrame: ...


def normalise(df: pd.DataFrame, vintage: dt.date | None = None) -> pd.DataFrame:
    """Coerce to obs_date (date), value (float or NaN), realtime_start (date)."""
    out = df.copy()
    out["obs_date"] = pd.to_datetime(out["obs_date"]).dt.date
    out["value"] = pd.to_numeric(out["value"], errors="coerce")
    if "realtime_start" not in out or out["realtime_start"].isna().all():
        out["realtime_start"] = vintage or dt.date.today()
    else:
        out["realtime_start"] = pd.to_datetime(out["realtime_start"]).dt.date
    out = out[COLUMNS].drop_duplicates(subset=["obs_date", "realtime_start"], keep="last")
    return out.sort_values(["obs_date", "realtime_start"]).reset_index(drop=True)


def get(client: httpx.Client, url: str, **kwargs) -> httpx.Response:
    try:
        r = client.get(url, **kwargs)
    except httpx.HTTPError as e:  # network, DNS, timeout
        raise SourceError(f"{type(e).__name__}: {e}") from e
    if r.status_code >= 400:
        raise SourceError(f"HTTP {r.status_code} from {r.request.url.host}: {r.text[:200]}")
    return r
