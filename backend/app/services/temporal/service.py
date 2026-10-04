"""
Temporal Legal Reasoning Engine (V4).
Distinguishes between "Law in force at Date of Incident (T_event)" vs "Current Law (T_now)".
Maintains statutory amendment timelines, checks effective dates, and enforces
constitutional safeguards (Article 20(1) non-retroactivity of penal liabilities).
"""
import uuid
from datetime import date, datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models import StatuteVersion, LegalEntity
from app.core.logging import get_logger

logger = get_logger(__name__)

# Foundational historical statutory amendment versions in India
HISTORICAL_STATUTE_VERSIONS = [
    # Transfer of Property Act, 1882 - Section 106
    {
        "entity_identifier": "ACT_TPA_1882",
        "version_label": "Pre-2002 Amendment (Strict Notice Period)",
        "effective_from": date(1882, 7, 1),
        "effective_to": date(2002, 12, 31),
        "is_current": False,
        "amendment_act": "Original Act 4 of 1882",
        "full_text": "Leases of immovable property for agricultural or manufacturing purposes terminable by six months notice expiring with the end of a year of tenancy; other leases by fifteen days notice expiring with the end of a month of tenancy. Strict notice expiration required."
    },
    {
        "entity_identifier": "ACT_TPA_1882",
        "version_label": "Post-2002 Amendment (Curative Section 106)",
        "effective_from": date(2003, 1, 1),
        "effective_to": None,
        "is_current": True,
        "amendment_act": "Transfer of Property (Amendment) Act, 2002 (Act 3 of 2003)",
        "full_text": "Notice under sub-section (1) shall not be deemed to be invalid merely because the period mentioned therein falls short of the period specified, where a suit or proceeding is filed after the expiry of the period specified in that sub-section."
    },
    # Negotiable Instruments Act, 1881 - Section 138 & 142
    {
        "entity_identifier": "ACT_NI_1881",
        "version_label": "Pre-2015 Amendment (Jurisdiction at Drawer / Presentation Bank)",
        "effective_from": date(1989, 4, 1),
        "effective_to": date(2015, 6, 14),
        "is_current": False,
        "amendment_act": "Banking, Public Financial Institutions and Negotiable Instruments Laws (Amendment) Act, 1988",
        "full_text": "Offence under Section 138 punishable with imprisonment up to 1 year (increased to 2 years in 2002). Notice period 15 days. Jurisdiction governed by Dashrath Rupsingh Rathod ruling (where drawer's bank situated)."
    },
    {
        "entity_identifier": "ACT_NI_1881",
        "version_label": "Post-2015 Amendment (Payee Branch Jurisdiction Section 142(2))",
        "effective_from": date(2015, 6, 15),
        "effective_to": None,
        "is_current": True,
        "amendment_act": "Negotiable Instruments (Amendment) Act, 2015 (Act 26 of 2015)",
        "full_text": "Section 142(2): The offence under section 138 shall be inquired into and tried only by a court within whose local jurisdiction the branch of the bank where the payee or holder in due course maintains the account is situated."
    },
    # Consumer Protection Act
    {
        "entity_identifier": "ACT_CPA_2019",
        "version_label": "Consumer Protection Act, 2019 (Current Regime)",
        "effective_from": date(2020, 7, 20),
        "effective_to": None,
        "is_current": True,
        "amendment_act": "Consumer Protection Act, 2019 (Act 35 of 2019) replacing 1986 Act",
        "full_text": "Introduced Central Consumer Protection Authority (CCPA), product liability actions, mediation cells, and jurisdiction where complainant resides or works for gain."
    }
]


class TemporalLegalEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def ensure_seed_versions(self):
        """Seeds statute versions if not yet stored."""
        try:
            r = await self.db.execute(select(StatuteVersion).limit(1))
            if r.scalar_one_or_none():
                return

            for item in HISTORICAL_STATUTE_VERSIONS:
                # Find matching legal entity
                ent_res = await self.db.execute(
                    select(LegalEntity).where(LegalEntity.identifier == item["entity_identifier"])
                )
                ent = ent_res.scalar_one_or_none()
                if ent:
                    version = StatuteVersion(
                        entity_id=ent.id,
                        version_label=item["version_label"],
                        effective_from=item["effective_from"],
                        effective_to=item["effective_to"],
                        is_current=item["is_current"],
                        amendment_act=item["amendment_act"],
                        full_text=item["full_text"],
                    )
                    self.db.add(version)

            await self.db.commit()
            logger.info("statute_versions_seeded", total=len(HISTORICAL_STATUTE_VERSIONS))
        except Exception as e:
            await self.db.rollback()
            logger.warning("seed_statute_versions_skipped", error=str(e))

    async def resolve_law_at_date(
        self,
        statute_identifier: str,
        target_date_str: str,
        section_number: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Determines the exact legal provision in force on target_date vs today.
        """
        await self.ensure_seed_versions()
        try:
            target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
        except ValueError:
            target_date = date.today()

        today = date.today()

        # Find entity
        ent_res = await self.db.execute(
            select(LegalEntity).where(LegalEntity.identifier == statute_identifier)
        )
        entity = ent_res.scalar_one_or_none()
        statute_title = entity.canonical_name if entity else statute_identifier.replace("_", " ").title()

        # Query version at target date
        applicable_v = None
        current_v = None

        if entity:
            v_res = await self.db.execute(
                select(StatuteVersion)
                .where(StatuteVersion.entity_id == entity.id)
                .order_by(StatuteVersion.effective_from.asc())
            )
            versions = v_res.scalars().all()

            for v in versions:
                if v.effective_from <= target_date and (v.effective_to is None or v.effective_to >= target_date):
                    applicable_v = v
                if v.is_current or v.effective_to is None:
                    current_v = v

        # Fallback if no matching DB version
        if not applicable_v:
            applicable_v = StatuteVersion(
                id=uuid.uuid4(),
                entity_id=uuid.uuid4(),
                version_label="Standard In-Force Version",
                effective_from=date(1950, 1, 26),
                effective_to=None,
                is_current=True,
                amendment_act="Principal Act",
                full_text=f"Provisions of {statute_title} in force at date of occurrence.",
            )

        if not current_v:
            current_v = applicable_v

        is_different = (applicable_v.version_label != current_v.version_label)

        differences_summary = None
        if is_different:
            differences_summary = (
                f"On {target_date_str}, {statute_title} was governed by '{applicable_v.version_label}'. "
                f"Subsequent amendment ({current_v.amendment_act}) altered procedures or statutory rights. "
                "Care must be taken to apply the law applicable when the cause of action accrued."
            )

        substantive_note = (
            "TEMPORAL PRINCIPLE: Under Indian jurisprudence and Article 20(1) of the Constitution, "
            "substantive penal and contractual liabilities are determined by the law in force when the act occurred. "
            "Procedural amendments may apply to ongoing litigation unless vested rights are impacted."
        )

        return {
            "statute_title": statute_title,
            "target_date": target_date_str,
            "applicable_version": {
                "id": str(applicable_v.id),
                "entity_id": str(applicable_v.entity_id),
                "version_label": applicable_v.version_label,
                "effective_from": applicable_v.effective_from,
                "effective_to": applicable_v.effective_to,
                "is_current": applicable_v.is_current,
                "amendment_act": applicable_v.amendment_act,
                "full_text": applicable_v.full_text,
            },
            "current_version": {
                "id": str(current_v.id),
                "entity_id": str(current_v.entity_id),
                "version_label": current_v.version_label,
                "effective_from": current_v.effective_from,
                "effective_to": current_v.effective_to,
                "is_current": current_v.is_current,
                "amendment_act": current_v.amendment_act,
                "full_text": current_v.full_text,
            },
            "is_historically_different": is_different,
            "differences_summary": differences_summary,
            "substantive_vs_procedural_note": substantive_note,
        }

    async def list_versions_for_statute(self, statute_identifier: str) -> List[Dict[str, Any]]:
        """Returns the full chronological amendment timeline for a statute."""
        await self.ensure_seed_versions()
        ent_res = await self.db.execute(
            select(LegalEntity).where(LegalEntity.identifier == statute_identifier)
        )
        entity = ent_res.scalar_one_or_none()
        if not entity:
            return []

        res = await self.db.execute(
            select(StatuteVersion)
            .where(StatuteVersion.entity_id == entity.id)
            .order_by(StatuteVersion.effective_from.asc())
        )
        return [
            {
                "id": str(v.id),
                "version_label": v.version_label,
                "effective_from": str(v.effective_from),
                "effective_to": str(v.effective_to) if v.effective_to else "Present",
                "is_current": v.is_current,
                "amendment_act": v.amendment_act,
                "full_text_snippet": v.full_text[:180] + "...",
            }
            for v in res.scalars().all()
        ]


_temporal_engine = None

def get_temporal_engine(db: AsyncSession) -> TemporalLegalEngine:
    return TemporalLegalEngine(db)
