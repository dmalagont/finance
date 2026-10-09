"""Parser tests against SYNTHETIC payloads shaped like each source's documented format."""

import datetime as dt
import json

import httpx
import pytest

from engine.catalog import SeriesDef
from engine.sources.base import SourceError
from engine.sources.fred import FredFetcher
from engine.sources.norges_bank import NorgesBankFetcher, parse_sdmx_csv
from engine.sources.ssb import SsbFetcher, jsonstat2_to_frame, ssb_period_to_date
from engine.sources.yahoo import parse_chart


def client(handler):
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_fred_current_vintage_and_missing_marker():
    def handler(req: httpx.Request):
        assert req.url.params["series_id"] == "T10Y3M"
        assert "realtime_start" not in req.url.params
        body = {
            "observations": [
                {"realtime_start": "2026-10-01", "realtime_end": "2026-10-01", "date": "2026-09-29", "value": "0.42"},
                {"realtime_start": "2026-10-01", "realtime_end": "2026-10-01", "date": "2026-09-30", "value": "."},
            ]
        }
        return httpx.Response(200, json=body)

    s = SeriesDef(id="t10y3m", source="fred", key="T10Y3M", name="t", frequency="D")
    df = FredFetcher(client(handler), "k").fetch(s, "2026-01-01")
    assert df["value"].iloc[0] == 0.42
    assert df["value"].isna().iloc[1]
    assert (df["realtime_start"] == dt.date.today()).all()


def test_fred_vintages_request_all_realtime():
    def handler(req: httpx.Request):
        assert req.url.params["realtime_start"] == "1776-07-04"
        body = {
            "observations": [
                {"realtime_start": "2026-02-06", "realtime_end": "2026-03-05", "date": "2026-01-01", "value": "4.0"},
                {"realtime_start": "2026-03-06", "realtime_end": "9999-12-31", "date": "2026-01-01", "value": "4.1"},
            ]
        }
        return httpx.Response(200, json=body)

    s = SeriesDef(id="unrate", source="fred", key="UNRATE", name="u", frequency="M", vintages=True)
    df = FredFetcher(client(handler), "k").fetch(s, "2026-01-01")
    assert list(df["realtime_start"]) == [dt.date(2026, 2, 6), dt.date(2026, 3, 6)]


def test_fred_requires_key_and_reports_http_errors():
    s = SeriesDef(id="x", source="fred", key="X", name="x", frequency="D")
    with pytest.raises(SourceError, match="FRED_API_KEY"):
        FredFetcher(client(lambda r: httpx.Response(200)), None).fetch(s, "2026-01-01")
    with pytest.raises(SourceError, match="HTTP 400"):
        FredFetcher(client(lambda r: httpx.Response(400, text="bad series")), "k").fetch(s, "2026-01-01")


def test_norges_bank_semicolon_csv_with_decimal_comma():
    text = "FREQ;BASE_CUR;QUOTE_CUR;TIME_PERIOD;OBS_VALUE\nB;USD;NOK;2026-10-01;10,5\nB;USD;NOK;2026-10-02;10,6\n"
    df = parse_sdmx_csv(text)
    assert list(df["value"]) == ["10.5", "10.6"]

    def handler(req: httpx.Request):
        assert req.url.path == "/api/data/EXR/B.USD.NOK.SP"
        return httpx.Response(200, text=text)

    s = SeriesDef(id="usdnok", source="norges_bank", key="EXR/B.USD.NOK.SP", name="u", frequency="D")
    out = NorgesBankFetcher(client(handler)).fetch(s, "2026-01-01")
    assert out["value"].tolist() == [10.5, 10.6]


def test_norges_bank_bad_payload():
    with pytest.raises(SourceError):
        parse_sdmx_csv("a,b\n1,2\n")


JS = {
    "id": ["ContentsCode", "Tid"],
    "size": [1, 3],
    "dimension": {
        "ContentsCode": {"category": {"index": {"KPIJustEnerg12": 0}}},
        "Tid": {"category": {"index": {"2026M01": 0, "2026M02": 1, "2026M03": 2}}},
    },
    "value": [3.1, 3.0, None],
}


def test_jsonstat2_and_periods():
    df = jsonstat2_to_frame(JS)
    assert len(df) == 3 and df["value"].iloc[1] == 3.0
    assert ssb_period_to_date("2026K3").month == 7
    assert ssb_period_to_date("2026M12").month == 12
    with pytest.raises(SourceError):
        ssb_period_to_date("2026W01")


def test_ssb_fetch_posts_selection():
    def handler(req: httpx.Request):
        body = json.loads(req.content)
        assert body["query"][0]["selection"]["values"] == ["KPIJustEnerg12"]
        return httpx.Response(200, json=JS)

    s = SeriesDef(
        id="cpi_ate",
        source="ssb",
        key="05327",
        name="c",
        frequency="M",
        params={"selection": {"ContentsCode": "KPIJustEnerg12"}},
    )
    out = SsbFetcher(client(handler)).fetch(s, "2026-01-01")
    assert out["value"].tolist()[:2] == [3.1, 3.0]


def test_yahoo_chart_parse_and_error():
    payload = {
        "chart": {
            "result": [
                {
                    "timestamp": [1790000000, 1790086400],
                    "indicators": {"quote": [{"close": [1.0, 2.0]}], "adjclose": [{"adjclose": [1.0, 2.1]}]},
                }
            ]
        }
    }
    df = parse_chart(payload)
    assert df["value"].tolist() == [1.0, 2.1]
    with pytest.raises(SourceError):
        parse_chart({"chart": {"result": None, "error": {"code": "Not Found"}}})
