from fastapi import APIRouter, HTTPException
from models.action import ActionRequest
from services.action_monitor import evaluate_action

router = APIRouter()


@router.post("/evaluate")
async def evaluate(req: ActionRequest):
    """Evaluate an agent action for security risk."""
    try:
        result = await evaluate_action(req.action_id, req.context, req.agent_id)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
