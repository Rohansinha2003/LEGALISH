"""
Low-Literacy Accessibility & Voice API Router (V4).
Provides spoken responses and visual summaries for ordinary citizens.
"""
from fastapi import APIRouter, Depends
from app.services.accessibility.service import AccessibilityAndVoiceService
from app.schemas.v4 import VoiceConversationalTurnRequest, VoiceConversationalTurnResponse

router = APIRouter()


@router.post("/voice-turn", response_model=VoiceConversationalTurnResponse)
async def process_voice_turn(
    payload: VoiceConversationalTurnRequest,
):
    """
    Processes speech transcript in Hindi, English, Tamil, Telugu, or Bengali.
    Returns plain conversational text suitable for audio speech synthesis
    alongside simplified bulleted steps.
    """
    service = AccessibilityAndVoiceService()
    result = await service.process_conversational_turn(
        transcript=payload.user_speech_transcript,
        language=payload.language,
        case_id=payload.case_id,
        session_history=payload.session_history,
    )
    return result
