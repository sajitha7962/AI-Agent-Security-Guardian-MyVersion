from fastapi import APIRouter
from pydantic import BaseModel
from services.rag_protection import scan_documents

router = APIRouter()


class RAGScanRequest(BaseModel):
    documents: str
    query:     str = ""


@router.post("/scan")
async def scan_rag(req: RAGScanRequest):
    return scan_documents(req.documents, req.query)
