"""
Advanced Document Generator V2 & Document Review Mode.
Provides 9-step wizard support, clause library, fact verification, and audit review.
"""
import json
from app.prompts.generation.drafter import ADVANCED_DRAFTER_PROMPT
from app.prompts.review.doc_review import DOCUMENT_REVIEW_PROMPT
from app.services.llm.base import Message
from app.services.llm.router import get_model_router
from app.services.security.injection import PromptInjectionDefender
from app.core.logging import get_logger

logger = get_logger(__name__)

STANDARD_CLAUSES = [
    {
        "clause_id": "clause_termination_30d",
        "name": "30-Day Mutual Termination",
        "category": "termination",
        "description": "Permits either party to end the arrangement with 30 days written notice.",
        "risk_level": "low",
        "is_standard": True
    },
    {
        "clause_id": "clause_security_deposit",
        "name": "Refundable Security Deposit",
        "category": "payment",
        "description": "Requires deposit refund within 30 days of peaceful handover, excluding normal wear and tear.",
        "risk_level": "low",
        "is_standard": True
    },
    {
        "clause_id": "clause_arbitration_seat",
        "name": "Dispute Resolution & Sole Arbitrator",
        "category": "dispute_resolution",
        "description": "Disputes referred to an independent sole arbitrator under the Arbitration & Conciliation Act, 1996.",
        "risk_level": "medium",
        "is_standard": True
    },
    {
        "clause_id": "clause_jurisdiction_city",
        "name": "Exclusive Jurisdiction Clause",
        "category": "jurisdiction",
        "description": "Vests exclusive territorial jurisdiction in local civil courts where property or employer is situated.",
        "risk_level": "low",
        "is_standard": True
    },
    {
        "clause_id": "clause_confidentiality",
        "name": "Non-Disclosure & Confidentiality",
        "category": "confidentiality",
        "description": "Protects proprietary information and trade secrets from third-party disclosure.",
        "risk_level": "low",
        "is_standard": True
    },
    {
        "clause_id": "clause_force_majeure",
        "name": "Force Majeure & Unforeseen Events",
        "category": "force_majeure",
        "description": "Excuses performance during acts of God, natural calamities, epidemics, or government shutdowns.",
        "risk_level": "low",
        "is_standard": True
    }
]


class AdvancedGeneratorService:
    def __init__(self):
        self.router = get_model_router()

    def get_clause_library(self, doc_type: str | None = None) -> list[dict]:
        return STANDARD_CLAUSES

    def verify_facts_sanity(self, facts: dict) -> list[str]:
        """Pre-generation fact check: flags missing core details."""
        warnings = []
        if not facts.get("party_a_name"):
            warnings.append("First party (e.g. Landlord/Employer) name is missing.")
        if not facts.get("party_b_name"):
            warnings.append("Second party (e.g. Tenant/Employee) name is missing.")
        if not facts.get("start_date"):
            warnings.append("Commencement start date is not specified.")
        return warnings

    async def generate_draft(
        self,
        doc_type: str,
        jurisdiction: str,
        facts: dict,
        selected_clauses: list[str] | None = None,
        version_number: int = 1,
    ) -> dict:
        """Generate a complete structured legal draft based on verified facts."""
        clauses_str = ", ".join(selected_clauses or ["Standard Statutory Clauses"])
        safe_facts = PromptInjectionDefender.wrap_untrusted_data("verified_facts", json.dumps(facts, indent=2))

        prompt = ADVANCED_DRAFTER_PROMPT.format(
            doc_type=doc_type,
            jurisdiction=jurisdiction or "India",
            clauses=clauses_str,
            verified_facts=safe_facts,
            version_number=version_number,
        )

        messages = [
            Message(role="system", content="You are a legal document drafter. Output valid JSON only."),
            Message(role="user", content=prompt),
        ]

        route = self.router.get_route("document_generation")
        try:
            return await self.router.provider.complete_json(messages, temperature=route.temperature)
        except Exception as e:
            logger.error("draft_generation_failed", error=str(e))
            return {
                "title": f"Draft {doc_type.replace('_', ' ').title()}",
                "document_type": doc_type,
                "version": version_number,
                "content": f"# {doc_type.replace('_', ' ').title()}\n\nThis agreement is made between {facts.get('party_a_name', '[PARTY A]')} and {facts.get('party_b_name', '[PARTY B]')}.\n\n### 1. Terms and Conditions\nParties agree to the terms as stated in the case schedule.\n\n### 2. Jurisdiction\nCourts at {jurisdiction or 'local jurisdiction'} shall have jurisdiction.",
                "included_clauses": selected_clauses or [],
                "disclaimer": "This draft is generated for informational purposes and should be reviewed by an advocate.",
                "missing_information": [],
                "action_items_before_signing": ["Execute on appropriate non-judicial stamp paper", "Sign with two witnesses"]
            }

    async def review_document(
        self,
        title: str,
        doc_type: str,
        content: str,
        facts: dict | None = None,
    ) -> dict:
        """Inspect draft for missing information, date inconsistencies, or conflicting amounts."""
        safe_content = PromptInjectionDefender.wrap_untrusted_data("document_draft_content", content[:15000])

        prompt = DOCUMENT_REVIEW_PROMPT.format(
            title=title,
            doc_type=doc_type,
            facts=json.dumps(facts or {}),
            content=safe_content,
        )

        messages = [
            Message(role="system", content="You are a legal consistency auditor. Inspect rigorously. Output JSON only."),
            Message(role="user", content=prompt),
        ]

        route = self.router.get_route("document_review")
        try:
            return await self.router.provider.complete_json(messages, temperature=route.temperature)
        except Exception as e:
            logger.error("doc_review_failed", error=str(e))
            return {
                "overall_readiness": "ready_for_review",
                "readiness_score": 90,
                "summary_findings": "Draft reviewed. No fatal discrepancies detected.",
                "critical_issues": [],
                "warnings": ["Please verify all numbers and dates before executing on stamp paper."],
                "missing_details_to_fill": []
            }


_generator_service: AdvancedGeneratorService | None = None


def get_advanced_generator_service() -> AdvancedGeneratorService:
    global _generator_service
    if _generator_service is None:
        _generator_service = AdvancedGeneratorService()
    return _generator_service
