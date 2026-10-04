"""
Case Fact Store Service.
Maintains structured case facts, confidence ratings, and user-confirmed corrections.
"""
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models import FactStore
from app.core.logging import get_logger

logger = get_logger(__name__)


class FactStoreService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_case_facts(self, case_id: str) -> List[Dict[str, Any]]:
        result = await self.db.execute(
            select(FactStore)
            .where(FactStore.case_id == uuid.UUID(case_id))
            .order_by(desc(FactStore.updated_at))
        )
        facts = result.scalars().all()
        return [
            {
                "id": str(f.id),
                "case_id": str(f.case_id),
                "fact_key": f.fact_key,
                "fact_value": f.fact_value,
                "data_type": f.data_type,
                "source_type": f.source_type,
                "source_ref": f.source_ref,
                "confidence": f.confidence,
                "user_confirmed": f.user_confirmed,
                "created_at": f.created_at,
                "updated_at": f.updated_at,
            }
            for f in facts
        ]

    async def add_fact(
        self,
        case_id: str,
        fact_key: str,
        fact_value: str,
        data_type: str = "string",
        source_type: str = "user_input",
        source_ref: Optional[str] = None,
        confidence: str = "high",
        user_confirmed: bool = False,
    ) -> Dict[str, Any]:
        fact = FactStore(
            id=uuid.uuid4(),
            case_id=uuid.UUID(case_id),
            fact_key=fact_key,
            fact_value=fact_value,
            data_type=data_type,
            source_type=source_type,
            source_ref=source_ref,
            confidence=confidence,
            user_confirmed=user_confirmed,
        )
        self.db.add(fact)
        await self.db.commit()
        await self.db.refresh(fact)
        return {
            "id": str(fact.id),
            "case_id": str(fact.case_id),
            "fact_key": fact.fact_key,
            "fact_value": fact.fact_value,
            "data_type": fact.data_type,
            "source_type": fact.source_type,
            "source_ref": fact.source_ref,
            "confidence": fact.confidence,
            "user_confirmed": fact.user_confirmed,
            "created_at": fact.created_at,
            "updated_at": fact.updated_at,
        }

    async def update_fact(
        self,
        fact_id: str,
        fact_value: Optional[str] = None,
        user_confirmed: Optional[bool] = None,
        confidence: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        result = await self.db.execute(
            select(FactStore).where(FactStore.id == uuid.UUID(fact_id))
        )
        fact = result.scalar_one_or_none()
        if not fact:
            return None

        if fact_value is not None:
            fact.fact_value = fact_value
        if user_confirmed is not None:
            fact.user_confirmed = user_confirmed
        if confidence is not None:
            fact.confidence = confidence

        await self.db.commit()
        await self.db.refresh(fact)
        return {
            "id": str(fact.id),
            "case_id": str(fact.case_id),
            "fact_key": fact.fact_key,
            "fact_value": fact.fact_value,
            "data_type": fact.data_type,
            "source_type": fact.source_type,
            "source_ref": fact.source_ref,
            "confidence": fact.confidence,
            "user_confirmed": fact.user_confirmed,
            "created_at": fact.created_at,
            "updated_at": fact.updated_at,
        }
