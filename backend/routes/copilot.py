import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

SYSTEM_PROMPT = """You are an expert AI Security Copilot for an enterprise platform called
"AI Agent Security Guardian". You help security engineers understand:
- AI agent threat vectors (prompt injection, jailbreak, data exfiltration, RAG poisoning, tool abuse, privilege escalation)
- Security policy design and best practices
- Risk scoring methodology and thresholds
- OWASP LLM Top 10 compliance
- MCP tool security and governance
- Incident response for AI security events

Be concise, technical, and actionable. Keep responses under 250 words unless depth is required."""


class Message(BaseModel):
    role:    str
    content: str


class CopilotRequest(BaseModel):
    messages: list[Message]
    context:  str = ""


@router.post("/chat")
async def chat(req: CopilotRequest):
    """Forward conversation to the configured AI provider."""

    # Build message history (cap at last 20 for token limits)
    history = req.messages[-20:]

    # Try Anthropic
    if os.getenv("ANTHROPIC_API_KEY"):
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            mapped = [
                {"role": "assistant" if m.role == "ai" else "user", "content": m.content}
                for m in history
            ]
            resp = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=600,
                system=SYSTEM_PROMPT,
                messages=mapped,
            )
            return {"response": resp.content[0].text}
        except Exception as e:
            print(f"[Copilot/Anthropic] {e}")

    # Try OpenAI
    if os.getenv("OPENAI_API_KEY"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            msgs = [{"role": "system", "content": SYSTEM_PROMPT}] + [
                {"role": "assistant" if m.role == "ai" else "user", "content": m.content}
                for m in history
            ]
            resp = client.chat.completions.create(model="gpt-4o-mini", max_tokens=600, messages=msgs)
            return {"response": resp.choices[0].message.content}
        except Exception as e:
            print(f"[Copilot/OpenAI] {e}")

    raise HTTPException(status_code=503, detail="No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.")
