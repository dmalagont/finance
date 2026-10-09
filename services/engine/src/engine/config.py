from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Settings:
    database_url: str | None = field(default_factory=lambda: os.environ.get("DATABASE_URL"))
    fred_api_key: str | None = field(default_factory=lambda: os.environ.get("FRED_API_KEY"))
    api_token: str | None = field(default_factory=lambda: os.environ.get("ENGINE_API_TOKEN"))
    catalog_path: Path = field(
        default_factory=lambda: Path(os.environ.get("ENGINE_CATALOG", ROOT / "catalog" / "series.yaml"))
    )
    http_timeout: float = field(default_factory=lambda: float(os.environ.get("ENGINE_HTTP_TIMEOUT", "30")))
    history_start: str = field(default_factory=lambda: os.environ.get("ENGINE_HISTORY_START", "1990-01-01"))


def settings() -> Settings:
    return Settings()
