"""Yahoo Finance chart endpoint (unofficial; may change or rate-limit without notice).

Kept behind the same interface so it can be swapped for a paid source (e.g. EODHD).
"""

from __future__ import annotations

import datetime as dt

import httpx
import pandas as pd

from ..catalog import SeriesDef
from .base import SourceError, get, normalise

BASE = "https://query1.finance.yahoo.com/v8/finance/chart"


def parse_chart(payload: dict) -> pd.DataFrame:
    try:
        result = payload["chart"]["result"][0]
        ts = result["timestamp"]
        quote = result["indicators"]["quote"][0]
        adj = result["indicators"].get("adjclose", [{}])[0].get("adjclose")
    except (KeyError, IndexError, TypeError) as e:
        err = (payload.get("chart") or {}).get("error")
        raise SourceError(f"Yahoo: unexpected payload ({err or e})") from e
    closes = adj or quote["close"]
    dates = [dt.datetime.fromtimestamp(t, tz=dt.UTC).date() for t in ts]
    return pd.DataFrame({"obs_date": dates, "value": closes})


class YahooFetcher:
    source_id = "yahoo"

    def __init__(self, client: httpx.Client):
        self.client = client

    def fetch(self, series: SeriesDef, start: str) -> pd.DataFrame:
        p1 = int(dt.datetime.fromisoformat(start).replace(tzinfo=dt.UTC).timestamp())
        p2 = int(dt.datetime.now(dt.UTC).timestamp())
        r = get(
            self.client,
            f"{BASE}/{series.key}",
            params={"period1": p1, "period2": p2, "interval": "1d", "events": "history"},
            headers={"User-Agent": "Mozilla/5.0 (cockpit-engine)"},
        )
        return normalise(parse_chart(r.json()))
