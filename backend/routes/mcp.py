from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.mcp_protection import evaluate_tool_call, get_tool_stats

router = APIRouter()


class MCPEvaluateRequest(BaseModel):
    tool_name:  str
    parameters: dict = {}
    context:    str  = ""
    agent_id:   Optional[str] = None


@router.post("/evaluate")
async def evaluate(req: MCPEvaluateRequest):
    """Evaluate a single MCP tool call for security risk."""
    return evaluate_tool_call(
        tool_name=req.tool_name,
        parameters=req.parameters,
        context=req.context,
        agent_id=req.agent_id,
    )


@router.get("/tools")
async def list_tools():
    """Return the full MCP tool risk registry."""
    return get_tool_stats()
