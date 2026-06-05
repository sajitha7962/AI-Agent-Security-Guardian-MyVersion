"""
Risk Engine — deterministic rule-based threat scoring.
Mirrors the frontend riskEngine.js for server-side validation.
"""
import re
from dataclasses import dataclass


@dataclass
class ThreatResult:
    type: str
    score: int
    id: str


@dataclass
class RiskResult:
    score: int          # 0-100
    level: str          # LOW | MEDIUM | HIGH | CRITICAL
    color: str          # CSS var string
    threats: list[ThreatResult]
    decision: str       # ALLOW | WARN | BLOCK


RULES = [
    ("prompt_injection",   "Prompt Injection",    40, r"ignore\s+(all\s+)?(previous|prior)\s+(instructions?|prompt|rules|context)|forget\s+(everything|all)\s+previously"),
    ("jailbreak",          "Jailbreak",           50, r"jailbreak|do\s+anything\s+now|\bdan\b|no\s+restrictions|unrestricted\s+mode|pretend\s+you\s+(have\s+no|are\s+without|don.t\s+have)"),
    ("role_override",      "Role Override",        25, r"you\s+are\s+now|act\s+as\s+(an?\s+)?ai|new\s+persona|your\s+new\s+role|roleplay\s+as|from\s+now\s+on\s+you"),
    ("data_exfiltration",  "Data Exfiltration",   35, r"exfiltrate|send\s+.{0,30}\s+to|forward\s+.{0,30}\s+to|export\s+.{0,20}(customer|user|database|table)"),
    ("system_prompt_leak", "System Prompt Leak",  35, r"reveal\s+(your\s+)?(system\s+)?prompt|print\s+(your\s+)?(full\s+)?instructions|show\s+me\s+your\s+config"),
    ("secret_detection",   "Secret Detection",    35, r"api[_\s\-]?key|access[_\s\-]?token|bearer\s+token|aws[_\s\-]?secret|private[_\s\-]?key|database[_\s\-]?password|jwt[_\s\-]?secret"),
    ("privilege_escalation","Privilege Escalation",40,r"escalate\s+(to\s+)?admin|elevate\s+privileges?|grant\s+(me\s+)?root|sudo\s+access|bypass\s+(the\s+)?auth|override\s+permissions?"),
    ("destructive_action", "Destructive Action",  25, r"drop\s+table|rm\s+\-rf|delete\s+all|truncate\s+database|wipe\s+the|destroy\s+all\s+records"),
    ("tool_abuse",         "Tool Abuse",           20, r"call\s+the\s+tool|invoke\s+function|execute\s+command|run\s+shell"),
    ("rag_poisoning",      "RAG Poisoning",        35, r"\[system:|<system>|<\|system\|>"),
]

_compiled = [(rid, rtype, rscore, re.compile(pattern, re.IGNORECASE)) for rid, rtype, rscore, pattern in RULES]


def calculate_risk(text: str) -> RiskResult:
    threats: list[ThreatResult] = []
    total = 0

    for rule_id, rule_type, rule_score, pattern in _compiled:
        if pattern.search(text):
            threats.append(ThreatResult(type=rule_type, score=rule_score, id=rule_id))
            total += rule_score

    score = min(total, 100)
    level = "CRITICAL" if score >= 75 else "HIGH" if score >= 50 else "MEDIUM" if score >= 25 else "LOW"
    color = "var(--accent2)" if score >= 75 else "var(--warn)" if score >= 50 else "var(--accent)" if score >= 25 else "var(--accent3)"
    decision = "BLOCK" if score >= 50 else "WARN" if score >= 25 else "ALLOW"

    return RiskResult(score=score, level=level, color=color, threats=threats, decision=decision)


def score_to_decision(score: float, action_risk: int = 0, policy_blocked: bool = False) -> str:
    if policy_blocked or score >= 60 or action_risk >= 80:
        return "BLOCK"
    if score >= 30 or action_risk >= 50:
        return "WARN"
    return "ALLOW"
