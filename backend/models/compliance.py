from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ComplianceFramework(BaseModel):
    name:         str
    score:        int = Field(ge=0, le=100)
    color:        str = "#00d4ff"
    last_assessed: Optional[datetime] = None
    findings:     list[str] = []
    controls_passed: int = 0
    controls_total:  int = 0


class GovernanceReport(BaseModel):
    generated_at:  datetime = Field(default_factory=datetime.utcnow)
    overall_score: int
    frameworks:    list[ComplianceFramework]
    recommendations: list[str] = []
    risk_summary:  dict = {}
