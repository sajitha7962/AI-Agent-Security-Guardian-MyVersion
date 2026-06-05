# AI Agent Security Guardian

> Enterprise-grade AI Agent Security Platform — monitors, detects, and blocks prompt injection, jailbreaks, data exfiltration, tool abuse, and more.

---

## Quick Start

### Option 1 — Docker (Recommended)

```bash
cp .env.example .env
# Fill in your API keys in .env
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### Option 2 — Local Dev

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

---

## Project Structure

```
ai-security-guardian/
├── frontend/                  # React + Vite + TailwindCSS
│   └── src/
│       ├── components/
│       │   ├── ui/            # Reusable UI primitives
│       │   ├── charts/        # Chart components
│       │   └── layout/        # Sidebar, Topbar, Layout
│       ├── pages/             # One file per route/page
│       ├── services/          # API calls
│       ├── hooks/             # Custom React hooks
│       ├── utils/             # Risk engine, helpers
│       └── styles/            # Global CSS (your original theme)
│
└── backend/                   # FastAPI + Python
    ├── routes/                # API route handlers
    ├── models/                # Pydantic + MongoDB models
    ├── services/              # Business logic
    ├── database/              # MongoDB connection
    └── utils/                 # Helpers
```

---

## Features

| Feature | Status |
|---|---|
| Prompt Firewall | ✅ |
| Agent Action Monitor | ✅ |
| Real-Time Dashboard | ✅ |
| Execution Timeline | ✅ |
| Risk Scoring Engine | ✅ |
| Explainable Security AI | ✅ |
| Live Attack Simulator | ✅ |
| Policy Engine | ✅ |
| Audit Logs (CSV/PDF) | ✅ |
| AI Copilot | ✅ |
| Trust Score Engine | ✅ |
| MCP Tool Security | ✅ |
| RAG Security | ✅ |
| Secret Detection | ✅ |
| Multi-Agent Security | ✅ |
| SOC Analyst View | ✅ |
| Executive Dashboard | ✅ |
| Demo Mode | ✅ |
