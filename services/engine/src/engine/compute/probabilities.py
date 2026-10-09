"""Model probabilities.

US recession within 12 months, from the 10y–3m Treasury spread, using the probit form the
New York Fed publishes: P = Φ(α + β · spread), α = −0.5333, β = −0.6330, spread = monthly
average of the 10y minus 3m yield in percentage points. Verify the coefficients against
the NY Fed's current methodology page before relying on the output.
"""

from __future__ import annotations

import datetime as dt
import math
from collections.abc import Callable

import pandas as pd

from ..store.base import Estimate
from . import transforms as tf

ALPHA, BETA = -0.5333, -0.6330


def norm_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def recession_probability(spread_pp: float) -> float:
    return norm_cdf(ALPHA + BETA * spread_pp)


def model_estimates(get: Callable[[str], pd.Series], as_of: dt.date) -> list[Estimate]:
    out: list[Estimate] = []
    spread = tf.to_month_avg(get("t10y3m"))
    if not spread.empty:
        month = spread.index[-1]
        p = recession_probability(float(spread.iloc[-1]))
        out.append(
            Estimate(
                question_id="us-recession-12m",
                question="US recession within 12 months",
                source="model",
                p=p,
                as_of=as_of,
                method="NY Fed-style probit on 10y–3m spread (monthly avg)",
                details={
                    "spread_pp": float(spread.iloc[-1]),
                    "spread_month": month.date().isoformat(),
                    "alpha": ALPHA,
                    "beta": BETA,
                },
                horizon_days=365,
            )
        )
    return out
