"""
Webhooks API Router (V4).
Provides enterprise event subscriptions and cryptographic webhook dispatch.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.services.webhook.service import WebhookService
from app.schemas.v4 import WebhookSubscriptionCreate

router = APIRouter()


@router.post("/subscriptions")
async def create_webhook_subscription(
    payload: WebhookSubscriptionCreate,
    organization_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Registers an endpoint to receive signed HMAC-SHA256 event notifications."""
    service = WebhookService(db)
    sub = await service.create_subscription(
        organization_id=organization_id,
        target_url=payload.target_url,
        subscribed_events=payload.subscribed_events,
    )
    return sub


@router.get("/subscriptions")
async def list_webhook_subscriptions(
    organization_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Lists registered webhook subscriptions."""
    service = WebhookService(db)
    subs = await service.list_subscriptions(organization_id=organization_id)
    return subs


@router.post("/test-dispatch")
async def test_dispatch_event(
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Dispatches a test event to registered subscriptions."""
    event_type = payload.get("event_type", "case.created")
    data = payload.get("payload", {"test": True, "message": "Test ping from LegalSaathi V4"})
    organization_id = payload.get("organization_id")

    service = WebhookService(db)
    deliveries = await service.dispatch_event(event_type=event_type, payload=data, organization_id=organization_id)
    return {"deliveries": deliveries, "status": "dispatched"}
