from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class AuditLogEntry(BaseModel):
    prompt:    str
    action:    str
    score:     float
    decision:  str          # ALLOW | WARN | BLOCK
    threat:    str
    agent_id:  Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AuditLogOut(AuditLogEntry):
    id: str
