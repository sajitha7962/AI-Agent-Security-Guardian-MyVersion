from fastapi import APIRouter, HTTPException
from models.threat import PromptAnalysisRequest, ExplainRequest
from services.prompt_firewall import analyse_prompt, get_ai_explanation
from services.risk_engine import calculate_risk

router = APIRouter()


@router.post("/analyze")
async def analyze_prompt(req: PromptAnalysisRequest):
    """Analyse a prompt for security threats."""
    try:
        result = await analyse_prompt(req.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain")
async def explain_threat(req: ExplainRequest):
    """Generate AI explanation for a flagged prompt."""
    explanation = await get_ai_explanation(req.prompt, req.threats, req.score)
    return {"explanation": explanation}


@router.post("/quick-scan")
async def quick_scan(req: PromptAnalysisRequest):
    """Fast rule-based scan without DB persistence (for real-time UI)."""
    risk = calculate_risk(req.prompt)
    return {
        "score":    risk.score,
        "level":    risk.level,
        "color":    risk.color,
        "decision": risk.decision,
        "threats":  [{"type": t.type, "score": t.score} for t in risk.threats],
    }
