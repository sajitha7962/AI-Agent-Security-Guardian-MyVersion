import io
import csv
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from database.mongodb import get_db

router = APIRouter()


@router.get("")
async def list_logs(
    search:   str  = Query(default=""),
    decision: str  = Query(default="ALL"),
    limit:    int  = Query(default=50,  ge=1, le=500),
    skip:     int  = Query(default=0,   ge=0),
):
    db    = get_db()
    query: dict = {}

    if decision != "ALL":
        query["decision"] = decision
    if search:
        query["$or"] = [
            {"prompt": {"$regex": search, "$options": "i"}},
            {"action": {"$regex": search, "$options": "i"}},
            {"threat": {"$regex": search, "$options": "i"}},
        ]

    total = await db.audit_logs.count_documents(query)
    docs  = (
        await db.audit_logs.find(query)
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    for d in docs:
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        if "timestamp" in d:
            d["time"] = d["timestamp"].strftime("%H:%M:%S")

    return {"total": total, "logs": docs}


@router.get("/export/csv")
async def export_csv(decision: str = Query(default="ALL"), search: str = Query(default="")):
    db    = get_db()
    query: dict = {}
    if decision != "ALL":
        query["decision"] = decision
    if search:
        query["$or"] = [
            {"prompt": {"$regex": search, "$options": "i"}},
            {"action": {"$regex": search, "$options": "i"}},
        ]

    docs = await db.audit_logs.find(query).sort("timestamp", -1).to_list(length=5000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Prompt", "Action", "Score", "Decision", "Threat"])
    for d in docs:
        ts = d.get("timestamp", "")
        writer.writerow([
            ts.isoformat() if hasattr(ts, "isoformat") else str(ts),
            d.get("prompt", ""),
            d.get("action", ""),
            d.get("score", ""),
            d.get("decision", ""),
            d.get("threat", ""),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_log.csv"},
    )
