"""Command line: cockpit-engine {sync,ingest,compute,run,serve}."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import logging
import sys

import httpx

from . import jobs
from .catalog import load_catalog
from .config import settings
from .sources.registry import build_fetchers


def _store(cfg, memory: bool):
    if memory or not cfg.database_url:
        from .store.memory import MemoryStore

        if not memory:
            logging.warning("DATABASE_URL not set: using an in-memory store (nothing is saved)")
        return MemoryStore()
    from .store.postgres import PostgresStore

    return PostgresStore(cfg.database_url)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="cockpit-engine")
    p.add_argument("--memory", action="store_true", help="use an in-memory store (dry run)")
    p.add_argument("-v", "--verbose", action="store_true")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("sync", help="write sources, series, indicators and default thresholds")
    ing = sub.add_parser("ingest", help="fetch source series")
    ing.add_argument("--source", action="append", help="limit to a source (repeatable)")
    ing.add_argument("--series", action="append", help="limit to a series id (repeatable)")
    ing.add_argument("--start", default=None)
    comp = sub.add_parser("compute", help="compute indicators, readings, council, regime")
    comp.add_argument("--as-of", type=dt.date.fromisoformat, default=None)
    run = sub.add_parser("run", help="sync + ingest + compute")
    run.add_argument("--source", action="append")
    srv = sub.add_parser("serve", help="run the HTTP API")
    srv.add_argument("--port", type=int, default=8080)
    args = p.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO, format="%(levelname)s %(name)s %(message)s"
    )
    cfg = settings()

    if args.cmd == "serve":
        import uvicorn

        uvicorn.run("engine.api:app", host="0.0.0.0", port=args.port)
        return 0

    catalog = load_catalog(cfg.catalog_path)
    store = _store(cfg, args.memory)
    with httpx.Client(timeout=cfg.http_timeout, follow_redirects=True) as client:
        fetchers = build_fetchers(cfg, client)
        if args.cmd in ("sync", "run"):
            jobs.sync(store, catalog)
        if args.cmd == "sync":
            print("synced reference data")
            return 0
        failed: set[str] = set()
        if args.cmd in ("ingest", "run"):
            res = jobs.ingest(
                store,
                catalog,
                fetchers,
                start=getattr(args, "start", None) or cfg.history_start,
                sources=set(args.source) if args.source else None,
                series_ids=set(args.series) if getattr(args, "series", None) else None,
            )
            failed = res.failed_sources(catalog)
            print(json.dumps({"ingested": len(res.ok), "failed": res.failed}, indent=2))
        if args.cmd in ("compute", "run"):
            stats = jobs.compute(store, catalog, as_of=getattr(args, "as_of", None), failed_sources=failed)
            print(json.dumps({"live": stats["live"], "total": stats["total"], "errors": stats["errors"]}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
