"""
Timeline Builder & Chronology Extraction Service.
Builds chronological timelines from documents, evidence descriptions, and case notes.
"""
import json
from app.prompts.timeline.timeline_extractor import TIMELINE_EXTRACTION_PROMPT
from app.services.llm.base import Message
from app.services.llm.router import get_model_router
from app.services.security.injection import PromptInjectionDefender
from app.core.logging import get_logger

logger = get_logger(__name__)


class TimelineService:
    def __init__(self):
        self.router = get_model_router()

    async def extract_timeline_from_text(
        self,
        text: str,
        existing_events: list[dict] | None = None,
    ) -> list[dict]:
        """Extract chronological events from raw document or notes text."""
        if not text or len(text.strip()) < 10:
            return []

        safe_text = PromptInjectionDefender.wrap_untrusted_data("document_or_evidence_text", text[:12000])

        prompt = TIMELINE_EXTRACTION_PROMPT.format(
            text=safe_text,
            existing_events=json.dumps(existing_events or []),
        )

        messages = [
            Message(role="system", content="You are a legal chronologist. Respond only with a JSON array of events."),
            Message(role="user", content=prompt),
        ]

        route = self.router.get_route("timeline_extraction")
        try:
            res = await self.router.provider.complete(messages, temperature=route.temperature)
            data = json.loads(res.content)
            if isinstance(data, list):
                return data
            return data.get("events", [])
        except Exception as e:
            logger.warning("timeline_extraction_failed", error=str(e))
            return []


_timeline_service: TimelineService | None = None


def get_timeline_service() -> TimelineService:
    global _timeline_service
    if _timeline_service is None:
        _timeline_service = TimelineService()
    return _timeline_service
