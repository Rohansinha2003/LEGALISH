"""
Case-Law Intelligence & Precedents API Router (V4).
Provides multi-criteria search, 10-point judgment summaries,
and side-by-side precedent comparison.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.caselaw.service import CaseLawIntelligenceService
from app.schemas.v4 import (
    JudgmentSearchQuery,
    JudgmentRead,
    JudgmentSummaryResponse,
    JudgmentCompareRequest,
    JudgmentCompareResponse,
)

router = APIRouter()


@router.post("/search", response_model=List[JudgmentRead])
async def search_judgments(
    payload: JudgmentSearchQuery,
    db: AsyncSession = Depends(get_db),
):
    """Searches Supreme Court and High Court judgments across facts, issues, and ratios."""
    service = CaseLawIntelligenceService(db)
    results = await service.search_judgments(
        query=payload.query,
        court=payload.court,
        section=payload.section,
        legal_concept=payload.legal_concept,
        limit=payload.limit,
    )
    return results


@router.get("/judgments/{judgment_id}/summary", response_model=JudgmentSummaryResponse)
async def get_judgment_summary(
    judgment_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Returns a structured 10-point legal summary of a court decision."""
    service = CaseLawIntelligenceService(db)
    summary = await service.get_judgment_summary(judgment_id)
    return summary


@router.post("/compare", response_model=JudgmentCompareResponse)
async def compare_judgments(
    payload: JudgmentCompareRequest,
    db: AsyncSession = Depends(get_db),
):
    """Compares two judicial precedents side-by-side highlighting similarities, divergence, and controlling authority."""
    service = CaseLawIntelligenceService(db)
    comparison = await service.compare_judgments(
        judgment_id_a=payload.judgment_id_a,
        judgment_id_b=payload.judgment_id_b,
        legal_issue=payload.legal_issue,
    )
    return comparison


@router.post("/seed")
async def seed_landmark_judgments(
    db: AsyncSession = Depends(get_db),
):
    """Seeds verified landmark Supreme Court and High Court decisions."""
    service = CaseLawIntelligenceService(db)
    await service.ensure_seed_judgments()
    return {"status": "success", "message": "Landmark judgments seeded successfully."}
