"""
Case Deadline Engine.
Extracts, calculates, and monitors critical statutory and notice deadlines.
Flags uncertain calculation dates and days remaining.
"""
import uuid
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models import Deadline
from app.core.logging import get_logger

logger = get_logger(__name__)


class DeadlineService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_case_deadlines(self, case_id: str) -> List[Dict[str, Any]]:
        result = await self.db.execute(
            select(Deadline)
            .where(Deadline.case_id == uuid.UUID(case_id))
            .order_by(Deadline.due_date.asc())
        )
        deadlines = result.scalars().all()
        today = date.today()

        return [
            {
                "id": str(d.id),
                "case_id": str(d.case_id),
                "title": d.title,
                "due_date": d.due_date,
                "days_remaining": (d.due_date - today).days,
                "source_document": d.source_document,
                "source_section": d.source_section,
                "statutory_basis": d.statutory_basis,
                "importance": d.importance,
                "is_uncertain": d.is_uncertain,
                "uncertainty_reason": d.uncertainty_reason,
                "is_completed": d.is_completed,
            }
            for d in deadlines
        ]

    async def create_deadline(
        self,
        case_id: str,
        title: str,
        due_date_str: str,
        source_document: Optional[str] = None,
        source_section: Optional[str] = None,
        statutory_basis: Optional[str] = None,
        importance: str = "high",
        is_uncertain: bool = False,
        uncertainty_reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        d_date = date.fromisoformat(due_date_str)
        deadline = Deadline(
            id=uuid.uuid4(),
            case_id=uuid.UUID(case_id),
            title=title,
            due_date=d_date,
            source_document=source_document,
            source_section=source_section,
            statutory_basis=statutory_basis,
            importance=importance,
            is_uncertain=is_uncertain,
            uncertainty_reason=uncertainty_reason,
            is_completed=False,
        )
        self.db.add(deadline)
        await self.db.commit()
        await self.db.refresh(deadline)

        today = date.today()
        return {
            "id": str(deadline.id),
            "case_id": str(deadline.case_id),
            "title": deadline.title,
            "due_date": deadline.due_date,
            "days_remaining": (deadline.due_date - today).days,
            "source_document": deadline.source_document,
            "source_section": deadline.source_section,
            "statutory_basis": deadline.statutory_basis,
            "importance": deadline.importance,
            "is_uncertain": deadline.is_uncertain,
            "uncertainty_reason": deadline.uncertainty_reason,
            "is_completed": deadline.is_completed,
        }

    async def update_deadline(
        self,
        deadline_id: str,
        is_completed: Optional[bool] = None,
        due_date_str: Optional[str] = None,
        title: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        result = await self.db.execute(
            select(Deadline).where(Deadline.id == uuid.UUID(deadline_id))
        )
        deadline = result.scalar_one_or_none()
        if not deadline:
            return None

        if is_completed is not None:
            deadline.is_completed = is_completed
        if due_date_str is not None:
            deadline.due_date = date.fromisoformat(due_date_str)
        if title is not None:
            deadline.title = title

        await self.db.commit()
        await self.db.refresh(deadline)

        today = date.today()
        return {
            "id": str(deadline.id),
            "case_id": str(deadline.case_id),
            "title": deadline.title,
            "due_date": deadline.due_date,
            "days_remaining": (deadline.due_date - today).days,
            "source_document": deadline.source_document,
            "source_section": deadline.source_section,
            "statutory_basis": deadline.statutory_basis,
            "importance": deadline.importance,
            "is_uncertain": deadline.is_uncertain,
            "uncertainty_reason": deadline.uncertainty_reason,
            "is_completed": deadline.is_completed,
        }
