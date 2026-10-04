"""
Global Search Router — Searches across Cases, Documents, Evidence, and Drafts with strict user isolation.
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.models import Case, Document, Evidence, GeneratedDocument
from app.api.v1.auth import get_current_user_id
from app.schemas.v2 import GlobalSearchRequest

router = APIRouter()


@router.post("/")
async def global_search(
    data: GlobalSearchRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Search across all of the authenticated user's legal records:
    Cases, Documents, Evidence, and Generated drafts.
    """
    u_uuid = uuid.UUID(user_id)
    q = f"%{data.query.strip()}%"

    # 1. Search Cases
    cases_res = await db.execute(
        select(Case).where(
            Case.user_id == u_uuid,
            or_(Case.title.ilike(q), Case.description.ilike(q), Case.issue_type.ilike(q))
        ).limit(10)
    )
    cases = cases_res.scalars().all()

    # 2. Search Documents
    docs_res = await db.execute(
        select(Document).where(
            Document.user_id == u_uuid,
            Document.name.ilike(q)
        ).limit(10)
    )
    docs = docs_res.scalars().all()

    # 3. Search Evidence
    ev_res = await db.execute(
        select(Evidence).where(
            Evidence.user_id == u_uuid,
            or_(Evidence.name.ilike(q), Evidence.description.ilike(q), Evidence.user_notes.ilike(q))
        ).limit(10)
    )
    evidence_items = ev_res.scalars().all()

    # 4. Search Generated Documents
    gen_res = await db.execute(
        select(GeneratedDocument).where(
            GeneratedDocument.user_id == u_uuid,
            or_(GeneratedDocument.title.ilike(q), GeneratedDocument.doc_type.ilike(q))
        ).limit(10)
    )
    drafts = gen_res.scalars().all()

    return {
        "query": data.query,
        "results": {
            "cases": [
                {"id": str(c.id), "title": c.title, "issue_type": c.issue_type, "urgency": c.urgency}
                for c in cases
            ],
            "documents": [
                {"id": str(d.id), "name": d.name, "case_id": str(d.case_id) if d.case_id else None, "status": d.status}
                for d in docs
            ],
            "evidence": [
                {"id": str(e.id), "name": e.name, "case_id": str(e.case_id), "evidence_type": e.evidence_type}
                for e in evidence_items
            ],
            "drafts": [
                {"id": str(dr.id), "title": dr.title, "case_id": str(dr.case_id) if dr.case_id else None, "doc_type": dr.doc_type}
                for dr in drafts
            ]
        },
        "total_matches": len(cases) + len(docs) + len(evidence_items) + len(drafts),
    }
