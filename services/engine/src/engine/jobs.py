"""Jobs: ingest source series, compute indicators and council outputs."""

from __future__ import annotations

import datetime as dt
import logging
from dataclasses import dataclass, field
from typing import Any

import pandas as pd

from .catalog import Catalog
from .compute import council as council_mod
from .compute import probabilities, regime
from .compute.indicators import INDICATORS
from .compute.signals import make_reading
from .sources.base import Fetcher, SourceError
from .store.base import Reading, Store

log = logging.getLogger("engine")


@dataclass
class IngestResult:
    ok: dict[str, dict[str, int]] = field(default_factory=dict)
    failed: dict[str, str] = field(default_factory=dict)  # series_id -> error

    def failed_sources(self, catalog: Catalog) -> set[str]:
        """Sources where every attempted series failed."""
        by_source: dict[str, list[bool]] = {}
        for sid in list(self.ok) + list(self.failed):
            by_source.setdefault(catalog.series[sid].source, []).append(sid in self.ok)
        return {src for src, results in by_source.items() if not any(results)}

    def as_stats(self) -> dict[str, Any]:
        return {"ok": self.ok, "failed": self.failed, "n_ok": len(self.ok), "n_failed": len(self.failed)}


def sync(store: Store, catalog: Catalog) -> None:
    store.sync_reference(catalog, [i.meta() for i in INDICATORS], [i.threshold for i in INDICATORS if i.threshold])


def ingest(
    store: Store,
    catalog: Catalog,
    fetchers: dict[str, Fetcher],
    start: str,
    sources: set[str] | None = None,
    series_ids: set[str] | None = None,
) -> IngestResult:
    run_id = store.start_run("ingest")
    result = IngestResult()
    for s in catalog.series.values():
        if sources and s.source not in sources:
            continue
        if series_ids and s.id not in series_ids:
            continue
        try:
            df = fetchers[s.source].fetch(s, start)
            result.ok[s.id] = store.write_observations(s.id, df, run_id) | {"rows": len(df)}
            if s.check:
                log.info("confirmed series key %s (%s/%s)", s.id, s.source, s.key)
        except SourceError as e:
            result.failed[s.id] = str(e)
            log.warning("ingest %s failed: %s", s.id, e)
        except Exception as e:  # keep going: one bad series must not stop the run
            result.failed[s.id] = f"{type(e).__name__}: {e}"
            log.exception("ingest %s crashed", s.id)
    status = "ok" if not result.failed else ("error" if not result.ok else "partial")
    store.finish_run(run_id, status, result.as_stats())
    return result


def compute(
    store: Store, catalog: Catalog, as_of: dt.date | None = None, failed_sources: set[str] | None = None
) -> dict[str, Any]:
    as_of = as_of or dt.date.today()
    failed_sources = failed_sources or set()
    run_id = store.start_run("compute")
    thresholds = store.thresholds()
    readings: dict[str, Reading] = {}
    errors: dict[str, str] = {}
    cache: dict[str, Any] = {}

    def get(series_id: str):
        if series_id not in cache:
            cache[series_id] = store.series(series_id)
        return cache[series_id]

    for ind in INDICATORS:
        source_failed = any(catalog.series[i].source in failed_sources for i in ind.inputs if i in catalog.series)
        try:
            values = ind.compute(get)
        except Exception as e:
            errors[ind.id] = f"{type(e).__name__}: {e}"
            log.exception("compute %s failed", ind.id)
            values = None
        if values is not None and len(values):
            store.write_indicator_values(ind.id, values, run_id)
        readings[ind.id] = make_reading(
            ind.id,
            values if values is not None else pd.Series(dtype=float),
            ind.frequency,
            thresholds.get(ind.id, ind.threshold),
            as_of,
            source_failed=source_failed or ind.id in errors,
        )
    store.write_readings(list(readings.values()), run_id)

    reads = council_mod.council_reads(readings, as_of)
    store.write_council(reads)
    store.write_posture(council_mod.posture(reads, as_of))
    store.write_regime(regime.current_regime(get, as_of))
    store.write_estimates(probabilities.model_estimates(get, as_of))

    stats = {
        "readings": {k: {"state": r.state, "status": r.status} for k, r in readings.items()},
        "errors": errors,
        "live": sum(r.status == "live" for r in readings.values()),
        "total": len(readings),
    }
    store.finish_run(run_id, "ok" if not errors else "partial", stats)
    return stats
