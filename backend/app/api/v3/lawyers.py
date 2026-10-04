"""
Lawyer Marketplace & Consultation API Router (V3).
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.services.lawyer.network import LawyerNetworkService
from app.schemas.v3 import (
    LawyerProfile, ConsultationCreate, ConsultationResponse,
    LawyerMessageCreate, LawyerMessageItem
)

router = APIRouter()


@router.get("/")
async def list_verified_lawyers(
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    practice_area: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    max_fee: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = LawyerNetworkService(db)
    return await service.list_lawyers(
        state=state,
        city=city,
        practice_area=practice_area,
        language=language,
        max_fee=max_fee,
    )


@router.get("/{lawyer_id}/profile")
async def get_lawyer_profile(lawyer_id: str, db: AsyncSession = Depends(get_db)):
    service = LawyerNetworkService(db)
    prof = await service.get_lawyer_profile(lawyer_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Lawyer profile not found.")
    return prof


@router.post("/consultations/", response_model=ConsultationResponse)
async def request_consultation(
    payload: ConsultationCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = LawyerNetworkService(db)
    return await service.create_consultation(
        case_id=payload.case_id,
        user_id=user_id,
        lawyer_id=payload.lawyer_id,
        shared_scopes=payload.shared_scopes,
        initial_message=payload.initial_message,
    )


@router.get("/consultations/{consultation_id}/messages")
async def get_consultation_chat(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = LawyerNetworkService(db)
    return await service.get_consultation_messages(consultation_id)


@router.post("/consultations/{consultation_id}/messages")
async def post_consultation_message(
    consultation_id: str,
    payload: LawyerMessageCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = LawyerNetworkService(db)
    return await service.send_message(consultation_id, user_id, payload.content)


@router.post("/consultations/{consultation_id}/revoke")
async def revoke_consultation_access(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = LawyerNetworkService(db)
    return await service.revoke_access(consultation_id)
