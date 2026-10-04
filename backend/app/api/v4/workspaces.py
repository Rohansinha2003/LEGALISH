"""
Professional Workspaces API Router (V4).
Provides Lawyer Professional Workspace, NGO / Legal Aid Case Manager,
and Enterprise Tenant-Isolated Knowledge Bases.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.services.lawyer.workspace import LawyerWorkspaceService
from app.services.organization.workspace import OrganizationWorkspaceService
from app.schemas.v4 import (
    LawyerReviewSubmit,
    LawyerFeedbackCreate,
    OrganizationKnowledgeCreate,
)

router = APIRouter()


# --- Advocate Professional Workspace ---

@router.get("/lawyer/dashboard/{lawyer_id}")
async def get_lawyer_dashboard(
    lawyer_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves lawyer professional dashboard metrics, active matters, and pending reviews."""
    service = LawyerWorkspaceService(db)
    dashboard = await service.get_dashboard(lawyer_id=lawyer_id)
    return dashboard


@router.post("/lawyer/reviews")
async def submit_lawyer_review(
    payload: LawyerReviewSubmit,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Lawyer signs off on AI-drafted document with SHA-256 signature
    advancing review status badge from AI Generated to Lawyer Approved / Final.
    """
    service = LawyerWorkspaceService(db)
    review = await service.submit_document_review(
        lawyer_id=user_id,
        consultation_id=payload.consultation_id,
        document_id=payload.document_id,
        review_status=payload.review_status,
        correction_notes=payload.correction_notes,
        verified_clauses=payload.verified_clauses,
    )
    return review


@router.post("/lawyer/feedback")
async def submit_lawyer_feedback(
    payload: LawyerFeedbackCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Submits advocate ground-truth corrections on AI outputs for evaluation logging."""
    service = LawyerWorkspaceService(db)
    fb = await service.log_lawyer_feedback(
        lawyer_id=payload.lawyer_id,
        case_id=payload.case_id,
        ai_output_type=payload.ai_output_type,
        original_ai_text=payload.original_ai_text,
        corrected_text=payload.corrected_text,
        correction_reason=payload.correction_reason,
    )
    return fb


# --- NGO & Legal Aid Workspace ---

@router.get("/ngo/dashboard/{org_id}")
async def get_ngo_dashboard(
    org_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Operational metrics, Section 12 NALSA eligibility breakdown, and DLSA reporting."""
    service = OrganizationWorkspaceService(db)
    overview = await service.get_ngo_workspace_overview(org_id=org_id)
    return overview


# --- Enterprise Knowledge Base (Tenant Isolated) ---

@router.post("/organization/{org_id}/knowledge")
async def add_org_knowledge_document(
    org_id: str,
    payload: OrganizationKnowledgeCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Uploads private, tenant-isolated SOP or agreement template."""
    service = OrganizationWorkspaceService(db)
    doc = await service.add_knowledge_document(
        organization_id=org_id,
        title=payload.title,
        doc_type=payload.doc_type,
        content=payload.content,
    )
    return doc


@router.get("/organization/{org_id}/knowledge")
async def list_org_knowledge_documents(
    org_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Lists private knowledge base documents for an organization."""
    service = OrganizationWorkspaceService(db)
    docs = await service.list_knowledge_documents(organization_id=org_id)
    return docs
