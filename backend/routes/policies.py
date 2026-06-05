from fastapi import APIRouter, HTTPException
from datetime import datetime
from database.mongodb import get_db
from models.policy import PolicyCreate, PolicyUpdate, PolicyToggle
from utils.helpers import new_id

router = APIRouter()


@router.get("")
async def list_policies():
    db  = get_db()
    docs = await db.policies.find().sort("created_at", -1).to_list(length=200)
    for d in docs:
        d["id"] = d.get("id", str(d["_id"]))
        d.pop("_id", None)
    return docs


@router.post("")
async def create_policy(body: PolicyCreate):
    db  = get_db()
    doc = {
        **body.model_dump(),
        "id":         new_id(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await db.policies.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/{policy_id}")
async def update_policy(policy_id: str, body: PolicyUpdate):
    db     = get_db()
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    update["updated_at"] = datetime.utcnow()
    res = await db.policies.update_one({"id": policy_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    doc = await db.policies.find_one({"id": policy_id})
    doc.pop("_id", None)
    return doc


@router.patch("/{policy_id}/toggle")
async def toggle_policy(policy_id: str, body: PolicyToggle):
    db  = get_db()
    res = await db.policies.update_one(
        {"id": policy_id},
        {"$set": {"enabled": body.enabled, "updated_at": datetime.utcnow()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"id": policy_id, "enabled": body.enabled}


@router.delete("/{policy_id}")
async def delete_policy(policy_id: str):
    db  = get_db()
    res = await db.policies.delete_one({"id": policy_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"deleted": policy_id}
