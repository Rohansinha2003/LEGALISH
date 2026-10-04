"""
Court Process Assistant API Router (V4).
Provides educational procedural stages with transparent groundings and verified timestamps.
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Body
from app.services.court.service import CourtProcessAssistantService

router = APIRouter()


@router.post("/procedure-walkthrough")
async def get_court_procedure_walkthrough(
    payload: Dict[str, Any] = Body(...),
):
    """
    Returns an educational walkthrough of court stages categorized into:
    [KNOWN FROM DOCUMENT], [GENERAL PROCEDURAL INFORMATION], [POSSIBLE NEXT STEP], [UNKNOWN].
    """
    service = CourtProcessAssistantService()
    case_type = payload.get("case_type", "Civil Tenancy / Recovery")
    current_document_type = payload.get("document_type", "Legal Notice")
    jurisdiction = payload.get("jurisdiction", "India")

    result = await service.explain_procedural_stage(
        case_type=case_type,
        current_document_type=current_document_type,
        jurisdiction=jurisdiction,
    )
    return result


@router.post("/verify-case-status")
async def verify_court_case_status(
    payload: Dict[str, Any] = Body(...),
):
    """
    Transparent case status inquiry. Clearly states authoritative source,
    last checked timestamp, and warns against relying on unverified predictions.
    """
    service = CourtProcessAssistantService()
    cnr_number = payload.get("cnr_number", "")
    court_complex = payload.get("court_complex", "District Court Saket, New Delhi")

    result = await service.verify_case_status(
        cnr_number=cnr_number,
        court_complex=court_complex,
    )
    return result
