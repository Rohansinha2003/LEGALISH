"""
Organization Multi-Tenancy Service.
Supports B2B and NGO multi-member workspaces with tenant isolation.
"""
import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Organization, OrganizationMember, User
from app.core.logging import get_logger

logger = get_logger(__name__)


class OrganizationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_user_organizations(self, user_id: str) -> List[Dict[str, Any]]:
        uid = uuid.UUID(user_id)
        result = await self.db.execute(
            select(Organization)
            .join(OrganizationMember, OrganizationMember.organization_id == Organization.id)
            .where(OrganizationMember.user_id == uid)
        )
        orgs = result.scalars().all()
        return [
            {
                "id": str(o.id),
                "name": o.name,
                "slug": o.slug,
                "org_type": o.org_type,
                "contact_email": o.contact_email,
                "max_members": o.max_members,
                "is_active": o.is_active,
                "created_at": o.created_at,
            }
            for o in orgs
        ]

    async def create_organization(
        self,
        user_id: str,
        name: str,
        slug: str,
        contact_email: str,
        org_type: str = "ngo",
    ) -> Dict[str, Any]:
        uid = uuid.UUID(user_id)
        org = Organization(
            id=uuid.uuid4(),
            name=name,
            slug=slug.lower().replace(" ", "-"),
            contact_email=contact_email,
            org_type=org_type,
            max_members=10,
        )
        self.db.add(org)

        member = OrganizationMember(
            id=uuid.uuid4(),
            organization_id=org.id,
            user_id=uid,
            role="admin",
        )
        self.db.add(member)

        await self.db.commit()
        await self.db.refresh(org)

        return {
            "id": str(org.id),
            "name": org.name,
            "slug": org.slug,
            "org_type": org.org_type,
            "contact_email": org.contact_email,
            "max_members": org.max_members,
            "is_active": org.is_active,
            "created_at": org.created_at,
        }
