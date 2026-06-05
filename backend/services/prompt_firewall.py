"""
Prompt Firewall Service — analyses prompts and persists results.
"""
import os
from datetime import datetime
from database.mongodb import get_db
from services.risk_engine import calculate_risk, RiskResult
from models.threat import AnalysisResult, ThreatItem


async def analyse_prompt(prompt: str) -> dict:
    """Run rule-based risk analysis and persist to MongoDB."""
    risk: RiskResult = calculate_risk(prompt)

    doc = {
        "prompt":     prompt,
        "score":      risk.score,
        "level":      risk.level,
        "color":      risk.color,
        "decision":   risk.decision,
        "threats":    [{"type": t.type, "score": t.score} for t in risk.threats],
        "created_at": datetime.utcnow(),
    }

    db = get_db()
    result = await db.threats.insert_one(doc)
    doc["id"] = str(result.inserted_id)

    # Also append to audit_logs
    await db.audit_logs.insert_one({
        "prompt":    prompt[:200],
        "action":    "Prompt Analysis",
        "score":     risk.score,
        "decision":  risk.decision,
        "threat":    risk.threats[0].type if risk.threats else "None",
        "timestamp": datetime.utcnow(),
    })

    return doc


async def get_ai_explanation(prompt: str, threats: list[str], score: int) -> str:
    """Call Anthropic/OpenAI to generate an explanation for a flagged prompt."""
    api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _fallback_explanation(threats, score)

    # Try Anthropic first
    if os.getenv("ANTHROPIC_API_KEY"):
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            msg = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=400,
                system=(
                    "You are an AI security analyst. Given a flagged prompt, explain in 2-3 "
                    "concise sentences: why it was flagged, what the actual danger is, and a "
                    "safe alternative phrasing. Be direct and technical."
                ),
                messages=[{
                    "role": "user",
                    "content": f'Prompt: "{prompt[:500]}"\nDetected: {", ".join(threats)}\nScore: {score}/100',
                }],
            )
            return msg.content[0].text
        except Exception as e:
            print(f"[Anthropic] Error: {e}")

    # Fallback to OpenAI
    if os.getenv("OPENAI_API_KEY"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                max_tokens=400,
                messages=[
                    {"role": "system", "content": "You are an AI security analyst. Explain why a prompt was flagged, what the danger is, and provide a safe alternative. Be concise and technical."},
                    {"role": "user",   "content": f'Prompt: "{prompt[:500]}"\nDetected: {", ".join(threats)}\nScore: {score}/100'},
                ],
            )
            return resp.choices[0].message.content
        except Exception as e:
            print(f"[OpenAI] Error: {e}")

    return _fallback_explanation(threats, score)


def _fallback_explanation(threats: list[str], score: int) -> str:
    if not threats:
        return f"This prompt received a risk score of {score}/100. No specific threat patterns were matched."
    primary = threats[0]
    return (
        f"This prompt was flagged for {primary} (score: {score}/100). "
        f"The detected pattern suggests an attempt to manipulate the AI agent's behaviour "
        f"in a potentially harmful way. Consider rephrasing to remove directive language "
        f"that overrides instructions or requests sensitive data access."
    )
