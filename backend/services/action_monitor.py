"""
Action Monitor Service — evaluates whether an agent action should be
ALLOWED, WARNED, or BLOCKED based on policies and risk scoring.
"""
from datetime import datetime
from database.mongodb import get_db
from services.risk_engine import calculate_risk, score_to_decision

# Static action metadata (mirrors frontend constants.js)
ACTION_META = {
    "read_email":     {"label": "Read Email",      "risk": 20},
    "delete_file":    {"label": "Delete File",     "risk": 70},
    "send_email":     {"label": "Send Email",      "risk": 55},
    "transfer_money": {"label": "Transfer Money",  "risk": 90},
    "access_db":      {"label": "Access Database", "risk": 65},
    "modify_crm":     {"label": "Modify CRM",      "risk": 45},
    "open_website":   {"label": "Open Website",    "risk": 30},
    "execute_tool":   {"label": "Execute Tool",    "risk": 60},
}

POLICY_ACTION_MAP = {
    "read_email":     "block_email",
    "send_email":     "block_email",
    "delete_file":    "block_file_del",
    "transfer_money": "block_payment",
    "access_db":      "block_db_write",
    "modify_crm":     "warn_crm",
    "open_website":   "warn_external",
}


async def evaluate_action(action_id: str, context: str, agent_id: str | None = None) -> dict:
    """Evaluate an agent action against policies and risk scoring."""
    meta = ACTION_META.get(action_id)
    if not meta:
        return {"error": f"Unknown action: {action_id}"}

    db = get_db()

    # Load active policies from DB
    active_policies = await db.policies.find({"enabled": True}).to_list(length=100)
    active_ids = {p["id"] for p in active_policies}

    context_risk   = calculate_risk(context)
    mapped_policy  = POLICY_ACTION_MAP.get(action_id)
    policy_blocked = mapped_policy and mapped_policy in active_ids
    policy_name    = None

    if policy_blocked:
        pol = next((p for p in active_policies if p["id"] == mapped_policy), None)
        policy_name = pol["label"] if pol else mapped_policy

    combined = min(meta["risk"] * 0.6 + context_risk.score * 0.4, 100.0)
    decision = score_to_decision(combined, meta["risk"], policy_blocked)

    # Persist to audit_logs
    await db.audit_logs.insert_one({
        "prompt":    context[:200],
        "action":    meta["label"],
        "score":     round(combined, 1),
        "decision":  decision,
        "threat":    context_risk.threats[0].type if context_risk.threats else "None",
        "agent_id":  agent_id,
        "timestamp": datetime.utcnow(),
    })

    return {
        "action_id":      action_id,
        "action_label":   meta["label"],
        "decision":       decision,
        "risk_score":     round(combined, 1),
        "context_score":  context_risk.score,
        "policy_blocked": policy_name,
        "threats":        [{"type": t.type, "score": t.score} for t in context_risk.threats],
    }
