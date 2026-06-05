"""
Trust Engine — computes an agent trust score (0-100) based on
violation history, average risk, and policy compliance.
"""
from datetime import datetime, timedelta
from database.mongodb import get_db


async def compute_trust_score(agent_id: str) -> dict:
    """
    Calculate trust score for a given agent from its audit log history.
    Returns score, label, factors breakdown.
    """
    db  = get_db()
    now = datetime.utcnow()
    since = now - timedelta(days=30)

    logs = await db.audit_logs.find(
        {"agent_id": agent_id, "timestamp": {"$gte": since}}
    ).to_list(length=500)

    total        = len(logs)
    blocked      = sum(1 for l in logs if l["decision"] == "BLOCK")
    warned       = sum(1 for l in logs if l["decision"] == "WARN")
    avg_risk     = sum(l["score"] for l in logs) / total if total else 0
    violation_r  = (blocked / total) if total else 0

    # Factor scores (each 0-100)
    violation_score    = max(0, 100 - violation_r * 200)
    risk_history_score = max(0, 100 - avg_risk)
    compliance_score   = max(0, 100 - (warned / total * 50 if total else 0))
    success_score      = ((total - blocked - warned) / total * 100) if total else 80

    # Weighted average
    trust = int(
        violation_score    * 0.30 +
        risk_history_score * 0.25 +
        compliance_score   * 0.25 +
        success_score      * 0.20
    )
    trust = max(0, min(100, trust))

    label = "TRUSTED" if trust >= 80 else "MODERATE" if trust >= 60 else "CAUTION" if trust >= 40 else "UNTRUSTED"

    return {
        "agent_id":   agent_id,
        "score":      trust,
        "label":      label,
        "total_actions": total,
        "violations": blocked,
        "factors": {
            "violation_score":    round(violation_score),
            "risk_history_score": round(risk_history_score),
            "compliance_score":   round(compliance_score),
            "success_score":      round(success_score),
        },
        "computed_at": now.isoformat(),
    }
