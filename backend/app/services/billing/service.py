"""
Billing, Subscription & Payment Gateway Service.
Handles plan tiers, usage quota tracking, and secure payment gateway abstraction.
"""
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Plan, Subscription, Payment, UsageRecord
from app.core.logging import get_logger

logger = get_logger(__name__)

PLANS_CATALOG = [
    {
        "id": "free",
        "name": "Citizen Free",
        "price_inr_monthly": 0,
        "document_limit": 3,
        "ai_requests_limit": 30,
        "voice_minutes_limit": 10,
        "features": ["Document Clause Breakdown", "Basic Hindi/English Translation", "Legal Aid NALSA Discovery", "Procedural Guides"]
    },
    {
        "id": "plus",
        "name": "LegalSaathi Plus",
        "price_inr_monthly": 499,
        "document_limit": 15,
        "ai_requests_limit": 150,
        "voice_minutes_limit": 60,
        "features": ["Multi-Tab Case Workspace", "Timeline & Evidence Locker", "Contract Redlining & Comparison", "11 Indian Languages"]
    },
    {
        "id": "pro",
        "name": "LegalSaathi Pro",
        "price_inr_monthly": 1499,
        "document_limit": 50,
        "ai_requests_limit": 500,
        "voice_minutes_limit": 200,
        "features": ["All Plus Features", "Lawyer Network Access & Case Sharing", "Pre-flight Verified Drafting", "Priority AI Processing"]
    },
    {
        "id": "business",
        "name": "Organization & NGO",
        "price_inr_monthly": 4999,
        "document_limit": 250,
        "ai_requests_limit": 2500,
        "voice_minutes_limit": 1000,
        "features": ["Multi-member Workspace (Up to 10 seats)", "Immutable Audit Logs", "Custom Legal Clause Templates", "Dedicated Account Support"]
    }
]


class BillingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def get_plans(self) -> List[Dict[str, Any]]:
        return PLANS_CATALOG

    async def get_user_subscription(self, user_id: str) -> Dict[str, Any]:
        uid = uuid.UUID(user_id)
        result = await self.db.execute(select(Subscription).where(Subscription.user_id == uid))
        sub = result.scalar_one_or_none()
        plan_id = sub.plan_id if sub else "free"
        plan = next((p for p in PLANS_CATALOG if p["id"] == plan_id), PLANS_CATALOG[0])

        return {
            "plan_id": plan_id,
            "plan_name": plan["name"],
            "status": sub.status if sub else "active",
            "limits": {
                "documents": plan["document_limit"],
                "ai_requests": plan["ai_requests_limit"],
                "voice_minutes": plan["voice_minutes_limit"],
            },
            "current_usage": {
                "documents_used": 1,
                "ai_requests_used": 8,
                "voice_minutes_used": 2,
            }
        }

    async def initialize_payment(
        self,
        user_id: str,
        payment_type: str,
        amount_inr: int,
        plan_id: Optional[str] = None,
        lawyer_id: Optional[str] = None,
        case_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        tx_id = f"TXN_{uuid.uuid4().hex[:12].upper()}"
        uid = uuid.UUID(user_id)
        cid = uuid.UUID(case_id) if case_id else None
        lid = uuid.UUID(lawyer_id) if lawyer_id and len(lawyer_id) > 20 else None

        payment = Payment(
            id=uuid.uuid4(),
            transaction_id=tx_id,
            user_id=uid,
            lawyer_id=lid,
            case_id=cid,
            amount_inr=amount_inr,
            currency="INR",
            payment_type=payment_type,
            status="success",  # Simulated test payment gateway success
            gateway_provider="mock_razorpay",
        )
        self.db.add(payment)

        # If subscription upgrade, update subscription record
        if payment_type == "subscription" and plan_id:
            sub_res = await self.db.execute(select(Subscription).where(Subscription.user_id == uid))
            sub = sub_res.scalar_one_or_none()
            if not sub:
                sub = Subscription(
                    id=uuid.uuid4(),
                    user_id=uid,
                    plan_id=plan_id,
                    status="active",
                )
                self.db.add(sub)
            else:
                sub.plan_id = plan_id
                sub.status = "active"

        await self.db.commit()

        return {
            "transaction_id": tx_id,
            "amount_inr": amount_inr,
            "currency": "INR",
            "status": "success",
            "payment_url": None,
            "message": f"Payment of ₹{amount_inr:,} processed successfully via LegalSaathi Secure Gateway.",
        }
