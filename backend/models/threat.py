from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class ThreatItem(BaseModel):
    type: str
    score: int


class PromptAnalysisRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10_000)


class ExplainRequest(BaseModel):
    prompt: str
    threats: list[str]
    score: int


class AnalysisResult(BaseModel):
    prompt: str
    score: int
    level: str
    color: str
    threats: list[ThreatItem]
    decision: str
    explanation: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
