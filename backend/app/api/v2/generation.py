"""
Advanced Document Generation V2 Router — Clause Library, Pre-flight Fact Verification,
9-Step Wizard Drafting, Document Review Mode, and Versioning.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models import GeneratedDocument, DocumentVersion
from app.api.v1.auth import get_current_user_id
from app.schemas.v2 import DraftGenerateV2Request, DocumentReviewRequest
from app.services.generation.v2_service import get_advanced_generator_service

router = APIRouter()


@router.get("/clauses")
async def get_clause_library(doc_type: str | None = None):
    """Retrieve the standard clause library for contract drafting."""
    service = get_advanced_generator_service()
    return {"clauses": service.get_clause_library(doc_type)}


@router.post("/verify-facts")
async def verify_facts(facts: dict):
    """Pre-generation sanity check on user stated facts."""
    service = get_advanced_generator_service()
    warnings = service.verify_facts_sanity(facts)
    return {
        "valid": len(warnings) == 0,
        "warnings": warnings,
    }


@router.post("/")
async def generate_draft_v2(
    data: DraftGenerateV2Request,
    case_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Generate a structured legal draft with versioning support."""
    service = get_advanced_generator_service()
    draft_result = await service.generate_draft(
        doc_type=data.doc_type,
        jurisdiction=data.jurisdiction,
        facts=data.facts,
        selected_clauses=data.selected_clauses,
        version_number=data.version_number or 1,
    )

    c_uuid = uuid.UUID(case_id) if case_id else None

    # Create root GeneratedDocument
    gen_doc = GeneratedDocument(
        id=uuid.uuid4(),
        user_id=uuid.UUID(user_id),
        case_id=c_uuid,
        doc_type=data.doc_type,
        title=draft_result.get("title", f"Draft {data.doc_type}"),
        facts=data.facts,
        content=draft_result.get("content", ""),
        current_version=1,
    )
    db.add(gen_doc)

    # Create version 1 record
    version_rec = DocumentVersion(
        id=uuid.uuid4(),
        generated_document_id=gen_doc.id,
        version_number=1,
        title=gen_doc.title,
        content=gen_doc.content,
        facts=data.facts,
        change_summary="Initial generated draft",
    )
    db.add(version_rec)

    await db.commit()
    await db.refresh(gen_doc)

    return {
        "id": str(gen_doc.id),
        "title": gen_doc.title,
        "content": gen_doc.content,
        "current_version": gen_doc.current_version,
        "disclaimer": draft_result.get("disclaimer"),
        "included_clauses": draft_result.get("included_clauses", []),
        "action_items_before_signing": draft_result.get("action_items_before_signing", []),
    }


@router.post("/review")
async def review_document_sanity(
    data: DocumentReviewRequest,
):
    """
    Document Review Mode — audits draft content for missing facts,
    inconsistent dates, and conflicting amounts.
    """
    service = get_advanced_generator_service()
    review = await service.review_document(
        title=data.title,
        doc_type=data.doc_type,
        content=data.content,
        facts=data.facts,
    )
    return review


@router.get("/{document_id}/versions")
async def get_document_versions(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """List all version revisions of a generated document."""
    d_uuid = uuid.UUID(document_id)
    doc_res = await db.execute(
        select(GeneratedDocument).where(GeneratedDocument.id == d_uuid, GeneratedDocument.user_id == uuid.UUID(user_id))
    )
    doc = doc_res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Generated document not found.")

    v_res = await db.execute(
        select(DocumentVersion)
        .where(DocumentVersion.generated_document_id == d_uuid)
        .order_by(desc(DocumentVersion.version_number))
    )
    versions = v_res.scalars().all()
    return [
        {
            "id": str(v.id),
            "version_number": v.version_number,
            "title": v.title,
            "change_summary": v.change_summary,
            "created_at": v.created_at.isoformat() if v.created_at else None,
        }
        for v in versions
    ]


@router.post("/{document_id}/restore/{version_number}")
async def restore_document_version(
    document_id: str,
    version_number: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Restore a previous version of a generated document."""
    d_uuid = uuid.UUID(document_id)
    doc_res = await db.execute(
        select(GeneratedDocument).where(GeneratedDocument.id == d_uuid, GeneratedDocument.user_id == uuid.UUID(user_id))
    )
    doc = doc_res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Generated document not found.")

    v_res = await db.execute(
        select(DocumentVersion).where(
            DocumentVersion.generated_document_id == d_uuid,
            DocumentVersion.version_number == version_number,
        )
    )
    target_version = v_res.scalar_one_or_none()
    if not target_version:
        raise HTTPException(status_code=404, detail="Specified version not found.")

    # Apply restore as a new version
    new_version_num = (doc.current_version or 1) + 1
    doc.content = target_version.content
    doc.title = target_version.title
    doc.current_version = new_version_num

    new_v_record = DocumentVersion(
        id=uuid.uuid4(),
        generated_document_id=d_uuid,
        version_number=new_version_num,
        title=target_version.title,
        content=target_version.content,
        facts=target_version.facts,
        change_summary=f"Restored from version {version_number}",
    )
    db.add(new_v_record)
    await db.commit()

    return {
        "status": "restored",
        "current_version": new_version_num,
        "content": doc.content,
    }
