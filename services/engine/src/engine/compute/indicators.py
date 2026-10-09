"""Indicator definitions. Ids match the web app's registry (apps/web/src/lib/data/indicators.ts).

Each indicator turns one or more source series into a single series. Indicators whose
inputs are not ingested yet (e.g. GDPNow, CAPE, MOVE) are listed in PENDING so the web app
can show them as incomplete rather than guess.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field

import pandas as pd

from ..store.base import IndicatorMeta, ThresholdDef
from . import transforms as tf

Get = Callable[[str], pd.Series]


@dataclass(frozen=True)
class IndicatorDef:
    id: str
    name: str
    panel: str
    unit: str
    frequency: str
    risk_when: str
    inputs: tuple[str, ...]
    compute: Callable[[Get], pd.Series]
    method: str
    threshold: ThresholdDef | None = None
    notes: str | None = None
    members: tuple[str, ...] = field(default_factory=tuple)

    def meta(self) -> IndicatorMeta:
        return IndicatorMeta(
            self.id,
            self.name,
            self.panel,
            self.unit,
            self.frequency,
            self.risk_when,
            list(self.inputs),
            self.method,
            self.notes,
        )


def direct(series_id: str, scale: float = 1.0) -> Callable[[Get], pd.Series]:
    return lambda get: tf.clean(get(series_id)) * scale


def yoy(series_id: str, freq: str) -> Callable[[Get], pd.Series]:
    return lambda get: tf.yoy_pct(get(series_id), freq).dropna()


def net_liquidity(get: Get) -> pd.Series:
    """WALCL (USD mn) − WTREGEN (USD bn) − RRPONTSYD (USD bn), in USD tn, on WALCL dates."""
    walcl = tf.clean(get("walcl")) / 1e6
    tga = tf.asof_align(walcl, get("wtregen")) / 1e3
    rrp = tf.asof_align(walcl, get("rrpontsyd")) / 1e3
    return (walcl - tga - rrp.fillna(0)).dropna()


def real_policy_rate(get: Get) -> pd.Series:
    ff = tf.to_month_avg(get("dff"))
    core = tf.yoy_pct(get("pcepilfe"), "M")
    return (ff - core.reindex(ff.index)).dropna()


def buffett_indicator(get: Get) -> pd.Series:
    """Nonfinancial corporate equities market value (USD mn) / nominal GDP (USD bn, saar), in %."""
    eq = tf.clean(get("ncbeilq027s")) / 1e3
    gdp = tf.clean(get("gdp"))
    return (eq / gdp.reindex(eq.index) * 100).dropna()


def pct(
    watch: float, alert: float, direction: str, note: str = "default percentile thresholds"
) -> Callable[[str], ThresholdDef]:
    return lambda iid: ThresholdDef(iid, "percentile", watch, alert, direction, True, note)


def lvl(watch: float, alert: float, direction: str, note: str) -> Callable[[str], ThresholdDef]:
    return lambda iid: ThresholdDef(iid, "level", watch, alert, direction, True, note)


HIGH = pct(75, 90, "higher")
LOW = pct(25, 10, "lower")
BOTH = pct(85, 95, "both", "default: far from the middle of its history in either direction")


def _d(id, name, panel, unit, freq, risk, inputs, compute, method, thr=None, notes=None, members=()):  # noqa: ANN001
    return IndicatorDef(
        id,
        name,
        panel,
        unit,
        freq,
        risk,
        tuple(inputs),
        compute,
        method,
        thr(id) if thr else None,
        notes,
        tuple(members),
    )


INDICATORS: list[IndicatorDef] = [
    # Liquidity
    _d(
        "fed-balance-sheet",
        "Fed balance sheet",
        "liquidity",
        "USD tn",
        "W",
        "lower",
        ["walcl"],
        direct("walcl", 1e-6),
        "WALCL / 1e6",
        LOW,
        members=["druckenmiller", "dalio"],
    ),
    _d(
        "us-net-liquidity",
        "US net liquidity",
        "liquidity",
        "USD tn",
        "W",
        "lower",
        ["walcl", "wtregen", "rrpontsyd"],
        net_liquidity,
        "WALCL − WTREGEN − RRPONTSYD, USD tn",
        LOW,
        members=["druckenmiller", "tudor-jones"],
    ),
    _d(
        "m2",
        "M2 money supply",
        "liquidity",
        "% y/y",
        "M",
        "lower",
        ["m2sl"],
        yoy("m2sl", "M"),
        "M2SL y/y %",
        LOW,
        members=["druckenmiller"],
    ),
    _d(
        "dxy",
        "US dollar index",
        "liquidity",
        "index",
        "D",
        "higher",
        ["dtwexbgs"],
        direct("dtwexbgs"),
        "Fed nominal broad dollar index (free stand-in for ICE DXY)",
        HIGH,
        members=["druckenmiller", "dalio"],
    ),
    _d(
        "nfci",
        "Financial conditions",
        "liquidity",
        "index",
        "W",
        "higher",
        ["nfci"],
        direct("nfci"),
        "Chicago Fed NFCI",
        lvl(0.0, 0.5, "higher", "zero = average conditions; 0.5 is a judgement call, adjust as needed"),
        members=["druckenmiller"],
    ),
    _d(
        "us-10y-real-yield",
        "US 10y real yield",
        "liquidity",
        "%",
        "D",
        "higher",
        ["dfii10"],
        direct("dfii10"),
        "DFII10",
        HIGH,
        members=["druckenmiller", "buffett-greenblatt"],
    ),
    # Macro
    _d(
        "us-unemployment",
        "US unemployment rate",
        "macro",
        "%",
        "M",
        "higher",
        ["unrate"],
        direct("unrate"),
        "UNRATE",
        HIGH,
        members=["dalio"],
    ),
    _d(
        "sahm-rule",
        "Sahm rule",
        "macro",
        "pp",
        "M",
        "higher",
        ["sahm"],
        direct("sahm"),
        "SAHMREALTIME",
        lvl(0.3, 0.5, "higher", "0.5 is the rule's recession signal; 0.3 is an early-warning choice"),
        members=["dalio"],
    ),
    _d(
        "jobless-claims",
        "Initial jobless claims",
        "macro",
        "k",
        "W",
        "higher",
        ["icsa"],
        direct("icsa", 1e-3),
        "ICSA / 1000",
        HIGH,
        members=["dalio"],
    ),
    _d(
        "core-pce",
        "Core PCE inflation",
        "macro",
        "% y/y",
        "M",
        "both",
        ["pcepilfe"],
        yoy("pcepilfe", "M"),
        "PCEPILFE y/y %",
        lvl(2.5, 3.5, "higher", "distance above the Fed's 2% target; adjust as needed"),
        members=["dalio"],
    ),
    _d(
        "cpi",
        "US CPI inflation",
        "macro",
        "% y/y",
        "M",
        "both",
        ["cpiaucsl"],
        yoy("cpiaucsl", "M"),
        "CPIAUCSL y/y %",
        lvl(3.0, 4.0, "higher", "judgement thresholds above the 2% target"),
        members=["dalio"],
    ),
    _d(
        "breakeven-5y",
        "5y breakeven inflation",
        "macro",
        "%",
        "D",
        "both",
        ["t5yie"],
        direct("t5yie"),
        "T5YIE",
        BOTH,
        members=["dalio"],
    ),
    _d(
        "forward-5y5y",
        "5y5y forward inflation",
        "macro",
        "%",
        "D",
        "higher",
        ["t5yifr"],
        direct("t5yifr"),
        "T5YIFR",
        HIGH,
        members=["dalio"],
    ),
    # Cycle
    _d(
        "curve-2s10s",
        "Yield curve 2s10s",
        "cycle",
        "pp",
        "D",
        "lower",
        ["t10y2y"],
        direct("t10y2y"),
        "T10Y2Y",
        lvl(0.5, 0.0, "lower", "alert when inverted (below zero)"),
        members=["dalio", "druckenmiller"],
    ),
    _d(
        "curve-3m10y",
        "Yield curve 3m10y",
        "cycle",
        "pp",
        "D",
        "lower",
        ["t10y3m"],
        direct("t10y3m"),
        "T10Y3M",
        lvl(0.5, 0.0, "lower", "alert when inverted (below zero)"),
        members=["dalio"],
    ),
    _d(
        "real-policy-rate",
        "Real policy rate",
        "cycle",
        "%",
        "M",
        "higher",
        ["dff", "pcepilfe"],
        real_policy_rate,
        "monthly avg DFF − core PCE y/y",
        HIGH,
        members=["dalio"],
    ),
    _d(
        "lending-standards",
        "Bank lending standards",
        "cycle",
        "net %",
        "Q",
        "higher",
        ["drtscilm"],
        direct("drtscilm"),
        "DRTSCILM",
        lvl(10, 30, "higher", "net share of banks tightening; judgement thresholds"),
        members=["marks", "dalio"],
    ),
    _d(
        "federal-debt-gdp",
        "Federal debt to GDP",
        "cycle",
        "% GDP",
        "Q",
        "higher",
        ["gfdegdq188s"],
        direct("gfdegdq188s"),
        "GFDEGDQ188S",
        HIGH,
        members=["dalio"],
    ),
    _d(
        "household-debt-service",
        "US household debt service",
        "cycle",
        "% income",
        "Q",
        "higher",
        ["tdsp"],
        direct("tdsp"),
        "TDSP",
        HIGH,
        members=["dalio"],
    ),
    # Value
    _d(
        "buffett-indicator",
        "Buffett indicator",
        "value",
        "% GDP",
        "Q",
        "higher",
        ["ncbeilq027s", "gdp"],
        buffett_indicator,
        "NCBEILQ027S / GDP",
        HIGH,
        members=["buffett-greenblatt"],
    ),
    _d(
        "hy-effective-yield",
        "High-yield effective yield",
        "value",
        "%",
        "D",
        "lower",
        ["hy_yield"],
        direct("hy_yield"),
        "BAMLH0A0HYM2EY",
        LOW,
        members=["marks"],
    ),
    # Stress
    _d(
        "hy-oas",
        "High-yield credit spread",
        "stress",
        "%",
        "D",
        "higher",
        ["hy_oas"],
        direct("hy_oas"),
        "BAMLH0A0HYM2",
        HIGH,
        members=["marks", "taleb-spitznagel", "druckenmiller"],
    ),
    _d(
        "ig-oas",
        "Investment-grade spread",
        "stress",
        "%",
        "D",
        "higher",
        ["ig_oas"],
        direct("ig_oas"),
        "BAMLC0A0CM",
        HIGH,
        members=["marks"],
    ),
    _d(
        "ccc-spread",
        "CCC spread",
        "stress",
        "%",
        "D",
        "higher",
        ["ccc_oas"],
        direct("ccc_oas"),
        "BAMLH0A3HYC",
        HIGH,
        members=["marks"],
    ),
    _d(
        "vix",
        "VIX",
        "stress",
        "index",
        "D",
        "higher",
        ["vixcls"],
        direct("vixcls"),
        "VIXCLS",
        HIGH,
        members=["taleb-spitznagel", "marks"],
    ),
    _d(
        "stlfsi",
        "Financial stress index",
        "stress",
        "index",
        "W",
        "higher",
        ["stlfsi4"],
        direct("stlfsi4"),
        "STLFSI4",
        lvl(0.0, 1.0, "higher", "zero = normal stress; 1.0 is a judgement call"),
        members=["marks"],
    ),
    # Norway
    _d(
        "nb-policy-rate",
        "Norges Bank policy rate",
        "norway",
        "%",
        "D",
        "both",
        ["nb_policy_rate"],
        direct("nb_policy_rate"),
        "Norges Bank policy rate",
        BOTH,
        members=["bernstein-bogle"],
    ),
    _d(
        "nowa",
        "NOWA",
        "norway",
        "%",
        "D",
        "both",
        ["nowa"],
        direct("nowa"),
        "Norges Bank NOWA",
        BOTH,
        members=["bernstein-bogle"],
    ),
    _d(
        "i44",
        "I-44 trade-weighted krone",
        "norway",
        "index",
        "D",
        "higher",
        ["i44"],
        direct("i44"),
        "Norges Bank I-44 (higher = weaker NOK)",
        HIGH,
        members=["bernstein-bogle", "taleb-spitznagel"],
    ),
    _d(
        "eurnok",
        "EUR / NOK",
        "norway",
        "NOK",
        "D",
        "higher",
        ["eurnok"],
        direct("eurnok"),
        "Norges Bank EUR/NOK",
        HIGH,
        members=["bernstein-bogle"],
    ),
    _d(
        "usdnok",
        "USD / NOK",
        "norway",
        "NOK",
        "D",
        "both",
        ["usdnok"],
        direct("usdnok"),
        "Norges Bank USD/NOK",
        BOTH,
        members=["bernstein-bogle"],
    ),
    _d(
        "no-10y",
        "Norway 10y government yield",
        "norway",
        "%",
        "D",
        "both",
        ["no_10y"],
        direct("no_10y"),
        "Norges Bank 10y benchmark",
        BOTH,
        members=["bernstein-bogle"],
    ),
    _d(
        "cpi-ate",
        "CPI-ATE",
        "norway",
        "% y/y",
        "M",
        "both",
        ["cpi_ate"],
        direct("cpi_ate"),
        "SSB table 05327, 12-month change",
        lvl(2.5, 3.5, "higher", "distance above Norges Bank's 2% target; adjust as needed"),
        members=["bernstein-bogle"],
    ),
    _d(
        "brent",
        "Brent crude",
        "norway",
        "USD/bbl",
        "D",
        "both",
        ["brent"],
        direct("brent"),
        "Brent front month (Yahoo, unofficial)",
        BOTH,
        members=["dalio", "bernstein-bogle"],
    ),
]

# Shown in the app but not yet computable from the ingested sources.
PENDING = {
    "global-cb-balance-sheets": "needs ECB, BoJ and PBoC balance sheets",
    "price-confirmation": "needs constituent price data for breadth",
    "gdpnow": "needs Atlanta Fed GDPNow ingestion",
    "cape": "needs Shiller data",
    "equity-risk-premium": "needs index earnings yield",
    "index-concentration": "needs index constituent weights",
    "move": "ICE MOVE index is licensed",
    "stock-bond-correlation": "needs daily S&P 500 and Treasury returns",
    "mainland-gdp": "SSB national accounts table not configured yet",
    "no-unemployment": "NAV/SSB tables not configured yet",
    "no-household-debt": "SSB/Norges Bank series not configured yet",
    "no-house-prices": "Eiendom Norge has no open API",
}

BY_ID = {i.id: i for i in INDICATORS}
