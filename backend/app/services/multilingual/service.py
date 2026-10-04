"""
Multilingual Indian Language Engine.
Supports 11 Indian Languages and 3 Language Modes (legal, simple, very_simple).
Preserves legal terms, names, dates, and amounts with strict safety disclaimers.
"""
from app.prompts.translation.multilingual import MULTILINGUAL_TRANSLATION_PROMPT
from app.services.llm.base import Message
from app.services.llm.router import get_model_router
from app.core.logging import get_logger

logger = get_logger(__name__)

SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English", "native_name": "English", "available": True},
    {"code": "hi", "name": "Hindi", "native_name": "हिन्दी", "available": True},
    {"code": "bn", "name": "Bengali", "native_name": "বাংলা", "available": True},
    {"code": "mr", "name": "Marathi", "native_name": "मराठी", "available": True},
    {"code": "ta", "name": "Tamil", "native_name": "தமிழ்", "available": True},
    {"code": "te", "name": "Telugu", "native_name": "తెలుగు", "available": True},
    {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ", "available": True},
    {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം", "available": True},
    {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી", "available": True},
    {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ", "available": True},
    {"code": "or", "name": "Odia", "native_name": "ଓଡ଼ିଆ", "available": True},
]


class MultilingualService:
    def __init__(self):
        self.router = get_model_router()

    def get_supported_languages(self) -> list[dict]:
        return SUPPORTED_LANGUAGES

    async def translate_text(
        self,
        text: str,
        source_lang: str = "en",
        target_lang: str = "hi",
        mode: str = "simple",  # legal | simple | very_simple
    ) -> dict:
        """
        Translate text into target Indian language adhering to mode rules.
        """
        if not text or not text.strip():
            return {
                "translated_text": "",
                "source_lang": source_lang,
                "target_lang": target_lang,
                "mode": mode,
                "safety_disclaimer": "Translated text is provided for understanding."
            }

        prompt = MULTILINGUAL_TRANSLATION_PROMPT.format(
            source_lang=source_lang,
            target_lang=target_lang,
            mode=mode,
            text=text,
        )

        messages = [
            Message(role="system", content="You are a legal translator for Indian languages. Return strict JSON only."),
            Message(role="user", content=prompt),
        ]

        route = self.router.get_route("translation")
        try:
            return await self.router.provider.complete_json(messages, temperature=route.temperature)
        except Exception as e:
            logger.error("translation_service_failed", error=str(e))
            return {
                "translated_text": text,
                "source_lang": source_lang,
                "target_lang": target_lang,
                "mode": mode,
                "safety_disclaimer": "Translated text is provided for understanding. For formal legal submission, consider using a qualified legal translator or advocate where required.",
                "preserved_terms": [],
                "notes": "Original text returned due to processing note."
            }


_multilingual_service: MultilingualService | None = None


def get_multilingual_service() -> MultilingualService:
    global _multilingual_service
    if _multilingual_service is None:
        _multilingual_service = MultilingualService()
    return _multilingual_service
