"""
Temporal Legal Reasoning API Router (V4).
Distinguishes between Law in force at Date of Incident vs Current Law.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.temporal.service import TemporalLegalEngine
from app.schemas.v4 import TemporalQueryRequest, TemporalLawResponse

router = APIRouter()


@router.post("/resolve", response_model=TemporalLawResponse)
async def resolve_law_at_date(
    payload: TemporalQueryRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluates statutory provisions in force on a specific incident date
    compared to the current statutory version, enforcing Article 20(1) safeguards.
    """
    service = TemporalLegalEngine(db)
    result = await service.resolve_law_at_date(
        statute_identifier=payload.statute_identifier,
        target_date_str=payload.target_date,
        section_number=payload.section_number,
    )
    return result


@router.post("/seed")
async def seed_temporal_versions(
    db: AsyncSession = Depends(get_db),
):
    """Seeds historical statutory amendment versions."""
    service = TemporalLegalEngine(db)
    await service.ensure_seed_versions()
    return {"status": "success", "message": "Statute amendment versions seeded successfully."}
