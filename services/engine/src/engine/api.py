"""HTTP API for the engine. Private: every route except /health needs the bearer token.

Called by the Cloudflare Worker (cron and on-demand) — never directly by browsers.
"""

from __future__ import annotations

import datetime as dt
import hmac
import logging
import threading

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException

from . import __version__, jobs
from .catalog import load_catalog
from .compute.indicators import INDICATORS, PENDING
from .config import settings

log = logging.getLogger("engine.api")
app = FastAPI(title="Cockpit engine", version=__version__, docs_url=None, redoc_url=None)
_lock = threading.Lock()


def require_token(authorization: str | None = Header(default=None)) -> None:
    token = settings().api_token
    if not token:
        raise HTTPException(503, "ENGINE_API_TOKEN not configured")
    given = (authorization or "").removeprefix("Bearer ").strip()
    if not hmac.compare_digest(given, token):
        raise HTTPException(401, "unauthorised")


@app.get("/health")
@app.get("/ping")  # container supervisor readiness check
def health() -> dict:
    return {"ok": True, "version": __version__}


@app.get("/indicators", dependencies=[Depends(require_token)])
def indicators() -> dict:
    return {
        "computed": [
            {"id": i.id, "name": i.name, "panel": i.panel, "inputs": list(i.inputs), "method": i.method}
            for i in INDICATORS
        ],
        "pending": PENDING,
    }


@app.post("/run", dependencies=[Depends(require_token)])
def run(source: str | None = None, as_of: dt.date | None = None) -> dict:
    """Sync + ingest + compute. One run at a time."""
    if not _lock.acquire(blocking=False):
        raise HTTPException(409, "a run is already in progress")
    try:
        cfg = settings()
        if not cfg.database_url:
            raise HTTPException(503, "DATABASE_URL not configured")
        from .sources.registry import build_fetchers
        from .store.postgres import PostgresStore

        catalog = load_catalog(cfg.catalog_path)
        store = PostgresStore(cfg.database_url)
        try:
            with httpx.Client(timeout=cfg.http_timeout, follow_redirects=True) as client:
                jobs.sync(store, catalog)
                res = jobs.ingest(
                    store, catalog, build_fetchers(cfg, client), cfg.history_start, sources={source} if source else None
                )
                stats = jobs.compute(store, catalog, as_of=as_of, failed_sources=res.failed_sources(catalog))
        finally:
            store.close()
        return {
            "ingested": len(res.ok),
            "failed": res.failed,
            "live": stats["live"],
            "total": stats["total"],
            "errors": stats["errors"],
        }
    finally:
        _lock.release()
