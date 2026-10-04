"""
Case Bundle Export Service.
Generates comprehensive export package including Case Summary, Facts, Timeline,
Evidence Index, Deadlines, and AI Analysis.
"""
import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Case, CaseEvent, Evidence, FactStore, Deadline, Document, GeneratedDocument


class CaseExporter:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def compile_case_export(self, case_id: str, user_id: str) -> Dict[str, Any]:
        cid = uuid.UUID(case_id)
        uid = uuid.UUID(user_id)

        case_res = await self.db.execute(select(Case).where(Case.id == cid, Case.user_id == uid))
        case = case_res.scalar_one_or_none()
        if not case:
            return {"error": "Case not found or unauthorized"}

        events_res = await self.db.execute(select(CaseEvent).where(CaseEvent.case_id == cid).order_by(CaseEvent.event_date.asc()))
        events = events_res.scalars().all()

        evidence_res = await self.db.execute(select(Evidence).where(Evidence.case_id == cid))
        evidence = evidence_res.scalars().all()

        facts_res = await self.db.execute(select(FactStore).where(FactStore.case_id == cid))
        facts = facts_res.scalars().all()

        deadlines_res = await self.db.execute(select(Deadline).where(Deadline.case_id == cid))
        deadlines = deadlines_res.scalars().all()

        drafts_res = await self.db.execute(select(GeneratedDocument).where(GeneratedDocument.case_id == cid))
        drafts = drafts_res.scalars().all()

        return {
            "export_metadata": {
                "platform": "LegalSaathi Digital Legal-Access Platform (V3)",
                "export_version": "3.0.0",
                "jurisdiction": "India",
                "disclaimer": "This export dossier is assembled from user records and AI assistance tools. It does not constitute certified legal records."
            },
            "case_overview": {
                "id": str(case.id),
                "title": case.title,
                "issue_type": case.issue_type,
                "status": case.status,
                "urgency": case.urgency,
                "urgency_reason": case.urgency_reason,
                "description": case.description,
                "ai_summary": case.ai_summary,
                "state": case.state,
                "city": case.city,
                "created_at": case.created_at.isoformat() if case.created_at else None,
            },
            "fact_store": [
                {
                    "key": f.fact_key,
                    "value": f.fact_value,
                    "type": f.data_type,
                    "source": f.source_type,
                    "verified_by_user": f.user_confirmed,
                }
                for f in facts
            ],
            "timeline": [
                {
                    "date": str(e.event_date) if e.event_date else e.date_display,
                    "title": e.title,
                    "description": e.description,
                    "confidence": e.confidence,
                }
                for e in events
            ],
            "evidence_index": [
                {
                    "title": ev.title,
                    "type": ev.evidence_type,
                    "description": ev.description,
                    "reliability": ev.reliability,
                }
                for ev in evidence
            ],
            "deadlines": [
                {
                    "title": d.title,
                    "due_date": str(d.due_date),
                    "basis": d.statutory_basis,
                    "completed": d.is_completed,
                }
                for d in deadlines
            ],
            "generated_drafts": [
                {
                    "title": g.title,
                    "type": g.document_type,
                    "content_preview": g.content[:300] if g.content else "",
                }
                for g in drafts
            ]
        }
