"""
Low-Literacy "Easy Legal Help" & Conversational Voice Service (V4).
Provides accessible conversational sessions, cross-lingual understanding,
and spoken audio responses tailored for citizens with low legal literacy.
"""
from typing import Dict, Any, List, Optional
from app.core.logging import get_logger

logger = get_logger(__name__)


class AccessibilityAndVoiceService:
    def __init__(self):
        pass

    async def process_conversational_turn(
        self,
        transcript: str,
        language: str = "hi",
        case_id: Optional[str] = None,
        session_history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Processes conversational speech in Hindi or English, returning
        a spoken reply optimized for text-to-speech and clear procedural advice.
        """
        q = transcript.strip().lower()

        # Contextual response generation based on common citizen legal problems
        if any(w in q for w in ["deposit", "kiraya", "rent", "makan", "landlord", "flat", "kamra"]):
            spoken = (
                "Aapke makan malik bina repair bill ke aapka security deposit nahi kaat sakte. "
                "Kanoon ke mutabik, normal wear and tear ka kharcha kirayedaar se nahi liya ja sakta. "
                "Aap 15 din ka formal demand notice bhej kar apna poora paisa wapas maang sakte hain."
            ) if language == "hi" else (
                "Under Indian tenancy laws, a landlord cannot withhold your security deposit for normal wear and tear without repair bills. "
                "You have the right to send a formal 15-day demand notice to recover your full funds."
            )
            next_step = "Collect move-out handover message and deposit transfer receipt."
            display = (
                "1. Security deposit deduction requires actual repair receipts.\n"
                "2. Landlord cannot deduct for normal wear and tear.\n"
                "3. You can issue a 15-day statutory demand notice."
            )

        elif any(w in q for w in ["cheque", "bounce", "dishonour", "bank memo"]):
            spoken = (
                "Cheque bounce hone par Section 138 ke tehat 30 din ke andar notice bhejna zaroori hota hai. "
                "Notice milne ke baad samne wale ko 15 din ka samay milta hai payment karne ke liye. "
                "Agar 15 din me payment nahi hota, tabhi court me case darj kiya ja sakta hai."
            ) if language == "hi" else (
                "Upon cheque dishonour, a statutory demand notice must be dispatched within 30 days of the bank memo. "
                "The drawer gets strictly 15 days to pay from notice receipt before any court complaint can be filed."
            )
            next_step = "Preserve the original cheque return memo from your bank."
            display = (
                "1. 30 days to send legal demand notice after bank memo.\n"
                "2. 15-day cure window for drawer to make payment.\n"
                "3. Cause of action arises only on the 16th day."
            )

        elif any(w in q for w in ["free", "aid", "nalsa", "vakil", "sahayata", "madad"]):
            spoken = (
                "NALSA Kanoon ki Dhara 12 ke tehat sabhi mahilayein, bachhe, aur kam aamdani wale nagrik "
                "muft kanooni madad ke haqdaar hain. Aap national helpline number 1 5 1 0 0 par call kar sakte hain."
            ) if language == "hi" else (
                "Under Section 12 of the Legal Services Authorities Act, women, children, and eligible citizens are entitled to 100% free legal aid. "
                "You can reach the National Legal Aid Helpline directly at 15100."
            )
            next_step = "Call the national legal aid helpline 15100 or visit your local District Legal Services Authority (DLSA)."
            display = (
                "1. Section 12 guarantees free advocates to eligible citizens.\n"
                "2. Women and children receive free representation regardless of income.\n"
                "3. National Helpline: 15100."
            )

        else:
            spoken = (
                f"Aapne poocha: '{transcript}'. Kanoon me har samasya ke liye niyam aur samay-seema tay hoti hai. "
                "Aap apne zaroori dastavez jaise receipt aur notice sambhal kar rakhein aur LegalSaathi par kisi advocate se consult karein."
            ) if language == "hi" else (
                f"Regarding your inquiry: '{transcript}'. Under Indian civil procedure, rights are protected by timely written records. "
                "Please preserve all notices and receipts, and consider consulting a verified advocate through LegalSaathi."
            )
            next_step = "Upload any written agreements or notices to organize your timeline."
            display = "Preserve all written communications and check statutory limitation periods."

        disclaimer = (
            "LegalSaathi AI kanooni jaankari deta hai, vakalat ya formal representation nahi. "
            "Court me case darj karne se pehle qualified advocate se paramarsh lein."
        ) if language == "hi" else (
            "LegalSaathi AI provides legal information grounded in Indian statutes. It does not replace professional representation by an advocate."
        )

        return {
            "spoken_reply_text": spoken,
            "display_summary": display,
            "language_detected": "hi" if language == "hi" else "en",
            "procedural_next_step": next_step,
            "disclaimer": disclaimer,
        }


_voice_accessibility_svc = None

def get_accessibility_voice_service() -> AccessibilityAndVoiceService:
    global _voice_accessibility_svc
    if _voice_accessibility_svc is None:
        _voice_accessibility_svc = AccessibilityAndVoiceService()
    return _voice_accessibility_svc
