"""
Advanced Document Intelligence & Obligations API Router (V4).
Provides obligation extraction, cross-document reconciliation, and contract risk review.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.services.document.intelligence import DocumentIntelligenceService
from app.schemas.v4 import (
    DocumentObligationRead,
    CrossDocumentReconciliationResponse,
)

router = APIRouter()


@router.post("/cases/{case_id}/obligations/extract", response_model=List[DocumentObligationRead])
async def extract_obligations(
    case_id: str,
    document_id: Optional[str] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Extracts structured legal obligations, deadlines, and payment covenants from document text."""
    service = DocumentIntelligenceService(db)
    obligations = await service.extract_obligations(case_id=case_id, document_id=document_id)
    return obligations


@router.get("/cases/{case_id}/obligations", response_model=List[DocumentObligationRead])
async def list_case_obligations(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Lists all extracted obligations and fulfillment statuses for a case."""
    service = DocumentIntelligenceService(db)
    obligations = await service.list_obligations(case_id=case_id)
    return obligations


@router.post("/cases/{case_id}/reconcile", response_model=CrossDocumentReconciliationResponse)
async def reconcile_case_documents(
    case_id: str,
    payload: Dict[str, Any] = Body(default_factory=dict),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Performs cross-document reconciliation (e.g. comparing Lease Agreement covenants
    against Notice demands and bank transaction records) to flag discrepancies.
    """
    service = DocumentIntelligenceService(db)
    document_ids = payload.get("document_ids")
    reconciliation = await service.reconcile_documents(case_id=case_id, document_ids=document_ids)
    return reconciliation


@router.post("/risk-review")
async def neutral_contract_risk_review(
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Performs an objective, neutral risk review of contractual clauses
    balancing protections for both parties and flagging unconscionable covenants.
    """
    service = DocumentIntelligenceService(db)
    document_text = payload.get("document_text", "")
    user_side = payload.get("user_side", "tenant")
    review = await service.neutral_risk_review(document_text=document_text, user_side=user_side)
    return review
