import os

import pytest
from fastapi.testclient import TestClient

from engine.api import app


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("ENGINE_API_TOKEN", "secret-token")
    return TestClient(app)


def test_health_is_public(client):
    assert client.get("/health").json()["ok"] is True
    assert client.get("/ping").status_code == 200


def test_routes_need_the_token(client):
    assert client.get("/indicators").status_code == 401
    assert client.get("/indicators", headers={"Authorization": "Bearer wrong"}).status_code == 401
    r = client.get("/indicators", headers={"Authorization": "Bearer secret-token"})
    assert r.status_code == 200
    body = r.json()
    assert any(i["id"] == "hy-oas" for i in body["computed"])
    assert "cape" in body["pending"]


def test_missing_token_config_fails_closed(monkeypatch):
    monkeypatch.delenv("ENGINE_API_TOKEN", raising=False)
    assert TestClient(app).get("/indicators", headers={"Authorization": "Bearer "}).status_code == 503


def test_run_without_database_is_refused(client, monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert client.post("/run", headers={"Authorization": "Bearer secret-token"}).status_code == 503


@pytest.mark.skipif(not os.environ.get("PG_TEST_DSN"), reason="set PG_TEST_DSN to a migrated Postgres to run")
def test_run_against_postgres_survives_unreachable_sources(client, monkeypatch):
    """With no FRED key and (in CI sandboxes) no network, every source fails; the run must
    still finish, log the failures and mark readings as errors rather than inventing values."""
    monkeypatch.setenv("DATABASE_URL", os.environ["PG_TEST_DSN"])
    monkeypatch.delenv("FRED_API_KEY", raising=False)
    monkeypatch.setenv("ENGINE_HTTP_TIMEOUT", "3")
    r = client.post("/run?source=fred", headers={"Authorization": "Bearer secret-token"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ingested"] == 0
    assert all("FRED_API_KEY" in v for v in body["failed"].values())
