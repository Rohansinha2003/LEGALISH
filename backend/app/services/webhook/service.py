"""
LegalSaathi V4 Webhook Service.
Handles enterprise webhook registrations, event dispatching,
and cryptographic HMAC-SHA256 signature verification.
"""
import hmac
import hashlib
import json
import secrets
import httpx
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import WebhookSubscription, WebhookDelivery
from app.core.logging import get_logger

logger = get_logger(__name__)


class WebhookService:
    _fallback_subscriptions: List[Dict[str, Any]] = []

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_subscription(
        self,
        organization_id: Optional[str],
        target_url: str,
        subscribed_events: List[str]
    ) -> Dict[str, Any]:
        """Registers a new webhook subscription with a secure secret key."""
        secret_key = f"whsec_{secrets.token_hex(24)}"
        org_uuid = uuid.UUID(organization_id) if organization_id else None

        subscription = WebhookSubscription(
            organization_id=org_uuid,
            target_url=target_url,
            secret_key=secret_key,
            subscribed_events=subscribed_events or ["case.created", "workflow.approval_needed", "review.completed"],
            is_active=True
        )
        self.db.add(subscription)
        try:
            await self.db.commit()
            await self.db.refresh(subscription)
        except Exception:
            await self.db.rollback()

        sub_dict = {
            "id": str(subscription.id),
            "target_url": subscription.target_url,
            "secret_key": secret_key,
            "subscribed_events": subscription.subscribed_events,
            "is_active": subscription.is_active,
            "created_at": subscription.created_at.isoformat() if subscription.created_at else datetime.utcnow().isoformat()
        }
        WebhookService._fallback_subscriptions.append(sub_dict)
        return sub_dict

    async def list_subscriptions(self, organization_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = select(WebhookSubscription)
        if organization_id:
            query = query.where(WebhookSubscription.organization_id == uuid.UUID(organization_id))

        result = await self.db.execute(query)
        subs = result.scalars().all()
        if not subs and WebhookService._fallback_subscriptions:
            return WebhookService._fallback_subscriptions

        return [
            {
                "id": str(s.id),
                "target_url": s.target_url,
                "subscribed_events": s.subscribed_events,
                "is_active": s.is_active,
                "created_at": s.created_at.isoformat() if s.created_at else None
            }
            for s in subs
        ]


    async def dispatch_event(self, event_type: str, payload: Dict[str, Any], organization_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Dispatches an event to all matching active webhook subscriptions."""
        query = select(WebhookSubscription).where(WebhookSubscription.is_active.is_(True))
        if organization_id:
            query = query.where(WebhookSubscription.organization_id == uuid.UUID(organization_id))

        result = await self.db.execute(query)
        subscriptions = result.scalars().all()

        dispatch_results = []
        payload_data = {
            "event": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": payload
        }
        payload_json = json.dumps(payload_data, default=str)

        for sub in subscriptions:
            # Check if subscribed
            if sub.subscribed_events and event_type not in sub.subscribed_events and "*" not in sub.subscribed_events:
                continue

            # Compute HMAC-SHA256 signature
            signature = hmac.new(
                sub.secret_key.encode("utf-8"),
                payload_json.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()

            headers = {
                "Content-Type": "application/json",
                "X-LegalSaathi-Event": event_type,
                "X-LegalSaathi-Signature": f"sha256={signature}",
                "User-Agent": "LegalSaathi-Webhook-Dispatcher/4.0"
            }

            status_code = None
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.post(sub.target_url, content=payload_json, headers=headers)
                    status_code = resp.status_code
            except Exception as e:
                logger.warning("webhook_delivery_failed", url=sub.target_url, error=str(e))
                status_code = 502  # Gateway / delivery failure

            # Record delivery
            delivery = WebhookDelivery(
                subscription_id=sub.id,
                event_type=event_type,
                payload=payload_data,
                response_status=status_code,
                delivered_at=datetime.utcnow()
            )
            self.db.add(delivery)
            await self.db.commit()

            dispatch_results.append({
                "subscription_id": str(sub.id),
                "target_url": sub.target_url,
                "status_code": status_code,
                "success": status_code is not None and 200 <= status_code < 300
            })

        return dispatch_results
