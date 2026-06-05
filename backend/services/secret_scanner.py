"""
Secret Scanner Service — detects API keys, tokens, passwords,
AWS credentials, JWTs, and other sensitive data patterns.
"""
import re

SECRET_PATTERNS = [
    ("aws_key",      "AWS Access Key",         r"AKIA[0-9A-Z]{16}",                               "#ff4060", "CRITICAL"),
    ("jwt",          "JWT Token",              r"eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+", "#ff4060", "CRITICAL"),
    ("db_conn",      "Database Connection URL",r"(mongodb(\+srv)?|postgresql|mysql|redis):\/\/[^\s]+", "#ff4060", "CRITICAL"),
    ("private_key",  "Private Key Block",      r"-----BEGIN\s+(RSA\s+|EC\s+|OPENSSH\s+)?PRIVATE\s+KEY-----", "#ff4060", "CRITICAL"),
    ("github_pat",   "GitHub PAT",             r"ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82}", "#ffb800", "HIGH"),
    ("api_key_kw",   "Generic API Key",        r"api[_\-]?key['\"\s:=]+[A-Za-z0-9_\-]{16,}",     "#ffb800", "HIGH"),
    ("bearer",       "Bearer Token",           r"bearer\s+[A-Za-z0-9_\-\.]{20,}",                "#ffb800", "HIGH"),
    ("password_kw",  "Hardcoded Password",     r"password['\"\s:=]+[^\s'\"]{8,}",                "#ffb800", "HIGH"),
    ("secret_kw",    "Secret Keyword",         r"\bsecret['\"\s:=]+[^\s'\"]{8,}",                "#ffb800", "HIGH"),
    ("email_addr",   "Email Address",          r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", "#00d4ff", "MEDIUM"),
    ("ip_addr",      "IP Address",             r"\b(?:\d{1,3}\.){3}\d{1,3}\b",                   "#00d4ff", "LOW"),
]

_compiled = [
    (sid, label, re.compile(pattern, re.IGNORECASE), color, severity)
    for sid, label, pattern, color, severity in SECRET_PATTERNS
]


def scan_secrets(text: str) -> dict:
    """Detect secrets and sensitive patterns in text."""
    findings = []
    seen     = set()

    for sid, label, pattern, color, severity in _compiled:
        for m in pattern.finditer(text):
            key = f"{sid}-{m.start()}"
            if key in seen:
                continue
            seen.add(key)
            raw = m.group()
            findings.append({
                "id":       sid,
                "label":    label,
                "match":    raw,
                "redacted": raw[:4] + "████████████" + raw[-2:] if len(raw) > 8 else "████████",
                "start":    m.start(),
                "end":      m.end(),
                "color":    color,
                "severity": severity,
            })

    findings.sort(key=lambda f: f["start"])

    critical = sum(1 for f in findings if f["severity"] == "CRITICAL")
    high     = sum(1 for f in findings if f["severity"] == "HIGH")
    medium   = sum(1 for f in findings if f["severity"] == "MEDIUM")
    low      = sum(1 for f in findings if f["severity"] == "LOW")

    overall = "CRITICAL" if critical else "HIGH" if high else "MEDIUM" if medium else "LOW" if low else "CLEAN"

    return {
        "total":    len(findings),
        "overall":  overall,
        "critical": critical,
        "high":     high,
        "medium":   medium,
        "low":      low,
        "findings": findings,
    }
