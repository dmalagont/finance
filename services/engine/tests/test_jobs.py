import datetime as dt
import os

import pytest

from engine import jobs
from engine.compute.indicators import BY_ID, INDICATORS
from engine.store.memory import MemoryStore

from .conftest import FakeFetcher

TODAY = dt.date(2026, 10, 9)


def fetchers(fail=None):
    return {src: FakeFetcher(src, TODAY, fail) for src in ("fred", "norges_bank", "ssb", "yahoo")}


def test_every_indicator_input_is_in_the_catalog(catalog):
    for ind in INDICATORS:
        for i in ind.inputs:
            assert i in catalog.series, f"{ind.id} needs {i}"
    for extra in ("indpro", "payems", "unrate", "pcepilfe", "cpiaucsl", "t10y3m"):
        assert extra in catalog.series


def test_end_to_end_memory(catalog):
    store = MemoryStore()
    jobs.sync(store, catalog)
    res = jobs.ingest(store, catalog, fetchers(), start="1996-01-01")
    assert not res.failed and len(res.ok) == len(catalog.series)
    stats = jobs.compute(store, catalog, as_of=TODAY)
    assert stats["errors"] == {}
    assert stats["live"] == stats["total"] == len(INDICATORS)
    assert store.regime and store.regime.growth in ("up", "down")
    assert store.posture and store.posture.complete
    assert {e.question_id for e in store.estimates} == {"us-recession-12m"}
    # Re-ingesting identical data creates no new vintages.
    again = jobs.ingest(store, catalog, fetchers(), start="1996-01-01")
    assert all(v["inserted"] == 0 for v in again.ok.values())


def test_failed_source_marks_readings_error_and_council_incomplete(catalog):
    store = MemoryStore()
    jobs.sync(store, catalog)
    res = jobs.ingest(store, catalog, fetchers(fail={"norges_bank"}), start="1996-01-01")
    assert res.failed_sources(catalog) == {"norges_bank"}
    jobs.compute(store, catalog, as_of=TODAY, failed_sources=res.failed_sources(catalog))
    assert store.readings["usdnok"].status == "error"
    assert store.readings["usdnok"].state == "incomplete"
    assert store.readings["hy-oas"].status == "live"
    assert store.runs[-2]["status"] == "partial"


def test_thresholds_have_valid_shape():
    for ind in INDICATORS:
        t = ind.threshold
        assert t is not None, ind.id
        assert t.direction in ("higher", "lower", "both")
        if t.method == "percentile":
            assert 0 <= t.watch <= 100 and 0 <= t.alert <= 100
    assert BY_ID["sahm-rule"].threshold.alert == 0.5


@pytest.mark.skipif(not os.environ.get("PG_TEST_DSN"), reason="set PG_TEST_DSN to a migrated Postgres to run")
def test_end_to_end_postgres(catalog):
    from engine.store.postgres import PostgresStore

    store = PostgresStore(os.environ["PG_TEST_DSN"])
    try:
        jobs.sync(store, catalog)
        res = jobs.ingest(store, catalog, fetchers(fail={"yahoo"}), start="2016-01-01")
        assert len(res.ok) == len([s for s in catalog.series.values() if s.source != "yahoo"])
        stats = jobs.compute(store, catalog, as_of=TODAY, failed_sources=res.failed_sources(catalog))
        assert stats["errors"] == {}
        again = jobs.ingest(store, catalog, fetchers(fail={"yahoo"}), start="2016-01-01")
        assert all(v["inserted"] == 0 for v in again.ok.values())
        with store.conn.cursor() as cur:
            cur.execute("select count(*) from api.readings_latest")
            assert cur.fetchone()[0] == len(INDICATORS)
            cur.execute("select status from api.readings_latest where indicator_id = 'brent'")
            assert cur.fetchone()[0] == "error"
            cur.execute("select level, complete from api.posture_latest")
            level, complete = cur.fetchone()
            assert complete
    finally:
        store.close()
