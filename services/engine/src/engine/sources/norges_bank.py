"""Norges Bank open data (SDMX REST).

GET https://data.norges-bank.no/api/data/{FLOW}/{KEY}?format=csv&startPeriod=...&locale=en
The CSV carries TIME_PERIOD and OBS_VALUE columns. Catalog keys are "FLOW/KEY".
"""

from __future__ import annotations

import io

import httpx
import pandas as pd

from ..catalog import SeriesDef
from .base import SourceError, get, normalise

BASE = "https://data.norges-bank.no/api/data"


def parse_sdmx_csv(text: str) -> pd.DataFrame:
    first = text.splitlines()[0] if text else ""
    sep = ";" if first.count(";") > first.count(",") else ","
    df = pd.read_csv(io.StringIO(text), sep=sep, dtype=str)
    cols = {c.upper(): c for c in df.columns}
    if "TIME_PERIOD" not in cols or "OBS_VALUE" not in cols:
        raise SourceError(f"Norges Bank: missing TIME_PERIOD/OBS_VALUE in columns {list(df.columns)[:10]}")
    out = pd.DataFrame({"obs_date": df[cols["TIME_PERIOD"]], "value": df[cols["OBS_VALUE"]]})
    out["value"] = out["value"].str.replace(",", ".", regex=False)
    return out


class NorgesBankFetcher:
    source_id = "norges_bank"

    def __init__(self, client: httpx.Client):
        self.client = client

    def fetch(self, series: SeriesDef, start: str) -> pd.DataFrame:
        flow, _, key = series.key.partition("/")
        if not key:
            raise SourceError(f"Norges Bank key must be FLOW/KEY, got {series.key}")
        r = get(self.client, f"{BASE}/{flow}/{key}", params={"format": "csv", "startPeriod": start, "locale": "en"})
        return normalise(parse_sdmx_csv(r.text))
