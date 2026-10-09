from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml


@dataclass(frozen=True)
class Source:
    id: str
    name: str
    url: str | None = None


@dataclass(frozen=True)
class SeriesDef:
    id: str
    source: str
    key: str
    name: str
    frequency: str
    unit: str | None = None
    params: dict[str, Any] = field(default_factory=dict)
    check: bool = False
    vintages: bool = False
    notes: str | None = None


@dataclass(frozen=True)
class Catalog:
    sources: dict[str, Source]
    series: dict[str, SeriesDef]

    def for_source(self, source: str) -> list[SeriesDef]:
        return [s for s in self.series.values() if s.source == source]


def load_catalog(path: Path) -> Catalog:
    data = yaml.safe_load(path.read_text())
    sources = {k: Source(id=k, **v) for k, v in data["sources"].items()}
    series: dict[str, SeriesDef] = {}
    for raw in data["series"]:
        s = SeriesDef(**raw)
        if s.source not in sources:
            raise ValueError(f"series {s.id}: unknown source {s.source}")
        if s.frequency not in {"D", "W", "M", "Q", "A"}:
            raise ValueError(f"series {s.id}: bad frequency {s.frequency}")
        if s.id in series:
            raise ValueError(f"duplicate series id {s.id}")
        series[s.id] = s
    return Catalog(sources=sources, series=series)
