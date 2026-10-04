"""
Billing, Subscriptions & Organizations Router (V3).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.services.billing.service import BillingService
from app.services.organization.service import OrganizationService
from app.schemas.v3 import (
    PlanItem, PaymentCheckoutRequest, PaymentCheckoutResponse,
    OrganizationCreate, OrganizationItem
)

router = APIRouter()


# --- Subscriptions & Billing ---
@router.get("/plans")
async def get_subscription_plans(db: AsyncSession = Depends(get_db)):
    service = BillingService(db)
    return {"plans": service.get_plans()}


@router.get("/usage")
async def get_usage_and_subscription(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = BillingService(db)
    return await service.get_user_subscription(user_id)


@router.post("/checkout", response_model=PaymentCheckoutResponse)
async def checkout_payment(
    payload: PaymentCheckoutRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = BillingService(db)
    return await service.initialize_payment(
        user_id=user_id,
        payment_type=payload.payment_type,
        amount_inr=payload.amount_inr,
        plan_id=payload.plan_id,
        lawyer_id=payload.lawyer_id,
        case_id=payload.case_id,
    )


# --- Organizations (Multi-Tenancy) ---
@router.get("/organizations/")
async def list_organizations(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = OrganizationService(db)
    return await service.list_user_organizations(user_id)


@router.post("/organizations/", response_model=OrganizationItem)
async def create_organization(
    payload: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = OrganizationService(db)
    return await service.create_organization(
        user_id=user_id,
        name=payload.name,
        slug=payload.slug,
        contact_email=payload.contact_email,
        org_type=payload.org_type,
    )
