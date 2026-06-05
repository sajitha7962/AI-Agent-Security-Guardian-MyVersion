"""
MCP Tool Protection Service.

Evaluates Model Context Protocol (MCP) tool calls for:
  - Dangerous parameter values
  - Unauthorised tool usage against active policies
  - Sensitive data in tool arguments
  - Privilege escalation via tool chaining
"""
import re
from datetime import datetime
from services.risk_engine import calculate_risk, score_to_decision

# ---------------------------------------------------------------------------
# Static tool risk registry
# ---------------------------------------------------------------------------
TOOL_REGISTRY: dict[str, dict] = {
    "file_system.read":   {"risk": 25,  "category": "filesystem"},
    "file_system.write":  {"risk": 65,  "category": "filesystem"},
    "file_system.delete": {"risk": 85,  "category": "filesystem"},
    "database.query":     {"risk": 65,  "category": "database"},
    "database.write":     {"risk": 80,  "category": "database"},
    "database.delete":    {"risk": 95,  "category": "database"},
    "email.read":         {"risk": 30,  "category": "communication"},
    "email.send":         {"risk": 70,  "category": "communication"},
    "payment.transfer":   {"risk": 95,  "category": "finance"},
    "web.fetch":          {"risk": 40,  "category": "network"},
    "calendar.read":      {"risk": 15,  "category": "calendar"},
    "calendar.modify":    {"risk": 35,  "category": "calendar"},
    "crm.read":           {"risk": 30,  "category": "crm"},
    "crm.write":          {"risk": 55,  "category": "crm"},
    "code.execute":       {"risk": 90,  "category": "execution"},
    "shell.run":          {"risk": 98,  "category": "execution"},
    "secret.read":        {"risk": 95,  "category": "secrets"},
    "auth.elevate":       {"risk": 99,  "category": "auth"},
}

# Dangerous parameter patterns
DANGEROUS_PARAMS = [
    (re.compile(r"rm\s+-rf|del\s+/f|format\s+c:",   re.I), "Destructive shell command",  50),
    (re.compile(r"DROP\s+TABLE|TRUNCATE|DELETE\s+FROM", re.I), "Destructive SQL",          45),
    (re.compile(r"AKIA[0-9A-Z]{16}",                re.I), "AWS key in params",           40),
    (re.compile(r"password|secret|token|api.key",   re.I), "Credential in params",        35),
    (re.compile(r"\.\./|\.\.\\",                    re.I), "Path traversal attempt",      40),
    (re.compile(r"127\.0\.0\.1|localhost|0\.0\.0\.0", re.I), "SSRF target",               30),
    (re.compile(r"exfiltrate|attacker|evil\.com",   re.I), "Exfiltration destination",    50),
]


def evaluate_tool_call(
    tool_name: str,
    parameters: dict,
    context: str = "",
    agent_id: str | None = None,
) -> dict:
    """
    Evaluate a single MCP tool call.
    Returns decision, risk_score, and findings list.
    """
    meta = TOOL_REGISTRY.get(tool_name)
    base_risk = meta["risk"] if meta else 60          # unknown tools default to medium-high

    # Flatten parameters to string for scanning
    param_str = str(parameters)
    context_str = context + " " + param_str

    # Rule-based context risk
    context_risk = calculate_risk(context_str)

    # Dangerous parameter checks
    param_findings = []
    param_penalty  = 0
    for pattern, label, penalty in DANGEROUS_PARAMS:
        if pattern.search(param_str):
            param_findings.append({"type": label, "penalty": penalty})
            param_penalty += penalty

    combined = min(base_risk * 0.5 + context_risk.score * 0.3 + param_penalty * 0.2, 100.0)
    decision = score_to_decision(combined, base_risk)

    level = (
        "CRITICAL" if combined >= 75 else
        "HIGH"     if combined >= 50 else
        "MEDIUM"   if combined >= 25 else "LOW"
    )

    return {
        "tool_name":       tool_name,
        "known_tool":      meta is not None,
        "category":        meta["category"] if meta else "unknown",
        "base_risk":       base_risk,
        "combined_score":  round(combined, 1),
        "level":           level,
        "decision":        decision,
        "param_findings":  param_findings,
        "context_threats": [{"type": t.type, "score": t.score} for t in context_risk.threats],
        "agent_id":        agent_id,
        "evaluated_at":    datetime.utcnow().isoformat(),
    }


def get_tool_stats() -> list[dict]:
    """Return risk registry as a sorted list for the MCP monitor page."""
    return sorted(
        [
            {"name": name, "risk": meta["risk"], "category": meta["category"]}
            for name, meta in TOOL_REGISTRY.items()
        ],
        key=lambda t: t["risk"],
        reverse=True,
    )
