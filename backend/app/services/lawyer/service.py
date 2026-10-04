"""
Lawyer Case Package & Escalation Service.
Compiles a structured, high-density brief for advocate review.
"""
from app.prompts.generation.drafter import LAWYER_PACKAGE_PROMPT
from app.services.llm.base import Message
from app.services.llm.router import get_model_router
from app.services.security.injection import PromptInjectionDefender
from app.core.logging import get_logger

logger = get_logger(__name__)


class LawyerEscalationService:
    def __init__(self):
        self.router = get_model_router()

    async def compile_case_package(
        self,
        case_title: str,
        issue_type: str,
        jurisdiction: str,
        urgency: str,
        urgency_reason: str,
        user_description: str,
        people: list[dict],
        timeline: list[dict],
        evidence_summary: str,
        ai_analysis: str,
        user_questions: str,
    ) -> dict:
        """
        Compile an advocate-ready brief package from case data.
        """
        people_str = "\n".join([f"- {p.get('name', 'Unknown')}: {p.get('role', 'Party')}" for p in people]) or "Not specified"
        timeline_str = "\n".join([f"- {e.get('date_display', e.get('date', 'Date'))}: {e.get('title', '')} — {e.get('description', '')}" for e in timeline]) or "No timeline recorded"

        safe_desc = PromptInjectionDefender.wrap_untrusted_data("user_description", user_description)

        prompt = LAWYER_PACKAGE_PROMPT.format(
            case_title=case_title,
            issue_type=issue_type,
            jurisdiction=jurisdiction,
            urgency=urgency,
            urgency_reason=urgency_reason or "Assessed based on limitation period and financial stake",
            user_description=safe_desc,
            people=people_str,
            timeline=timeline_str,
            evidence_summary=evidence_summary or "Documentary records preserved",
            ai_analysis=ai_analysis or "Initial assessment completed",
            user_questions=user_questions or "What is my legal recourse and what notice should be served?",
        )

        messages = [
            Message(role="system", content="You are a legal brief preparer for practicing advocates. Return JSON only."),
            Message(role="user", content=prompt),
        ]

        route = self.router.get_route("complex_reasoning")
        try:
            return await self.router.provider.complete_json(messages, temperature=route.temperature)
        except Exception as e:
            logger.error("lawyer_package_failed", error=str(e))
            return {
                "package_title": f"LEGAL BRIEF: {case_title}",
                "executive_summary": f"Case involving {issue_type} in {jurisdiction}. {user_description[:200]}...",
                "parties_summary": people_str,
                "chronology_summary": timeline_str,
                "evidence_table": [],
                "key_legal_questions_for_counsel": [user_questions or "What remedies are available?"],
                "urgency_level": urgency,
                "recommended_advocate_specialization": "Civil Litigation Advocate"
            }


_lawyer_service: LawyerEscalationService | None = None


def get_lawyer_service() -> LawyerEscalationService:
    global _lawyer_service
    if _lawyer_service is None:
        _lawyer_service = LawyerEscalationService()
    return _lawyer_service
