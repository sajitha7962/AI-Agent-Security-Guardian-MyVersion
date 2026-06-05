from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AgentBase(BaseModel):
    name: str
    role: str
    status: str = "active"   # active | monitored | restricted


class AgentCreate(AgentBase):
    pass


class AgentOut(AgentBase):
    id: str
    trust: int = 100
    violations: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TrustScoreOut(BaseModel):
    agent_id: str
    score: int
    label: str              # TRUSTED | MODERATE | CAUTION | UNTRUSTED
    total_actions: int
    violations: int
    factors: dict
    computed_at: str


class SecurityIncident(BaseModel):
    id: str
    severity: str           # critical | high | medium | low
    title: str
    agent: str
    time: str
    status: str             # active | investigating | contained | resolved


class ComplianceReport(BaseModel):
    framework: str
    score: int
    last_assessed: Optional[datetime] = None
    findings: list[str] = []
