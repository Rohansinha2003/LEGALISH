"""
Evidence AI Service — evaluates supporting, conflicting, and missing evidence
using cautious, legally sound wording.
"""
import json
from app.prompts.evidence.evidence_ai import EVIDENCE_ANALYSIS_PROMPT
from app.services.llm.base import Message
from app.services.llm.router import get_model_router
from app.services.security.injection import PromptInjectionDefender
from app.core.logging import get_logger

logger = get_logger(__name__)


class EvidenceService:
    def __init__(self):
        self.router = get_model_router()

    async def analyze_evidence_collection(
        self,
        case_title: str,
        issue_type: str,
        user_description: str,
        evidence_items: list[dict],
    ) -> dict:
        """
        Analyze a collection of uploaded evidence against case claims.
        Identifies supporting, conflicting, and missing evidence.
        """
        evidence_summary_lines = []
        for idx, item in enumerate(evidence_items, 1):
            name = item.get("name", f"Evidence #{idx}")
            etype = item.get("evidence_type", "document")
            edate = item.get("evidence_date") or item.get("evidence_date_approx") or "Date unknown"
            desc = item.get("description", "")
            notes = item.get("user_notes", "")
            evidence_summary_lines.append(
                f"[{idx}] {name} (Type: {etype}, Date: {edate}): {desc}. Notes: {notes}"
            )

        formatted_items = "\n".join(evidence_summary_lines) if evidence_summary_lines else "No evidence records uploaded yet."
        safe_evidence = PromptInjectionDefender.wrap_untrusted_data("evidence_records", formatted_items)
        safe_desc = PromptInjectionDefender.wrap_untrusted_data("case_description", user_description)

        prompt = EVIDENCE_ANALYSIS_PROMPT.format(
            case_title=case_title,
            issue_type=issue_type,
            user_description=safe_desc,
            evidence_items=safe_evidence,
        )

        messages = [
            Message(role="system", content="You are a legal evidence analyzer. Use cautious evidentiary wording. Respond only in strict JSON."),
            Message(role="user", content=prompt),
        ]

        route = self.router.get_route("evidence_analysis")
        try:
            return await self.router.provider.complete_json(messages, temperature=route.temperature)
        except Exception as e:
            logger.error("evidence_analysis_failed", error=str(e))
            return {
                "overall_assessment": "Initial evidence recorded. Further verification recommended.",
                "supporting_evidence": [],
                "potential_conflicting_evidence": [],
                "missing_evidence": [
                    {
                        "item": "Formal written acknowledgment or receipt",
                        "why_needed": "Helps substantiate claims with documentary proof",
                        "how_to_obtain": "Review banking records or official communications"
                    }
                ],
                "timeline_suggestions": []
            }


_evidence_service: EvidenceService | None = None


def get_evidence_service() -> EvidenceService:
    global _evidence_service
    if _evidence_service is None:
        _evidence_service = EvidenceService()
    return _evidence_service
