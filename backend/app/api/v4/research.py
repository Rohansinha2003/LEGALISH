"""
Legal Research Copilot & Citation Verification API Router (V4).
Provides citation verification, research collections, and structured legal memo creation.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.services.research.service import ResearchCopilotService
from app.schemas.v4 import (
    CitationVerifyRequest,
    CitationVerifyResponse,
    ResearchCollectionCreate,
    LegalMemoRequest,
    LegalMemoResponse,
)

router = APIRouter()


@router.post("/verify-citation", response_model=CitationVerifyResponse)
async def verify_citation(
    payload: CitationVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Verifies Indian statutory and precedent citations against authoritative catalogs
    and standard legal citation syntax rules.
    """
    service = ResearchCopilotService(db)
    result = await service.verify_citation(payload.citation_text)
    return result


@router.post("/collections")
async def create_research_collection(
    payload: ResearchCollectionCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Creates a research collection for saving precedents, statutory clauses, and notes."""
    service = ResearchCopilotService(db)
    collection = await service.create_collection(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        case_id=payload.case_id,
    )
    return collection


@router.get("/collections")
async def list_research_collections(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Lists research collections created by the current user or advocate."""
    service = ResearchCopilotService(db)
    collections = await service.list_collections(user_id=user_id)
    return collections


@router.post("/memo", response_model=LegalMemoResponse)
async def generate_legal_memo(
    payload: LegalMemoRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Generates a structured, multi-section legal memorandum
    with applicable statutes, binding precedents, and objective counterarguments.
    """
    service = ResearchCopilotService(db)
    memo = await service.generate_legal_memo(
        research_question=payload.research_question,
        facts_summary=payload.facts_summary,
        case_id=payload.case_id,
        jurisdiction=payload.jurisdiction,
    )
    return memo
