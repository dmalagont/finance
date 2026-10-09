"""Council reads and posture v0 — rule-based, fully explainable.

Each member's score (1 supportive … 5 risky) is the average of the states of the
indicators that member reads (calm 1, watch 3, alert 5), rounded half-up. A member with fewer than half
of their indicators available is INCOMPLETE, never calm. Munger is the red team and has
no automatic score. Posture maps the average member score onto five steps; the reasons
are the two most cautious members plus the most supportive dissenter.
"""

from __future__ import annotations

import datetime as dt
import statistics

from ..store.base import CouncilRead, Posture, Reading
from .indicators import INDICATORS

METHOD = "council-v0: mean of indicator states (calm 1, watch 3, alert 5), rounded half-up; ≥50% coverage required"
POSTURE_METHOD = (
    "posture-v0: mean member score → ≤1.8 Aggressive, ≤2.6 Leaning in, ≤3.4 Neutral, ≤4.2 Cautious, else Defensive"
)
STATE_SCORE = {"calm": 1.0, "watch": 3.0, "alert": 5.0}
MEMBERS = [
    "dalio",
    "druckenmiller",
    "marks",
    "buffett-greenblatt",
    "taleb-spitznagel",
    "tudor-jones",
    "bernstein-bogle",
]
STEPS = ["Defensive", "Cautious", "Neutral", "Leaning in", "Aggressive"]


def score_state(score: int) -> str:
    return "calm" if score <= 2 else "watch" if score == 3 else "alert"


def council_reads(readings: dict[str, Reading], as_of: dt.date) -> list[CouncilRead]:
    reads: list[CouncilRead] = []
    for m in MEMBERS:
        ids = [i.id for i in INDICATORS if m in i.members]
        usable = [
            readings[i]
            for i in ids
            if i in readings and readings[i].state in STATE_SCORE and readings[i].status != "error"
        ]
        drivers = [{"indicator": r.indicator_id, "state": r.state, "status": r.status} for r in usable]
        if not ids or len(usable) < max(1, len(ids) / 2):
            reads.append(
                CouncilRead(
                    m, as_of, None, "incomplete", f"{len(usable)} of {len(ids)} indicators available", drivers, METHOD
                )
            )
            continue
        raw = statistics.fmean(STATE_SCORE[r.state] for r in usable)
        score = max(1, min(5, int(raw + 0.5)))  # half-up; round() is half-to-even
        alerts = [r.indicator_id for r in usable if r.state == "alert"]
        watch = [r.indicator_id for r in usable if r.state == "watch"]
        if alerts:
            text = f"{len(alerts)} of {len(usable)} on alert: {', '.join(alerts[:3])}"
        elif watch:
            text = f"{len(watch)} of {len(usable)} on watch: {', '.join(watch[:3])}"
        else:
            text = f"All {len(usable)} indicators calm"
        reads.append(CouncilRead(m, as_of, score, score_state(score), text, drivers, METHOD))
    reads.append(
        CouncilRead("munger", as_of, None, "incomplete", "Red team: audits decisions in the journal", [], "role")
    )
    return reads


def posture(reads: list[CouncilRead], as_of: dt.date) -> Posture:
    scored = [r for r in reads if r.score is not None]
    complete = len(scored) >= len(MEMBERS) - 1
    if not scored:
        return Posture(as_of, None, [], None, False, POSTURE_METHOD)
    avg = statistics.fmean(r.score for r in scored)
    level = 4 if avg <= 1.8 else 3 if avg <= 2.6 else 2 if avg <= 3.4 else 1 if avg <= 4.2 else 0
    by_risk = sorted(scored, key=lambda r: r.score, reverse=True)
    reasons = [{"member": r.member_id, "state": r.state, "why": r.read} for r in by_risk[:2]]
    dissent = by_risk[-1]
    if dissent.score < by_risk[0].score:
        reasons.append({"member": dissent.member_id, "state": dissent.state, "why": f"{dissent.read} — the dissent"})
    spread = statistics.pstdev(r.score for r in scored) if len(scored) > 1 else 0.0
    return Posture(as_of, level if complete else None, reasons, spread, complete, POSTURE_METHOD)
