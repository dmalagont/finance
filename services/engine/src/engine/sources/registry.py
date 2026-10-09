from __future__ import annotations

import httpx

from ..config import Settings
from .base import Fetcher
from .fred import FredFetcher
from .norges_bank import NorgesBankFetcher
from .ssb import SsbFetcher
from .yahoo import YahooFetcher


def build_fetchers(cfg: Settings, client: httpx.Client) -> dict[str, Fetcher]:
    return {
        "fred": FredFetcher(client, cfg.fred_api_key),
        "norges_bank": NorgesBankFetcher(client),
        "ssb": SsbFetcher(client),
        "yahoo": YahooFetcher(client),
    }
