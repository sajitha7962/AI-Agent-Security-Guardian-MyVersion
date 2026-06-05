"""
AI Agent Security Guardian — FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.mongodb import connect_db, close_db
from routes import firewall, actions, policies, analytics, audit, copilot, agents, trust, rag, secrets, mcp, compliance


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="AI Agent Security Guardian",
    description="Enterprise-grade AI Agent Security Platform API",
    version="4.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(firewall.router,   prefix="/api/firewall",   tags=["Firewall"])
app.include_router(actions.router,    prefix="/api/actions",    tags=["Actions"])
app.include_router(policies.router,   prefix="/api/policies",   tags=["Policies"])
app.include_router(analytics.router,  prefix="/api/analytics",  tags=["Analytics"])
app.include_router(audit.router,      prefix="/api/audit",      tags=["Audit"])
app.include_router(copilot.router,    prefix="/api/copilot",    tags=["Copilot"])
app.include_router(agents.router,     prefix="/api/agents",     tags=["Agents"])
app.include_router(trust.router,      prefix="/api/trust",      tags=["Trust"])
app.include_router(rag.router,        prefix="/api/rag",        tags=["RAG"])
app.include_router(secrets.router,    prefix="/api/secrets",    tags=["Secrets"])
app.include_router(mcp.router,        prefix="/api/mcp",        tags=["MCP"])
app.include_router(compliance.router, prefix="/api/compliance",  tags=["Compliance"])


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "AI Agent Security Guardian", "version": "4.0.0"}
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)