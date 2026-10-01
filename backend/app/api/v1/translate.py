"""Translation API — English ↔ Hindi, legal and simple modes."""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Literal
from app.core.database import get_db
from app.models import Translation
from app.services.llm.mock import get_llm_provider
from app.services.llm.base import Message as LLMMessage
from app.prompts import TRANSLATION_PROMPT, SAFETY_RULES
from app.api.v1.auth import get_current_user_id

router = APIRouter()

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
}


class TranslateRequest(BaseModel):
    text: str
    source_lang: Literal["en", "hi"] = "en"
    target_lang: Literal["en", "hi"] = "hi"
    mode: Literal["legal", "simple"] = "simple"
    document_id: str | None = None


@router.post("/")
async def translate(
    req: TranslateRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Translate text between English and Hindi."""
    if req.source_lang == req.target_lang:
        raise HTTPException(status_code=400, detail="Source and target languages must be different.")

    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    if len(req.text) > 10000:
        raise HTTPException(status_code=400, detail="Text too long. Maximum 10,000 characters.")

    llm = get_llm_provider()
    result = await llm.complete_json([
        LLMMessage(role="system", content=TRANSLATION_PROMPT.format(
            safety_rules=SAFETY_RULES,
            source_lang=SUPPORTED_LANGUAGES[req.source_lang],
            target_lang=SUPPORTED_LANGUAGES[req.target_lang],
            mode=req.mode,
            text=req.text,
        )),
        LLMMessage(role="user", content="Please translate the text."),
    ])

    # Save translation record
    translation = Translation(
        user_id=uuid.UUID(user_id),
        document_id=uuid.UUID(req.document_id) if req.document_id else None,
        source_lang=req.source_lang,
        target_lang=req.target_lang,
        translation_mode=req.mode,
        source_text=req.text[:5000],
        translated_text=result.get("translated_text", ""),
    )
    db.add(translation)
    await db.commit()

    return {
        "translated_text": result.get("translated_text", ""),
        "source_lang": req.source_lang,
        "target_lang": req.target_lang,
        "mode": req.mode,
        "notes": result.get("notes"),
        "supported_languages": list(SUPPORTED_LANGUAGES.keys()),
    }


@router.get("/languages")
async def get_supported_languages():
    """Return supported languages — designed to be extensible."""
    return {
        "languages": [
            {"code": "en", "name": "English", "available": True},
            {"code": "hi", "name": "Hindi", "available": True},
            {"code": "bn", "name": "Bengali", "available": False, "coming_soon": True},
            {"code": "mr", "name": "Marathi", "available": False, "coming_soon": True},
            {"code": "ta", "name": "Tamil", "available": False, "coming_soon": True},
            {"code": "te", "name": "Telugu", "available": False, "coming_soon": True},
            {"code": "kn", "name": "Kannada", "available": False, "coming_soon": True},
            {"code": "gu", "name": "Gujarati", "available": False, "coming_soon": True},
        ]
    }
