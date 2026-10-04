"""
Multilingual Translation Router V2 — 11 Indian Languages & 3 Language Modes.
"""
from fastapi import APIRouter
from app.schemas.v2 import TranslationV2Request
from app.services.multilingual.service import get_multilingual_service

router = APIRouter()


@router.get("/languages")
async def list_languages():
    """List all supported Indian languages with native scripts."""
    service = get_multilingual_service()
    return {"languages": service.get_supported_languages()}


@router.post("/")
async def translate_text_v2(data: TranslationV2Request):
    """
    Translate and simplify text in 11 Indian languages with 3 clarity modes:
    - 'legal': formal statutory terminology
    - 'simple': everyday plain language
    - 'very_simple': maximum accessibility for citizens without legal background
    """
    service = get_multilingual_service()
    result = await service.translate_text(
        text=data.text,
        source_lang=data.source_lang,
        target_lang=data.target_lang,
        mode=data.mode,
    )
    return result
