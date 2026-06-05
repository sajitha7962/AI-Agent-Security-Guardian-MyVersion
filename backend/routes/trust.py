from fastapi import APIRouter
from services.trust_engine import compute_trust_score

router = APIRouter()


@router.get("/{agent_id}")
async def get_trust_score(agent_id: str):
    return await compute_trust_score(agent_id)


@router.get("/{agent_id}/history")
async def get_trust_history(agent_id: str):
    """Return simulated trust score history for sparkline charts."""
    import random, math
    base = {"a1": 92, "a2": 68, "a3": 45, "a4": 81}.get(agent_id, 70)
    history = []
    for i in range(30):
        noise = math.sin(i * 0.4 + hash(agent_id) % 6) * 5
        history.append({"day": i + 1, "score": max(0, min(100, round(base + noise + random.uniform(-2, 2))))})
    return {"agent_id": agent_id, "history": history}
