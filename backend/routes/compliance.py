"""
Compliance & Governance routes.
Returns framework scores, generates governance reports,
and provides AI-powered security recommendations.
"""
import os
from fastapi import APIRouter
from datetime import datetime
from models.compliance import ComplianceFramework, GovernanceReport

router = APIRouter()

FRAMEWORKS = [
    ComplianceFramework(name="SOC 2 Type II",    score=91, color="#00ff9d", controls_passed=46, controls_total=50),
    ComplianceFramework(name="ISO 27001",         score=87, color="#00d4ff", controls_passed=109, controls_total=114),
    ComplianceFramework(name="GDPR",              score=94, color="#00d4ff", controls_passed=33, controls_total=35),
    ComplianceFramework(name="HIPAA",             score=78, color="#ffb800", controls_passed=39, controls_total=50),
    ComplianceFramework(name="NIST AI RMF",       score=83, color="#00d4ff", controls_passed=50, controls_total=60),
    ComplianceFramework(name="OWASP LLM Top 10",  score=96, color="#00ff9d", controls_passed=48, controls_total=50),
]


@router.get("/frameworks")
async def list_frameworks():
    return [f.model_dump() for f in FRAMEWORKS]


@router.get("/report")
async def get_governance_report():
    overall = round(sum(f.score for f in FRAMEWORKS) / len(FRAMEWORKS))
    recs = [
        "Enable MFA for all agent authentication tokens",
        "Rotate API keys flagged as HIGH risk within 24h",
        "Review Finance Agent policy violations — trust score critically low",
        "Enable RAG document signing to prevent context poisoning",
        "Schedule quarterly OWASP LLM Top 10 penetration test",
    ]
    report = GovernanceReport(
        overall_score=overall,
        frameworks=FRAMEWORKS,
        recommendations=recs,
        risk_summary={"critical": 3, "high": 7, "medium": 12, "low": 24},
    )
    return report.model_dump()
