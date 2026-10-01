"""Analysis API — return document analysis results."""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models import Document, DocumentAnalysis
from app.api.v1.auth import get_current_user_id

router = APIRouter()


@router.get("/{document_id}")
async def get_analysis(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get the full analysis for a document. User must own the document."""
    try:
        doc_uuid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID.")

    # Authorization: user must own the document
    doc_result = await db.execute(
        select(Document).where(Document.id == doc_uuid, Document.user_id == uuid.UUID(user_id))
    )
    doc = doc_result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc.status != "ready":
        return {
            "status": doc.status,
            "message": "Document is still being processed.",
            "error_message": doc.error_message,
        }

    analysis_result = await db.execute(
        select(DocumentAnalysis).where(DocumentAnalysis.document_id == doc_uuid)
    )
    analysis = analysis_result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return {
        "document_id": document_id,
        "document_name": doc.name,
        "status": "ready",
        "analysis": analysis.result,
        "document_type": analysis.document_type,
        "confidence": analysis.confidence,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
    }
