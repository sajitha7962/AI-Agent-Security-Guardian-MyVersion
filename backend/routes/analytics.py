from fastapi import APIRouter
from datetime import datetime, timedelta
from database.mongodb import get_db

router = APIRouter()


@router.get("/summary")
async def get_summary():
    db    = get_db()
    total = await db.audit_logs.count_documents({})
    threats = await db.audit_logs.count_documents({"decision": "BLOCK"})
    warned  = await db.audit_logs.count_documents({"decision": "WARN"})
    safe    = await db.audit_logs.count_documents({"decision": "ALLOW"})

    # Threat type breakdown
    pipeline = [
        {"$match": {"decision": "BLOCK"}},
        {"$group": {"_id": "$threat", "count": {"$sum": 1}}},
        {"$sort":  {"count": -1}},
        {"$limit": 10},
    ]
    by_type = await db.audit_logs.aggregate(pipeline).to_list(length=10)

    return {
        "total":   total,
        "threats": threats,
        "warned":  warned,
        "safe":    safe,
        "by_type": [{"type": b["_id"], "count": b["count"]} for b in by_type],
    }


@router.get("/trends")
async def get_trends():
    """Return hourly threat counts for the last 24 hours."""
    db    = get_db()
    since = datetime.utcnow() - timedelta(hours=24)

    pipeline = [
        {"$match": {"timestamp": {"$gte": since}}},
        {"$group": {
            "_id": {
                "hour": {"$hour": "$timestamp"},
                "day":  {"$dayOfMonth": "$timestamp"},
            },
            "blocked": {"$sum": {"$cond": [{"$eq": ["$decision", "BLOCK"]}, 1, 0]}},
            "total":   {"$sum": 1},
        }},
        {"$sort": {"_id.day": 1, "_id.hour": 1}},
    ]
    hourly = await db.audit_logs.aggregate(pipeline).to_list(length=24)
    return {"hourly": hourly}


@router.get("/heatmap")
async def get_heatmap():
    """Return threat type frequency as percentage of all blocked events."""
    db    = get_db()
    total = await db.audit_logs.count_documents({"decision": "BLOCK"})
    if total == 0:
        return {"heatmap": []}

    pipeline = [
        {"$match": {"decision": "BLOCK"}},
        {"$group": {"_id": "$threat", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    rows = await db.audit_logs.aggregate(pipeline).to_list(length=10)
    return {
        "heatmap": [
            {"type": r["_id"], "count": r["count"], "pct": round(r["count"] / total * 100, 1)}
            for r in rows
        ]
    }
