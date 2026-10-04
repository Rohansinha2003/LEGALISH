"""
Tool Registry with explicit permission boundaries for Multi-Agent Orchestration.
Every tool operates under strict authorization scopes.
"""
from typing import Dict, Any, List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models import Case, CaseEvent, Evidence, FactStore, Deadline, Document
from app.services.legal_research.service import get_legal_research_service
from app.core.logging import get_logger

logger = get_logger(__name__)


class ToolRegistry:
    def __init__(self, db: AsyncSession, case_id: str, user_id: str):
        self.db = db
        self.case_id = uuid.UUID(case_id)
        self.user_id = uuid.UUID(user_id)
        self.research_service = get_legal_research_service()

    async def get_case_summary(self) -> Dict[str, Any]:
        """Tool: Case Agent -> Read case metadata & AI summary."""
        result = await self.db.execute(
            select(Case).where(Case.id == self.case_id, Case.user_id == self.user_id)
        )
        case = result.scalar_one_or_none()
        if not case:
            return {"error": "Case not found or unauthorized"}
        return {
            "id": str(case.id),
            "title": case.title,
            "issue_type": case.issue_type,
            "description": case.description,
            "state": case.state,
            "city": case.city,
            "urgency": case.urgency,
            "ai_summary": case.ai_summary,
            "status": case.status,
        }

    async def get_case_timeline(self) -> List[Dict[str, Any]]:
        """Tool: Timeline Agent -> Retrieve chronological events."""
        result = await self.db.execute(
            select(CaseEvent)
            .where(CaseEvent.case_id == self.case_id)
            .order_by(CaseEvent.event_date.asc().nulls_last())
        )
        events = result.scalars().all()
        return [
            {
                "id": str(e.id),
                "date": str(e.event_date) if e.event_date else e.date_display,
                "title": e.title,
                "description": e.description,
                "confidence": e.confidence,
            }
            for e in events
        ]

    async def get_case_evidence(self) -> List[Dict[str, Any]]:
        """Tool: Evidence Agent -> Retrieve organized evidence items."""
        result = await self.db.execute(
            select(Evidence).where(Evidence.case_id == self.case_id)
        )
        items = result.scalars().all()
        return [
            {
                "id": str(ev.id),
                "title": ev.title,
                "evidence_type": ev.evidence_type,
                "description": ev.description,
                "reliability": ev.reliability,
                "tags": ev.tags,
            }
            for ev in items
        ]

    async def get_case_facts(self) -> List[Dict[str, Any]]:
        """Tool: Case Agent -> Retrieve structured verified fact store."""
        result = await self.db.execute(
            select(FactStore).where(FactStore.case_id == self.case_id)
        )
        facts = result.scalars().all()
        return [
            {
                "id": str(f.id),
                "key": f.fact_key,
                "value": f.fact_value,
                "source": f.source_type,
                "user_confirmed": f.user_confirmed,
                "confidence": f.confidence,
            }
            for f in facts
        ]

    async def search_legal_statutes(self, query: str, state: Optional[str] = None) -> Dict[str, Any]:
        """Tool: Research Agent -> Search authoritative Indian statutes & provisions."""
        return await self.research_service.search_legal_sources(
            query=query,
            state=state,
            top_k=3,
        )

    async def get_deadlines(self) -> List[Dict[str, Any]]:
        """Tool: Risk Agent -> Retrieve approaching deadlines."""
        result = await self.db.execute(
            select(Deadline)
            .where(Deadline.case_id == self.case_id, Deadline.is_completed == False)
            .order_by(Deadline.due_date.asc())
        )
        deadlines = result.scalars().all()
        return [
            {
                "id": str(d.id),
                "title": d.title,
                "due_date": str(d.due_date),
                "importance": d.importance,
                "statutory_basis": d.statutory_basis,
                "is_uncertain": d.is_uncertain,
            }
            for d in deadlines
        ]
