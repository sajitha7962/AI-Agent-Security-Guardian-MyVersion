"""
Async MongoDB connection using Motor.
Call connect_db() on startup, close_db() on shutdown.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

_client = None
_db = None


async def connect_db():
    global _client, _db

    try:
        url = os.getenv(
            "MONGODB_URL",
            "mongodb://localhost:27017/guardian_db"
        )

        name = url.rstrip("/").split("/")[-1].split("?")[0]
        if not name:
            name = "guardian_db"

        _client = AsyncIOMotorClient(
            url,
            serverSelectionTimeoutMS=3000
        )

        _db = _client[name]

        await _db.threats.create_index([("created_at", -1)])
        await _db.audit_logs.create_index([("timestamp", -1)])
        await _db.policies.create_index(
            [("id", 1)],
            unique=True
        )

        print(f"[DB] Connected to MongoDB — database: {name}")

    except Exception as e:
        print(f"[WARNING] MongoDB not available: {e}")
        print("[INFO] Running in demo mode")

        _client = None
        _db = None


async def close_db():
    global _client

    if _client:
        _client.close()
        print("[DB] MongoDB connection closed")


def get_db():
    """
    Return database handle.
    Returns None when running in demo mode.
    """
    return _db


def db_available():
    return _db is not None