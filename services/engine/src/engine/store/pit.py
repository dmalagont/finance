"""Point-in-time vintage merging.

Every observation keeps the window in which it was the published value:
[realtime_start, realtime_end], with realtime_end = None for the current vintage.
A new fetch that returns a different value for an existing date closes the old vintage
and opens a new one; an identical value is not a revision and changes nothing.
"""

from __future__ import annotations

import datetime as dt
import math

import pandas as pd

ROW = ["obs_date", "value", "realtime_start", "realtime_end"]
ONE_DAY = dt.timedelta(days=1)


def _same(a: float | None, b: float | None) -> bool:
    a_nan = a is None or (isinstance(a, float) and math.isnan(a))
    b_nan = b is None or (isinstance(b, float) and math.isnan(b))
    if a_nan or b_nan:
        return a_nan and b_nan
    return math.isclose(float(a), float(b), rel_tol=0, abs_tol=1e-12)


def merge_vintages(existing: pd.DataFrame, incoming: pd.DataFrame) -> pd.DataFrame:
    """Return the full desired set of vintage rows for one series."""
    parts = [incoming[ROW[:3]].assign(_src=1)]
    if len(existing):
        parts.insert(0, existing[ROW[:3]].assign(_src=0))
    both = pd.concat(parts, ignore_index=True)
    both["value"] = pd.to_numeric(both["value"], errors="coerce").astype(float)
    # Same (date, realtime_start): the incoming value wins (a re-fetch of the same vintage).
    both = both.sort_values(["obs_date", "realtime_start", "_src"]).drop_duplicates(
        ["obs_date", "realtime_start"], keep="last"
    )
    # Drop vintages whose value equals the previous vintage of the same date (not a revision).
    prev = both.groupby("obs_date", sort=False)["value"].shift(1)
    first = both["obs_date"].ne(both["obs_date"].shift(1))
    same = (both["value"] == prev) | (both["value"].isna() & prev.isna())
    kept = both[first | ~same].copy()
    nxt = kept.groupby("obs_date", sort=False)["realtime_start"].shift(-1)
    kept["realtime_end"] = [None if pd.isna(n) else n - ONE_DAY for n in nxt]
    kept["value"] = kept["value"].astype(object).where(kept["value"].notna(), None)
    return kept[ROW].reset_index(drop=True)


def diff_rows(existing: pd.DataFrame, desired: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Split desired rows into (inserts, updates, deletes) relative to existing rows."""
    key = ["obs_date", "realtime_start"]
    ex = existing[ROW] if len(existing) else pd.DataFrame(columns=ROW)
    m = desired.merge(ex, on=key, how="outer", suffixes=("", "_old"), indicator=True)
    inserts = m[m["_merge"] == "left_only"][ROW]
    deletes = m[m["_merge"] == "right_only"][key]
    both = m[m["_merge"] == "both"]
    changed = (
        both[
            [
                not _same(a, b) or (pd.isna(e1) != pd.isna(e2)) or (not pd.isna(e1) and e1 != e2)
                for a, b, e1, e2 in zip(
                    both["value"], both["value_old"], both["realtime_end"], both["realtime_end_old"], strict=True
                )
            ]
        ][ROW]
        if len(both)
        else pd.DataFrame(columns=ROW)
    )
    return inserts.reset_index(drop=True), changed.reset_index(drop=True), deletes.reset_index(drop=True)


def as_of_view(rows: pd.DataFrame, as_of: dt.date | None = None) -> pd.Series:
    """Values as they were known on `as_of` (current values if None), indexed by Timestamp."""
    if not len(rows):
        return pd.Series(dtype=float)
    if as_of is None:
        sel = rows[rows["realtime_end"].isna()]
    else:
        sel = rows[(rows["realtime_start"] <= as_of) & (rows["realtime_end"].isna() | (rows["realtime_end"] >= as_of))]
    s = pd.Series(sel["value"].astype(float).values, index=pd.to_datetime(sel["obs_date"]))
    return s.sort_index()
