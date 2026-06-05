from fastapi import APIRouter, HTTPException
from database.mongodb import get_db

router = APIRouter()

# Static seed agents (would be persisted in a real deployment)
SEED_AGENTS = [
    {"id": "a1", "name": "Research Agent",  "trust": 92, "role": "data-retrieval", "violations": 1, "status": "active"},
    {"id": "a2", "name": "Email Agent",     "trust": 68, "role": "communication",  "violations": 5, "status": "monitored"},
    {"id": "a3", "name": "Finance Agent",   "trust": 45, "role": "payments",       "violations": 9, "status": "restricted"},
    {"id": "a4", "name": "CRM Agent",       "trust": 81, "role": "crm",            "violations": 2, "status": "active"},
]


@router.get("")
async def list_agents():
    return SEED_AGENTS


@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    agent = next((a for a in SEED_AGENTS if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.get("/{agent_id}/events")
async def get_agent_events(agent_id: str, limit: int = 20):
    db   = get_db()
    logs = (
        await db.audit_logs.find({"agent_id": agent_id})
        .sort("timestamp", -1)
        .limit(limit)
        .to_list(length=limit)
    )
    for l in logs:
        l["id"] = str(l["_id"])
        l.pop("_id", None)
    return logs
