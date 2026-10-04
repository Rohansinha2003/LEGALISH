"""
Neutral Discrepancy and Contradiction Detection Engine.
Compares user claims, timeline events, and uploaded documents.
Uses strictly neutral, non-judgmental language ("There appears to be a discrepancy").
"""
import uuid
import re
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Case, CaseEvent, Document, FactStore
from app.core.logging import get_logger

logger = get_logger(__name__)


class DiscrepancyDetector:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_case_discrepancies(self, case_id: str) -> Dict[str, Any]:
        cid = uuid.UUID(case_id)

        # 1. Fetch case description & events
        case_res = await self.db.execute(select(Case).where(Case.id == cid))
        case = case_res.scalar_one_or_none()

        events_res = await self.db.execute(select(CaseEvent).where(CaseEvent.case_id == cid))
        events = events_res.scalars().all()

        facts_res = await self.db.execute(select(FactStore).where(FactStore.case_id == cid))
        facts = facts_res.scalars().all()

        discrepancies = []

        if not case:
            return {"case_id": case_id, "total_discrepancies": 0, "discrepancies": [], "audit_notes": "Case not found."}

        case_desc_lower = (case.description or "").lower()

        # Check for date discrepancies between user intake and timeline events
        date_pattern = r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b|\b(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})\b"
        mentioned_dates = re.findall(date_pattern, case_desc_lower)
        flattened_dates = [d[0] or d[1] for d in mentioned_dates if d[0] or d[1]]

        # Compare intake dates with event dates
        for ev in events:
            if ev.event_date and flattened_dates:
                ev_str = str(ev.event_date)
                # If there's an approximate mismatch
                if not any(ev_str in d or d in ev_str for d in flattened_dates):
                    discrepancies.append({
                        "discrepancy_id": str(uuid.uuid4())[:8],
                        "claim_or_statement": f"Intake statement mentions '{flattened_dates[0]}'",
                        "source_a": "Initial Case Intake Description",
                        "conflicting_statement": f"Timeline event recorded as '{ev_str}' ({ev.title})",
                        "source_b": "Case Chronology Event",
                        "nature": "date_mismatch",
                        "severity": "moderate",
                        "neutral_observation": (
                            f"There appears to be a slight variation between the date mentioned in your initial description "
                            f"({flattened_dates[0]}) and the timeline entry ({ev_str}). You may wish to clarify which date is verified."
                        )
                    })
                    break

        # Check for monetary amount variations in facts vs description
        amount_pattern = r"(?:rs\.?|inr|₹)\s*([\d,]+)"
        amounts_in_desc = re.findall(amount_pattern, case_desc_lower)
        clean_desc_amounts = [a.replace(",", "") for a in amounts_in_desc]

        for fact in facts:
            if fact.data_type == "currency" or "amount" in fact.fact_key.lower():
                fact_val_clean = re.sub(r"[^\d]", "", fact.fact_value)
                if fact_val_clean and clean_desc_amounts:
                    if fact_val_clean not in clean_desc_amounts:
                        discrepancies.append({
                            "discrepancy_id": str(uuid.uuid4())[:8],
                            "claim_or_statement": f"Fact Store lists {fact.fact_key}: '₹{fact.fact_value}'",
                            "source_a": f"Fact Store ({fact.source_type})",
                            "conflicting_statement": f"Description text indicates: '₹{clean_desc_amounts[0]}'",
                            "source_b": "Case Intake Text",
                            "nature": "amount_mismatch",
                            "severity": "critical",
                            "neutral_observation": (
                                f"A discrepancy was noted between the amount in your facts (₹{fact.fact_value}) "
                                f"and the amount cited in your intake description (₹{clean_desc_amounts[0]}). "
                                "Verifying the exact bank transfer or receipt amount will strengthen your documentation."
                            )
                        })
                        break

        # If no discrepancies detected, provide a clean neutral note
        audit_notes = (
            f"Analyzed {len(events)} timeline events and {len(facts)} structured facts against case narrative. "
            f"{'Found potential discrepancies requiring user clarification.' if discrepancies else 'All verified facts and dates currently align with narrative.'}"
        )

        return {
            "case_id": case_id,
            "total_discrepancies": len(discrepancies),
            "discrepancies": discrepancies,
            "audit_notes": audit_notes,
        }
