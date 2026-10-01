"""Documents API — upload, list, status, delete."""
import uuid
import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models import Document, DocumentPage, DocumentChunk, DocumentAnalysis
from app.services.document.pipeline import validate_file, extract_text, chunk_pages
from app.services.rag.embedder import get_embedding_provider
from app.services.llm.mock import get_llm_provider
from app.prompts import DOCUMENT_SUMMARY_PROMPT, DOCUMENT_CLASSIFICATION_PROMPT, SAFETY_RULES
from app.api.v1.auth import get_current_user_id
from pydantic import BaseModel

router = APIRouter()
settings = get_settings()
logger = get_logger(__name__)

LOCAL_UPLOAD_DIR = "/tmp/legalsaathi_uploads"
os.makedirs(LOCAL_UPLOAD_DIR, exist_ok=True)


class DocumentResponse(BaseModel):
    id: str
    name: str
    original_filename: str
    file_type: str
    status: str
    page_count: int | None
    created_at: str

    class Config:
        from_attributes = True


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Upload and begin processing a legal document."""
    file_bytes = await file.read()
    filename = file.filename or "document"

    # Validate
    valid, error = validate_file(filename, file_bytes)
    if not valid:
        raise HTTPException(status_code=400, detail=error)

    ext = filename.rsplit(".", 1)[-1].lower()
    doc_id = str(uuid.uuid4())

    # Save file locally (swap for cloud storage in production)
    file_path = os.path.join(LOCAL_UPLOAD_DIR, f"{doc_id}.{ext}")
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Create document record
    doc = Document(
        id=uuid.UUID(doc_id),
        user_id=uuid.UUID(user_id),
        name=filename.rsplit(".", 1)[0],
        original_filename=filename,
        file_type=ext,
        file_url=file_path,
        file_size_bytes=len(file_bytes),
        status="processing",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Process in background
    background_tasks.add_task(_process_document, doc_id, filename, file_bytes, user_id)

    logger.info("document_uploaded", document_id=doc_id, user_id=user_id, filename=filename)
    return {"id": doc_id, "status": "processing", "message": "Document uploaded. Processing started."}


async def _process_document(doc_id: str, filename: str, file_bytes: bytes, user_id: str):
    """Background task: extract → chunk → embed → analyze."""
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        try:
            await _update_status(db, doc_id, "extracting")

            # 1. Extract text
            pages = extract_text(filename, file_bytes)

            # 2. Save pages
            for page in pages:
                db.add(DocumentPage(
                    document_id=uuid.UUID(doc_id),
                    page_number=page.page_number,
                    raw_text=page.text,
                ))
            await db.commit()

            await _update_status(db, doc_id, "analyzing")

            # 3. Chunk
            chunks = chunk_pages(pages, doc_id)

            # 4. Embed
            embedder = get_embedding_provider()
            texts = [c.text for c in chunks]
            embeddings = await embedder.embed(texts) if texts else []

            # 5. Save chunks with embeddings
            for i, chunk in enumerate(chunks):
                embedding = embeddings[i] if i < len(embeddings) else None
                db.add(DocumentChunk(
                    document_id=uuid.UUID(doc_id),
                    page_number=chunk.page_number,
                    section=chunk.section,
                    chunk_index=chunk.chunk_index,
                    text=chunk.text,
                    token_count=chunk.token_count,
                    embedding=embedding,
                ))
            await db.commit()

            # 6. LLM Analysis
            full_text = "\n\n".join(f"[Page {p.page_number}]\n{p.text}" for p in pages[:20])  # first 20 pages
            llm = get_llm_provider()
            from app.services.llm.base import Message as LLMMessage
            result = await llm.complete_json([
                LLMMessage(role="system", content=DOCUMENT_SUMMARY_PROMPT.format(
                    safety_rules=SAFETY_RULES,
                    document_type="Unknown",
                    document_text=full_text[:8000],
                )),
                LLMMessage(role="user", content="Analyze this document."),
            ])

            # 7. Save analysis
            db.add(DocumentAnalysis(
                document_id=uuid.UUID(doc_id),
                document_type=result.get("document_type", "Unknown"),
                summary=result.get("summary", ""),
                result=result,
                confidence=result.get("confidence", "medium"),
            ))

            # Update page count
            doc_result = await db.execute(select(Document).where(Document.id == uuid.UUID(doc_id)))
            doc = doc_result.scalar_one_or_none()
            if doc:
                doc.page_count = len(pages)

            await _update_status(db, doc_id, "ready")
            logger.info("document_processed", document_id=doc_id)

        except Exception as e:
            logger.error("document_processing_failed", document_id=doc_id, error=str(e), exc_info=True)
            await _update_status(db, doc_id, "error", str(e))


async def _update_status(db: AsyncSession, doc_id: str, status: str, error: str | None = None):
    result = await db.execute(select(Document).where(Document.id == uuid.UUID(doc_id)))
    doc = result.scalar_one_or_none()
    if doc:
        doc.status = status
        if error:
            doc.error_message = error[:500]
        await db.commit()


@router.get("/")
async def list_documents(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """List all documents for the current user."""
    result = await db.execute(
        select(Document)
        .where(Document.user_id == uuid.UUID(user_id))
        .order_by(Document.created_at.desc())
        .limit(50)
    )
    docs = result.scalars().all()
    return [
        {
            "id": str(d.id),
            "name": d.name,
            "original_filename": d.original_filename,
            "file_type": d.file_type,
            "status": d.status,
            "page_count": d.page_count,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]


@router.get("/{document_id}/status")
async def get_document_status(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    doc = await _get_user_document(db, document_id, user_id)
    return {"id": str(doc.id), "status": doc.status, "error_message": doc.error_message}


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    doc = await _get_user_document(db, document_id, user_id)
    await db.delete(doc)
    await db.commit()
    logger.info("document_deleted", document_id=document_id, user_id=user_id)
    return {"message": "Document deleted successfully."}


async def _get_user_document(db: AsyncSession, document_id: str, user_id: str) -> Document:
    """Fetch document ensuring it belongs to the requesting user (authorization check)."""
    try:
        doc_uuid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID.")
    result = await db.execute(
        select(Document).where(Document.id == doc_uuid, Document.user_id == uuid.UUID(user_id))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc
