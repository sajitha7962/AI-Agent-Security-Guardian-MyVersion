"""
RAG Protection Service — scans retrieved documents for injected
instructions, poisoned context, and malicious embedded directives.
"""
import re
from services.risk_engine import calculate_risk

RAG_PATTERNS = [
    (r"\[SYSTEM:.*?\]",            "Injected System Prompt",   "#ff4060", "CRITICAL"),
    (r"ignore.*?instructions",     "Instruction Override",      "#ffb800", "HIGH"    ),
    (r"you\s+are\s+now",           "Role Override",             "#ffb800", "HIGH"    ),
    (r"<\|system\|>|<system>",     "System Tag Injection",      "#ff4060", "CRITICAL"),
    (r"exfiltrate|send.*?to\s+http","Exfiltration Directive",  "#ff4060", "CRITICAL"),
    (r"api[_\s-]?key|bearer\s+token","Credential Probe",       "#ffb800", "HIGH"    ),
    (r"\{\s*\"role\"\s*:\s*\"system\"","JSON Role Override",   "#ff4060", "CRITICAL"),
]

_compiled = [(re.compile(p, re.IGNORECASE | re.DOTALL), label, color, sev) for p, label, color, sev in RAG_PATTERNS]


def scan_documents(documents: str, query: str) -> dict:
    """
    Scan document content for RAG poisoning threats.
    Returns score, level, findings list with span positions.
    """
    doc_risk   = calculate_risk(documents)
    query_risk = calculate_risk(query)
    combined   = min(doc_risk.score * 0.7 + query_risk.score * 0.3, 100.0)

    findings = []
    for pattern, label, color, severity in _compiled:
        for m in pattern.finditer(documents):
            findings.append({
                "type":     label,
                "match":    m.group()[:80],
                "start":    m.start(),
                "end":      m.end(),
                "color":    color,
                "severity": severity,
            })

    level = "CRITICAL" if combined >= 75 else "HIGH" if combined >= 50 else "MEDIUM" if combined >= 25 else "LOW"

    return {
        "doc_risk":      {"score": doc_risk.score,   "level": doc_risk.level},
        "query_risk":    {"score": query_risk.score, "level": query_risk.level},
        "combined":      round(combined),
        "level":         level,
        "safe":          len(findings) == 0,
        "findings":      findings,
        "finding_count": len(findings),
    }
