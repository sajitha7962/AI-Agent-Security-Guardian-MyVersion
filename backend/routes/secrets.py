from fastapi import APIRouter
from pydantic import BaseModel
from services.secret_scanner import scan_secrets

router = APIRouter()


class SecretScanRequest(BaseModel):
    text: str


@router.post("/scan")
async def scan(req: SecretScanRequest):
    return scan_secrets(req.text)
