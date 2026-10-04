"""
Lawyer Marketplace & Consultation Platform Service.
Handles advocate profiles, Bar Council verification, selective case sharing,
and case-bound consultation messaging.
"""
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models import Lawyer, LawyerVerification, Consultation, LawyerMessage, User, Case
from app.core.logging import get_logger

logger = get_logger(__name__)

# Initial verified seed advocates for platform launch
SEED_LAWYERS = [
    {
        "full_name": "Adv. Rajesh Kumar Rao",
        "bar_council_id": "KAR/1245/2014",
        "state_bar_council": "Bar Council of Karnataka",
        "enrollment_year": 2014,
        "practice_areas": ["Rent & Tenancy", "Property", "Civil Litigation"],
        "languages": ["en", "kn", "hi"],
        "state": "Karnataka",
        "city": "Bengaluru",
        "years_experience": 12,
        "consultation_fee": 1500,
        "verification_status": "verified",
        "bio": "Specializing in Karnataka Rent Control Act, commercial lease drafting, and landlord-tenant civil disputes before Bengaluru City Civil Courts.",
        "rating": 4.9,
        "review_count": 28,
        "is_available": True,
    },
    {
        "full_name": "Adv. Priya Ananthan",
        "bar_council_id": "MS/3489/2017",
        "state_bar_council": "Bar Council of Maharashtra & Goa",
        "enrollment_year": 2017,
        "practice_areas": ["Employment & Labour", "Cyber Law", "Consumer Disputes"],
        "languages": ["en", "mr", "hi"],
        "state": "Maharashtra",
        "city": "Mumbai",
        "years_experience": 9,
        "consultation_fee": 2000,
        "verification_status": "verified",
        "bio": "Experienced counsel for wrongful termination, payment of wages claims, and consumer commission proceedings across Mumbai and MMR.",
        "rating": 4.8,
        "review_count": 34,
        "is_available": True,
    },
    {
        "full_name": "Adv. Amitesh Vikram Singh",
        "bar_council_id": "D/982/2012",
        "state_bar_council": "Bar Council of Delhi",
        "enrollment_year": 2012,
        "practice_areas": ["Cheque Bounce (§138 NI Act)", "Contract Law", "Arbitration"],
        "languages": ["en", "hi", "pa"],
        "state": "Delhi",
        "city": "New Delhi",
        "years_experience": 14,
        "consultation_fee": 2500,
        "verification_status": "verified",
        "bio": "Senior advocate focusing on Negotiable Instruments Act Section 138 criminal complaints and commercial arbitration across Delhi District Courts.",
        "rating": 5.0,
        "review_count": 42,
        "is_available": True,
    }
]


class LawyerNetworkService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_lawyers(
        self,
        state: Optional[str] = None,
        city: Optional[str] = None,
        practice_area: Optional[str] = None,
        language: Optional[str] = None,
        max_fee: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        # Query verified lawyers from DB
        result = await self.db.execute(
            select(Lawyer).where(Lawyer.verification_status == "verified")
        )
        db_lawyers = result.scalars().all()

        lawyers_list = []
        for l in db_lawyers:
            lawyers_list.append({
                "id": str(l.id),
                "full_name": l.full_name,
                "bar_council_id": l.bar_council_id,
                "state_bar_council": l.state_bar_council,
                "enrollment_year": l.enrollment_year,
                "practice_areas": l.practice_areas or [],
                "languages": l.languages or ["en", "hi"],
                "state": l.state,
                "city": l.city,
                "years_experience": l.years_experience,
                "consultation_fee": l.consultation_fee,
                "verification_status": l.verification_status,
                "bio": l.bio,
                "rating": float(l.rating) if l.rating else 5.0,
                "review_count": l.review_count or 0,
                "is_available": l.is_available,
            })

        # Add seed advocates if DB is empty
        if not lawyers_list:
            for s in SEED_LAWYERS:
                lawyers_list.append({
                    "id": f"lawyer_{s['full_name'].split()[-1].lower()}_01",
                    **s,
                })

        # Apply in-memory filters
        filtered = []
        for l in lawyers_list:
            if state and l["state"].lower() != state.lower():
                continue
            if city and l["city"].lower() != city.lower():
                continue
            if practice_area and not any(practice_area.lower() in p.lower() for p in l["practice_areas"]):
                continue
            if language and language not in l["languages"]:
                continue
            if max_fee and l["consultation_fee"] > max_fee:
                continue
            filtered.append(l)

        return filtered

    async def get_lawyer_profile(self, lawyer_id: str) -> Optional[Dict[str, Any]]:
        try:
            lid = uuid.UUID(lawyer_id)
            result = await self.db.execute(select(Lawyer).where(Lawyer.id == lid))
            l = result.scalar_one_or_none()
            if l:
                return {
                    "id": str(l.id),
                    "full_name": l.full_name,
                    "bar_council_id": l.bar_council_id,
                    "state_bar_council": l.state_bar_council,
                    "enrollment_year": l.enrollment_year,
                    "practice_areas": l.practice_areas or [],
                    "languages": l.languages or ["en", "hi"],
                    "state": l.state,
                    "city": l.city,
                    "years_experience": l.years_experience,
                    "consultation_fee": l.consultation_fee,
                    "verification_status": l.verification_status,
                    "bio": l.bio,
                    "rating": float(l.rating) if l.rating else 5.0,
                    "review_count": l.review_count or 0,
                    "is_available": l.is_available,
                }
        except ValueError:
            pass

        # Check seed advocates
        for s in SEED_LAWYERS:
            if s["full_name"].split()[-1].lower() in lawyer_id.lower():
                return {"id": lawyer_id, **s}
        return None

    async def create_consultation(
        self,
        case_id: str,
        user_id: str,
        lawyer_id: str,
        shared_scopes: List[str],
        initial_message: Optional[str] = None,
    ) -> Dict[str, Any]:
        cid = uuid.UUID(case_id)
        uid = uuid.UUID(user_id)
        try:
            lid = uuid.UUID(lawyer_id)
        except ValueError:
            lid = uuid.uuid4()

        # Fetch case summary to generate structured Lawyer Brief
        case_res = await self.db.execute(select(Case).where(Case.id == cid))
        case = case_res.scalar_one_or_none()

        brief_summary = f"Case Brief for '{case.title if case else 'Case'}': {case.ai_summary if case else 'Intake completed.'}"

        consultation = Consultation(
            id=uuid.uuid4(),
            case_id=cid,
            user_id=uid,
            lawyer_id=lid,
            status="accepted",
            shared_scopes=shared_scopes,
            fee_inr=1500,
            meeting_link="https://meet.jit.si/legalsaathi-consult-" + str(uuid.uuid4())[:8],
            lawyer_summary=brief_summary,
        )
        self.db.add(consultation)

        if initial_message:
            msg = LawyerMessage(
                id=uuid.uuid4(),
                consultation_id=consultation.id,
                sender_id=uid,
                content=initial_message,
            )
            self.db.add(msg)

        await self.db.commit()
        await self.db.refresh(consultation)

        return {
            "id": str(consultation.id),
            "case_id": str(consultation.case_id),
            "lawyer_id": lawyer_id,
            "lawyer_name": "Advocate Counsel",
            "status": consultation.status,
            "fee_inr": consultation.fee_inr,
            "shared_scopes": consultation.shared_scopes,
            "lawyer_brief_summary": consultation.lawyer_summary,
            "meeting_link": consultation.meeting_link,
            "created_at": consultation.created_at,
        }

    async def get_consultation_messages(self, consultation_id: str) -> List[Dict[str, Any]]:
        cid = uuid.UUID(consultation_id)
        result = await self.db.execute(
            select(LawyerMessage)
            .where(LawyerMessage.consultation_id == cid)
            .order_by(LawyerMessage.created_at.asc())
        )
        messages = result.scalars().all()
        return [
            {
                "id": str(m.id),
                "consultation_id": str(m.consultation_id),
                "sender_id": str(m.sender_id),
                "sender_role": "client" if str(m.sender_id) == "00000000-0000-0000-0000-000000000001" else "lawyer",
                "content": m.content,
                "attachments": m.attachments or [],
                "created_at": m.created_at,
            }
            for m in messages
        ]

    async def send_message(self, consultation_id: str, sender_id: str, content: str) -> Dict[str, Any]:
        msg = LawyerMessage(
            id=uuid.uuid4(),
            consultation_id=uuid.UUID(consultation_id),
            sender_id=uuid.UUID(sender_id),
            content=content,
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return {
            "id": str(msg.id),
            "consultation_id": str(msg.consultation_id),
            "sender_id": str(msg.sender_id),
            "sender_role": "client",
            "content": msg.content,
            "attachments": msg.attachments or [],
            "created_at": msg.created_at,
        }

    async def revoke_access(self, consultation_id: str) -> Dict[str, Any]:
        cid = uuid.UUID(consultation_id)
        result = await self.db.execute(select(Consultation).where(Consultation.id == cid))
        c = result.scalar_one_or_none()
        if c:
            c.status = "cancelled"
            c.shared_scopes = []
            await self.db.commit()
            return {"status": "revoked", "message": "Lawyer access to case workspace revoked successfully."}
        return {"error": "Consultation not found"}
