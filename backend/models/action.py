from pydantic import BaseModel, Field
from typing import Optional


class ActionRequest(BaseModel):
    action_id: str
    context: str = Field(default="", max_length=5000)
    agent_id: Optional[str] = None


class ThreatItem(BaseModel):
    type: str
    score: int


class ActionResult(BaseModel):
    action_id:     str
    action_label:  str
    decision:      str
    risk_score:    float
    context_score: float
    policy_blocked: Optional[str] = None
    threats:       list[ThreatItem]
