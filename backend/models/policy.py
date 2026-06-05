from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PolicyBase(BaseModel):
    label: str = Field(..., min_length=1, max_length=200)
    desc: str  = Field(default="", max_length=500)
    category: str = Field(..., pattern="^(BLOCK|WARN)$")
    enabled: bool = True


class PolicyCreate(PolicyBase):
    pass


class PolicyUpdate(BaseModel):
    label:    Optional[str]  = None
    desc:     Optional[str]  = None
    category: Optional[str]  = None
    enabled:  Optional[bool] = None


class PolicyToggle(BaseModel):
    enabled: bool


class PolicyOut(PolicyBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
