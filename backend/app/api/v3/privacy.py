"""
Notifications & Privacy Center Router (V3).
Covers in-app alerts, DPDP compliance, case deletion, and data exports.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.models import Notification, Case, Document, User

router = APIRouter()


# --- Notifications ---
@router.get("/notifications/")
@router.get("/privacy/notifications/")
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    uid = uuid.UUID(user_id)
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == uid)
        .order_by(desc(Notification.created_at))
    )
    items = result.scalars().all()
    if not items:
        # Default welcome notification
        return [
            {
                "id": "notif_welcome_01",
                "title": "Welcome to LegalSaathi V3",
                "message": "Your multi-agent legal workspace is ready. You can now organize evidence, track deadlines, and discover legal aid.",
                "notification_type": "system",
                "severity": "info",
                "created_at": None,
            }
        ]
    return [
        {
            "id": str(n.id),
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "severity": n.severity,
            "read_at": n.read_at,
            "created_at": n.created_at,
        }
        for n in items
    ]


# --- Privacy & Data Management ---
@router.get("/privacy/data-summary")
@router.get("/data-summary")
async def get_privacy_data_summary(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    uid = uuid.UUID(user_id)
    cases_cnt = (await db.execute(select(Case).where(Case.user_id == uid))).scalars().all()
    docs_cnt = (await db.execute(select(Document).where(Document.user_id == uid))).scalars().all()

    return {
        "user_id": user_id,
        "dpdp_compliance": "Digital Personal Data Protection Act, 2023 Compliant",
        "data_held": {
            "total_cases": len(cases_cnt),
            "total_uploaded_documents": len(docs_cnt),
            "pii_masking_status": "Enabled (Aadhaar, PAN, Bank Accounts Redacted)",
            "data_retention_period": "User-controlled (Permanent until manual deletion)",
        },
        "user_rights": [
            "Right to Access Case Summary",
            "Right to Correction (Case Fact Store)",
            "Right to Erasure (Delete Case or Delete Account)",
            "Right to Grievance Redressal",
        ]
    }


@router.delete("/cases/{case_id}")
async def delete_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    cid = uuid.UUID(case_id)
    uid = uuid.UUID(user_id)

    result = await db.execute(select(Case).where(Case.id == cid, Case.user_id == uid))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized.")

    await db.delete(case)
    await db.commit()
    return {"status": "success", "message": f"Case '{case.title}' and all associated timeline events, evidence, and drafts have been permanently deleted."}
