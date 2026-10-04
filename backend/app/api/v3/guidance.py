"""
Legal Guidance Router (V3).
Exposes endpoints for Legal Aid Discovery (NALSA), Procedural Guides, and Multilingual Glossary.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from app.services.legal_aid.service import LegalAidService
from app.services.procedures.service import ProceduralService
from app.services.glossary.service import GlossaryService
from app.schemas.v3 import LegalAidResourceItem, ProceduralExplainerItem, GlossaryTermItem

router = APIRouter()


# --- Legal Aid Discovery ---
@router.get("/legal-aid/discover")
async def discover_legal_aid(
    state: str = Query(..., description="Indian state e.g. Karnataka, Delhi, Maharashtra"),
    income: Optional[int] = Query(None, description="Annual income in INR"),
    is_woman_or_child: bool = Query(False),
    is_sc_or_st: bool = False,
    is_disabled_or_workman: bool = False,
):
    service = LegalAidService()
    return service.discover_legal_aid(
        state=state,
        annual_income=income,
        is_woman_or_child=is_woman_or_child,
        is_sc_or_st=is_sc_or_st,
        is_disabled_or_workman=is_disabled_or_workman,
    )


# --- Procedural Explainers ---
@router.get("/procedures/")
async def list_procedures():
    service = ProceduralService()
    return {"procedures": service.list_procedures()}


@router.get("/procedures/{slug}")
async def get_procedure_detail(slug: str):
    service = ProceduralService()
    proc = service.get_procedure(slug)
    if not proc:
        raise HTTPException(status_code=404, detail="Procedural guide not found.")
    return proc


# --- Multilingual Glossary ---
@router.get("/glossary/")
async def list_glossary_terms(q: Optional[str] = Query(None, description="Search term")):
    service = GlossaryService()
    return {"terms": service.list_terms(q)}


@router.get("/glossary/{term}")
async def get_glossary_term(term: str):
    service = GlossaryService()
    item = service.get_term(term)
    if not item:
        raise HTTPException(status_code=404, detail="Legal term not found in glossary.")
    return item
