"""Statistics Norway (SSB) PxWebApi v0, JSON-stat2.

POST https://data.ssb.no/api/v0/en/table/{table} with a query body selecting dimension
values; the response is JSON-stat2. Time codes look like 2024M01, 2024K1 (quarter) or 2024.
"""

from __future__ import annotations

import itertools
import re

import httpx
import pandas as pd

from ..catalog import SeriesDef
from .base import SourceError, normalise

BASE = "https://data.ssb.no/api/v0/en/table"


def jsonstat2_to_frame(js: dict) -> pd.DataFrame:
    """Flatten a JSON-stat2 dataset into one row per cell with a column per dimension."""
    ids: list[str] = js["id"]
    sizes: list[int] = js["size"]
    dims = js["dimension"]
    codes = []
    for d in ids:
        index = dims[d]["category"]["index"]
        ordered = sorted(index, key=index.get) if isinstance(index, dict) else list(index)
        codes.append(ordered)
    if [len(c) for c in codes] != sizes:
        raise SourceError("JSON-stat2: dimension sizes do not match category counts")
    values = js["value"]
    if isinstance(values, dict):  # sparse form
        dense = [None] * (int(pd.Series(sizes).prod()))
        for k, v in values.items():
            dense[int(k)] = v
        values = dense
    rows = [dict(zip(ids, combo, strict=True)) for combo in itertools.product(*codes)]
    df = pd.DataFrame(rows)
    df["value"] = values
    return df


def ssb_period_to_date(code: str) -> pd.Timestamp:
    """2024M01 → 2024-01-01, 2024K3 → 2024-07-01, 2024 → 2024-01-01."""
    if m := re.fullmatch(r"(\d{4})M(\d{2})", code):
        return pd.Timestamp(int(m[1]), int(m[2]), 1)
    if m := re.fullmatch(r"(\d{4})K(\d)", code):
        return pd.Timestamp(int(m[1]), (int(m[2]) - 1) * 3 + 1, 1)
    if re.fullmatch(r"\d{4}", code):
        return pd.Timestamp(int(code), 1, 1)
    raise SourceError(f"SSB: unknown period code {code}")


class SsbFetcher:
    source_id = "ssb"

    def __init__(self, client: httpx.Client):
        self.client = client

    def fetch(self, series: SeriesDef, start: str) -> pd.DataFrame:
        selection: dict[str, str | list[str]] = series.params.get("selection", {})
        query = [
            {"code": code, "selection": {"filter": "item", "values": [v] if isinstance(v, str) else v}}
            for code, v in selection.items()
        ]
        body = {"query": query, "response": {"format": "json-stat2"}}
        try:
            r = self.client.post(f"{BASE}/{series.key}", json=body)
        except httpx.HTTPError as e:
            raise SourceError(f"{type(e).__name__}: {e}") from e
        if r.status_code >= 400:
            raise SourceError(f"HTTP {r.status_code} from SSB table {series.key}: {r.text[:200]}")
        df = jsonstat2_to_frame(r.json())
        time_dim = series.params.get("time_dimension", "Tid")
        if time_dim not in df:
            raise SourceError(f"SSB: no time dimension {time_dim} in {list(df.columns)}")
        other = [c for c in df.columns if c not in (time_dim, "value")]
        for c in other:  # every non-time dimension must be fixed to one value
            if df[c].nunique() > 1:
                raise SourceError(f"SSB {series.key}: dimension {c} not fixed by selection ({df[c].nunique()} values)")
        out = pd.DataFrame({"obs_date": df[time_dim].map(ssb_period_to_date), "value": df["value"]})
        out = out[out["obs_date"] >= pd.Timestamp(start)]
        return normalise(out)
