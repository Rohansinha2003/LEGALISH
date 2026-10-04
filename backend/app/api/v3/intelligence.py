"""
Case Intelligence & Document Redlining Router (V3).
Exposes endpoints for Fact Store, Deadlines, Contradiction Detection, Document Comparison, and Case Export.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.schemas.v3 import (
    FactStoreCreate, FactStoreUpdate, FactStoreItem,
    DeadlineCreate, DeadlineUpdate, DeadlineItem,
    ContradictionResult,
    DocumentComparisonRequest, DocumentComparisonResponse,
)
from app.services.facts.service import FactStoreService
from app.services.deadlines.service import DeadlineService
from app.services.evidence.contradiction import DiscrepancyDetector
from app.services.document.comparator import DocumentComparator
from app.services.case.exporter import CaseExporter

router = APIRouter()


# --- Fact Store Endpoints ---
@router.get("/cases/{case_id}/facts")
async def get_case_facts(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = FactStoreService(db)
    return await service.get_case_facts(case_id)


@router.post("/cases/{case_id}/facts")
async def add_case_fact(
    case_id: str,
    payload: FactStoreCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = FactStoreService(db)
    return await service.add_fact(
        case_id=case_id,
        fact_key=payload.fact_key,
        fact_value=payload.fact_value,
        data_type=payload.data_type,
        source_type=payload.source_type,
        source_ref=payload.source_ref,
        confidence=payload.confidence,
    )


@router.patch("/cases/{case_id}/facts/{fact_id}")
async def update_case_fact(
    case_id: str,
    fact_id: str,
    payload: FactStoreUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = FactStoreService(db)
    res = await service.update_fact(
        fact_id=fact_id,
        fact_value=payload.fact_value,
        user_confirmed=payload.user_confirmed,
        confidence=payload.confidence,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Fact not found.")
    return res


# --- Deadline Engine Endpoints ---
@router.get("/cases/{case_id}/deadlines")
async def get_case_deadlines(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = DeadlineService(db)
    return await service.get_case_deadlines(case_id)


@router.post("/cases/{case_id}/deadlines")
async def create_case_deadline(
    case_id: str,
    payload: DeadlineCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = DeadlineService(db)
    return await service.create_deadline(
        case_id=case_id,
        title=payload.title,
        due_date_str=payload.due_date,
        source_document=payload.source_document,
        source_section=payload.source_section,
        statutory_basis=payload.statutory_basis,
        importance=payload.importance,
        is_uncertain=payload.is_uncertain,
        uncertainty_reason=payload.uncertainty_reason,
    )


@router.patch("/cases/{case_id}/deadlines/{deadline_id}")
async def update_case_deadline(
    case_id: str,
    deadline_id: str,
    payload: DeadlineUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = DeadlineService(db)
    res = await service.update_deadline(
        deadline_id=deadline_id,
        is_completed=payload.is_completed,
        due_date_str=payload.due_date,
        title=payload.title,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Deadline not found.")
    return res


# --- Contradiction Detection ---
@router.get("/cases/{case_id}/contradictions", response_model=ContradictionResult)
async def check_contradictions(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    detector = DiscrepancyDetector(db)
    return await detector.check_case_discrepancies(case_id)


# --- Document Comparison & Redlining ---
@router.post("/documents/compare", response_model=DocumentComparisonResponse)
async def compare_documents(
    payload: DocumentComparisonRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    comparator = DocumentComparator(db)
    return await comparator.compare_documents(payload.document_id_1, payload.document_id_2)


# --- Complete Case Export ---
@router.get("/cases/{case_id}/export")
async def export_case_bundle(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    exporter = CaseExporter(db)
    return await exporter.compile_case_export(case_id, user_id)
