import uuid


def new_id() -> str:
    """Generate a short unique ID string."""
    return uuid.uuid4().hex[:16]


def mongo_to_dict(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-serialisable dict."""
    if doc is None:
        return {}
    out = dict(doc)
    if "_id" in out:
        out["_id"] = str(out["_id"])
    return out
