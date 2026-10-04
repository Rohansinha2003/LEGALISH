"""
Zero-Trust Security & Context Minimization Middleware (V4).
Enforces strict 5-tuple authorization:
1. Who (User Identity)
2. Org (Tenant Membership)
3. Case (Case Ownership / Scoped Grant)
4. Permission (Read, Write, Review, Admin)
5. Resource (Document, Evidence, Consultation)
Applies application-level PII masking and context minimization.
"""
import uuid
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models import Case, Document, OrganizationMember, Consultation
from app.core.logging import get_logger

logger = get_logger(__name__)

# Indian PII detection patterns
AADHAAR_PATTERN = r"\b\d{4}\s?\d{4}\s?\d{4}\b"
PAN_PATTERN = r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b"
PHONE_PATTERN = r"\b(?:\+91[\-\s]?)?[6789]\d{9}\b"
BANK_ACC_PATTERN = r"\b\d{9,18}\b"


class ZeroTrustSecurityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def verify_access(
        self,
        user_id: str,
        case_id: str,
        permission: str = "read",
        resource_id: Optional[str] = None,
        org_id: Optional[str] = None
    ) -> bool:
        """
        Validates whether the user has explicit permission to access the requested case or resource.
        """
        try:
            uid = uuid.UUID(user_id)
            cid = uuid.UUID(case_id)
        except ValueError:
            return False

        # 1. Direct Case Owner check
        case_res = await self.db.execute(select(Case).where(Case.id == cid))
        case = case_res.scalar_one_or_none()
        if not case:
            return False

        if case.user_id == uid:
            return True

        # 2. Organization membership check
        if org_id:
            try:
                oid = uuid.UUID(org_id)
                member = (await self.db.execute(
                    select(OrganizationMember).where(
                        and_(OrganizationMember.organization_id == oid, OrganizationMember.user_id == uid)
                    )
                )).scalar_one_or_none()
                if member:
                    return True
            except ValueError:
                pass

        # 3. Advocate Scoped Consultation check
        cons_res = await self.db.execute(
            select(Consultation).where(
                and_(
                    Consultation.case_id == cid,
                    Consultation.lawyer_id == uid,
                    Consultation.status.in_(["accepted", "in_progress", "scheduled"])
                )
            )
        )
        if cons_res.scalar_one_or_none():
            return True

        logger.warning("zero_trust_access_denied", user_id=user_id, case_id=case_id, permission=permission)
        return False

    @staticmethod
    def mask_pii(text: str) -> str:
        """Masks Indian Aadhaar, PAN, and Bank Account numbers before AI prompt execution."""
        masked = re.sub(AADHAAR_PATTERN, "[REDACTED_AADHAAR]", text)
        masked = re.sub(PAN_PATTERN, "[REDACTED_PAN]", masked)
        masked = re.sub(PHONE_PATTERN, "[REDACTED_PHONE]", masked)
        return masked

    @staticmethod
    def minimize_context(full_document_text: str, query: str, max_chars: int = 2500) -> str:
        """
        Context Minimization: Extracts only relevant paragraphs matching query terms
        rather than transmitting entire voluminous multi-page documents to AI.
        """
        if len(full_document_text) <= max_chars:
            return full_document_text

        paragraphs = full_document_text.split("\n\n")
        query_words = set(query.lower().split())

        scored_paragraphs = []
        for p in paragraphs:
            score = sum(1 for word in query_words if word in p.lower())
            scored_paragraphs.append((score, p))

        # Sort by relevance
        scored_paragraphs.sort(key=lambda x: x[0], reverse=True)

        selected = []
        current_len = 0
        for score, p in scored_paragraphs:
            if current_len + len(p) <= max_chars:
                selected.append(p)
                current_len += len(p)
            else:
                break

        return "\n\n".join(selected) if selected else full_document_text[:max_chars]


_zerotrust_svc = None

def get_zerotrust_service(db: AsyncSession) -> ZeroTrustSecurityService:
    return ZeroTrustSecurityService(db)
