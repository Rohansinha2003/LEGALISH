"""
Risk & Urgency Engine + Legal Situation Analyzer.
Classifies urgency (Low, Moderate, High, Critical), triggers emergency flow,
and powers the adaptive intake interview.
"""
import json
from app.prompts.risk.analyzer import (
    LEGAL_SITUATION_ANALYZER_PROMPT,
    FOLLOW_UP_QUESTIONS_PROMPT,
)
from app.prompts.safety import SAFETY_RULES
from app.services.llm.base import Message
from app.services.llm.router import get_model_router
from app.services.security.injection import PromptInjectionDefender
from app.core.logging import get_logger

logger = get_logger(__name__)

EMERGENCY_KEYWORDS = [
    "arrest", "police station", "fir", "bailable", "custody",
    "domestic violence", "physically assaulted", "suicide",
    "evict tomorrow", "lockout today", "thrown out", "court tomorrow"
]


class RiskService:
    def __init__(self):
        self.router = get_model_router()

    def detect_emergency_heuristics(self, text: str) -> tuple[bool, str | None]:
        """Fast heuristic check for critical high-risk / emergency scenarios."""
        lower = text.lower()
        for kw in EMERGENCY_KEYWORDS:
            if kw in lower:
                return (
                    True,
                    f"Urgent alert: Your description mentions '{kw}'. This matter may carry immediate statutory or physical consequences. Please consult an advocate or emergency legal aid without delay."
                )
        return False, None

    async def analyze_legal_situation(
        self,
        situation_text: str,
        state: str | None = None,
        city: str | None = None,
        incident_date: str | None = None,
        desired_outcome: str | None = None,
    ) -> dict:
        """
        Analyze a user's plain-language issue description.
        Produces factual summary, possible legal area, urgency, missing facts, and options.
        """
        is_emerg, emerg_msg = self.detect_emergency_heuristics(situation_text)

        safe_situation = PromptInjectionDefender.wrap_untrusted_data("user_situation", situation_text)

        prompt = LEGAL_SITUATION_ANALYZER_PROMPT.format(
            user_situation=safe_situation,
            state=state or "Not specified",
            city=city or "Not specified",
            incident_date=incident_date or "Not specified",
            desired_outcome=desired_outcome or "Understand rights and resolve issue",
        )

        messages = [
            Message(role="system", content="You are a legal intake assistant for Indian citizens. Respond only in strict JSON."),
            Message(role="user", content=prompt),
        ]

        route = self.router.get_route("complex_reasoning")
        result = await self.router.provider.complete_json(messages, temperature=route.temperature)

        if is_emerg:
            result["urgency"] = "critical"
            result["is_emergency"] = True
            result["emergency_warning"] = emerg_msg

        return result

    async def generate_follow_up_questions(
        self,
        issue_type: str,
        description: str,
        current_answers: dict | None = None,
    ) -> list[dict]:
        """Generate 3-5 adaptive follow-up questions tailored to missing facts."""
        safe_desc = PromptInjectionDefender.wrap_untrusted_data("description", description)
        prompt = FOLLOW_UP_QUESTIONS_PROMPT.format(
            issue_type=issue_type,
            description=safe_desc,
            current_answers=json.dumps(current_answers or {}),
        )

        messages = [
            Message(role="system", content="You are an adaptive legal interviewer. Return a JSON array."),
            Message(role="user", content=prompt),
        ]

        route = self.router.get_route("simple_extraction")
        try:
            res = await self.router.provider.complete(messages, temperature=route.temperature)
            data = json.loads(res.content)
            if isinstance(data, list):
                return data
            return data.get("questions", [])
        except Exception as e:
            logger.warning("follow_up_questions_failed", error=str(e))
            return [
                {
                    "id": "q1",
                    "question": "Do you have a written contract or agreement signed with the other party?",
                    "why_needed": "Determines contractual vs statutory remedies",
                    "input_type": "boolean",
                    "options": ["Yes", "No"]
                },
                {
                    "id": "q2",
                    "question": "What is the approximate total monetary amount involved in this dispute?",
                    "why_needed": "Determines court jurisdiction (Small causes vs District court)",
                    "input_type": "text"
                },
                {
                    "id": "q3",
                    "question": "Have you or the other party issued any formal written notice or email?",
                    "why_needed": "Establishes whether limitation clock is active",
                    "input_type": "boolean",
                    "options": ["Yes", "No"]
                }
            ]


_risk_service: RiskService | None = None


def get_risk_service() -> RiskService:
    global _risk_service
    if _risk_service is None:
        _risk_service = RiskService()
    return _risk_service
