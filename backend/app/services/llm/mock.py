"""Mock LLM provider for development without API keys — upgraded for V2."""
import json
import re
from app.services.llm.base import LLMProvider, Message, LLMResponse
from app.core.logging import get_logger

logger = get_logger(__name__)

MOCK_ANALYSIS_RESPONSE = {
    "document_type": "Rental Agreement",
    "summary": "This is a rental agreement between a landlord and a tenant for a residential property. It sets out the terms under which you can stay in the property, how much rent you need to pay, and what both parties are expected to do.",
    "parties": [
        {"name": "Rahul Sharma", "role": "Landlord", "address": "123 MG Road, Bangalore"},
        {"name": "Amit Verma", "role": "Tenant", "address": "456 Koramangala, Bangalore"}
    ],
    "important_dates": [
        {"label": "Agreement Start Date", "date": "01/01/2027", "page": 1},
        {"label": "Agreement End Date", "date": "31/12/2027", "page": 1},
        {"label": "Notice Period", "date": "30 days before termination", "page": 5}
    ],
    "financial_terms": [
        {"label": "Monthly Rent", "amount": "₹15,000", "due_date": "5th of every month", "page": 2},
        {"label": "Security Deposit", "amount": "₹45,000", "notes": "Refundable at end of tenancy", "page": 2},
        {"label": "Maintenance Charge", "amount": "₹2,000/month", "page": 3}
    ],
    "obligations": {
        "your_obligations": [
            {"text": "Pay rent by the 5th of every month", "page": 2},
            {"text": "Maintain the property in good condition", "page": 4},
            {"text": "Not sublet the property without written permission", "page": 6},
            {"text": "Give 30 days notice before vacating", "page": 5}
        ],
        "other_party_obligations": [
            {"text": "Provide the property in habitable condition", "page": 3},
            {"text": "Return security deposit within 30 days of vacating", "page": 2},
            {"text": "Handle major structural repairs", "page": 4}
        ]
    },
    "important_clauses": [
        {"title": "Termination Clause", "summary": "Either party can end this agreement by giving 30 days written notice.", "page": 5, "risk_level": "medium"},
        {"title": "Security Deposit", "summary": "The landlord can deduct from your deposit for unpaid rent or property damage beyond normal wear.", "page": 2, "risk_level": "medium"},
        {"title": "Subletting", "summary": "You cannot rent out any part of the property to someone else without written permission.", "page": 6, "risk_level": "low"}
    ],
    "potential_concerns": [
        {"text": "This clause may be important because it allows the landlord to enter the property with only 24 hours notice. Consider discussing this with the landlord if you want more privacy.", "page": 7, "severity": "low"}
    ],
    "next_steps": [
        "Read the agreement completely before signing",
        "Make sure both parties sign every page",
        "Get a copy of the signed agreement",
        "Document the property condition with photos before moving in",
        "Confirm the security deposit receipt in writing"
    ],
    "citations": [],
    "confidence": "high"
}

MOCK_QA_RESPONSE = {
    "answer": "Based on your uploaded document, the landlord must give 30 days written notice before terminating the agreement. The agreement cannot be terminated immediately without cause. This is stated in Clause 8 on Page 5.",
    "citations": [
        {"page_number": 5, "section": "Clause 8 — Termination", "excerpt": "Either party may terminate this agreement by providing thirty (30) days written notice to the other party."}
    ],
    "confidence": "high",
    "found_in_document": True
}

MOCK_SITUATION_RESPONSE = {
    "factual_summary": "The user entered into a residential tenancy in Karnataka. A security deposit was paid, and the landlord has reportedly withheld the deposit upon move-out citing unauthorized repairs without furnishing receipts.",
    "possible_legal_area": "Tenancy & Rent Dispute / Unlawful Withholding of Security Deposit",
    "urgency": "moderate",
    "urgency_reason": "While there is no immediate eviction threat, statutory and contractual limitation periods apply for monetary claims.",
    "is_emergency": False,
    "emergency_warning": None,
    "important_facts_missing": [
        "Was a formal move-out inspection or handover checklist signed?",
        "Do you have bank transfer receipts for the security deposit?",
        "Has the landlord issued any written notice or invoice for repair costs?"
    ],
    "possible_options": [
        {"title": "Issue a Formal Demand Notice", "description": "Send a written demand via registered post or email giving 15 days to refund the deposit.", "practicality": "high"},
        {"title": "Mediation / Rent Authority", "description": "Approach the Rent Authority under the applicable State Tenancy Act.", "practicality": "medium"},
        {"title": "Consumer / Civil Court Proceeding", "description": "File a claim for refund and compensation if informal resolution fails.", "practicality": "medium"}
    ],
    "evidence_to_preserve": [
        "Signed Rental Agreement",
        "Bank statement showing deposit transfer",
        "WhatsApp / Email exchanges regarding handover and vacating date",
        "Move-out photos or videos showing apartment condition"
    ],
    "lawyer_consultation_recommended": True,
    "lawyer_consultation_reason": "An advocate can draft a formal statutory legal notice to establish formal liability."
}

MOCK_EVIDENCE_RESPONSE = {
    "overall_assessment": "The preserved records provide a coherent narrative of tenancy and payments, but evidence regarding final condition handover is currently absent.",
    "supporting_evidence": [
        {
            "evidence_id": "Bank Receipt #104",
            "observation": "This appears to support the claim that ₹45,000 security deposit was transferred on 01 Jan 2026.",
            "key_detail": "Transfer reference confirms payment to landlord's account"
        },
        {
            "evidence_id": "WhatsApp Chat Export",
            "observation": "This appears to support that the tenant gave 30 days prior notice to vacate by 31 Dec 2026.",
            "key_detail": "Message dated 30 Nov 2026 acknowledged by landlord"
        }
    ],
    "potential_conflicting_evidence": [
        {
            "evidence_id": "Landlord Notice Letter",
            "observation": "This may present a conflict because the landlord claims deductions for wall painting and fixture damage.",
            "reconciliation_advice": "Check move-in inventory photos against normal wear and tear definitions."
        }
    ],
    "missing_evidence": [
        {
            "item": "Handover acknowledgment / Key return receipt",
            "why_needed": "Crucial to establish the exact date possession was returned and landlord accepted keys.",
            "how_to_obtain": "Check if an email or text confirmed receipt of keys on move-out day."
        }
    ],
    "timeline_suggestions": [
        {"date": "2026-01-01", "description": "Deposit transfer completed", "source_evidence": "Bank Receipt #104"},
        {"date": "2026-11-30", "description": "Vacating notice communicated", "source_evidence": "WhatsApp Chat"}
    ]
}

MOCK_TIMELINE_RESPONSE = [
    {
        "date": "2026-01-01",
        "date_display": "01 Jan 2026",
        "is_approximate": False,
        "title": "Rental agreement executed & deposit paid",
        "description": "Agreement signed for 11 months with ₹45,000 refundable security deposit",
        "source": "Rental Agreement Page 1",
        "confidence": "high"
    },
    {
        "date": "2026-11-30",
        "date_display": "30 Nov 2026",
        "is_approximate": False,
        "title": "Notice of vacating delivered",
        "description": "Tenant provided 30 days advance notice to landlord via written message",
        "source": "WhatsApp record",
        "confidence": "high"
    },
    {
        "date": "2026-12-31",
        "date_display": "31 Dec 2026",
        "is_approximate": False,
        "title": "Premises vacated & keys handed over",
        "description": "Tenant vacated premises; requested deposit refund within contractual 30 days",
        "source": "User statement",
        "confidence": "medium"
    },
    {
        "date": "2027-01-20",
        "date_display": "20 Jan 2027",
        "is_approximate": False,
        "title": "Landlord deduction notice received",
        "description": "Landlord refused full refund citing damage expenses without receipts",
        "source": "Notice letter",
        "confidence": "high"
    }
]

MOCK_LEGAL_RESEARCH_RESPONSE = {
    "answer": "Under Indian tenancy jurisprudence and the Transfer of Property Act, 1882, a landlord cannot arbitrarily forfeit a tenant's security deposit without proving actual damages beyond normal wear and tear. Furthermore, under State Tenancy Acts (such as the Karnataka Rent Act), security deposits must be refunded within the statutory or contractually agreed timeframe upon peaceful handover.",
    "legal_summary": "Security deposit is held in trust; deductions require itemized proof of damage, excluding normal wear and tear. Section 108 of Transfer of Property Act, 1882.",
    "citations": [
        {
            "source_title": "Transfer of Property Act, 1882",
            "section": "Section 108(m)",
            "authority": "Parliament of India",
            "excerpt": "The lessee is bound to keep, and on the termination of the lease to restore, the property in as good condition as it was in at the time when he was put into possession, subject only to reasonable wear and tear.",
            "url": "https://www.indiacode.nic.in/handle/123456789/2338",
            "verified": True
        },
        {
            "source_title": "Consumer Protection Act, 2019",
            "section": "Section 2(47)",
            "authority": "Parliament of India",
            "excerpt": "Unfair trade practice includes retaining amounts or refusing refund for services contrary to representations.",
            "url": "https://www.indiacode.nic.in/handle/123456789/15256",
            "verified": True
        }
    ],
    "potential_conflicts": None,
    "why_this_answer": {
        "relevant_case_facts": "The landlord withheld deposit for painting and routine wear without supplying invoices.",
        "applicable_provision": "Section 108(m) of the Transfer of Property Act, 1882",
        "simple_reasoning": "Indian law explicitly protects tenants from bearing the cost of ordinary wear and tear. Unless the landlord can show specific damage caused by you with bills, the deposit must be returned."
    },
    "urgency_assessment": "moderate",
    "next_practical_steps": [
        "Send a formal written demand citing Section 108(m) and request refund within 15 days.",
        "Request itemized vendor receipts for any repair claims exceeding normal wear."
    ]
}

MOCK_DOC_REVIEW_RESPONSE = {
    "overall_readiness": "ready_for_review",
    "readiness_score": 88,
    "summary_findings": "The draft contains the essential parties, recitals, and notice periods. One date consistency note was flagged.",
    "critical_issues": [
        {
            "type": "inconsistent_date",
            "clause_or_location": "Clause 2 (Term)",
            "issue_description": "The agreement states an 11-month term, but the dates specified (01 Jan 2027 to 31 Dec 2027) span 12 months.",
            "recommended_fix": "Change end date to 30 November 2027 if an 11-month agreement is intended, to avoid mandatory registration requirements."
        }
    ],
    "warnings": [
        "Ensure stamp duty is paid in accordance with the Karnataka Stamp Act before execution."
    ],
    "missing_details_to_fill": [
        "Electricity meter current reading at time of possession"
    ]
}

MOCK_LAWYER_PACKAGE_RESPONSE = {
    "package_title": "LEGAL INTAKE BRIEF: Tenancy Security Deposit Dispute",
    "executive_summary": "The client (Tenant) leased residential premises in Bangalore from Landlord under an 11-month agreement. All monthly rentals were cleared on time. Upon vacating on 31 Dec 2026, the Landlord failed to refund the ₹45,000 security deposit, claiming oral damages without furnishing invoices or bills.",
    "parties_summary": "1. Tenant (Client): Amit Verma\n2. Landlord (Opposing Party): Rahul Sharma",
    "chronology_summary": "• 01 Jan 2026: Tenancy started, ₹45,000 paid\n• 30 Nov 2026: 30-day notice served via WhatsApp\n• 31 Dec 2026: Key handed over\n• 20 Jan 2027: Landlord refused full refund",
    "evidence_table": [
        {"item": "Rental Agreement", "type": "Contract", "probative_value": "Shows ₹45,000 refundable deposit term"},
        {"item": "Bank Receipt #104", "type": "Receipt", "probative_value": "Proof of payment"},
        {"item": "WhatsApp Export", "type": "Communication", "probative_value": "Proof of timely 30-day notice"}
    ],
    "key_legal_questions_for_counsel": [
        "Whether a formal statutory demand notice should precede filing before the Rent Controller?",
        "Whether a Consumer Complaint for deficiency of housing service is viable alongside civil recovery?"
    ],
    "urgency_level": "moderate",
    "recommended_advocate_specialization": "Tenancy & Civil Litigation Advocate"
}


class MockLLMProvider(LLMProvider):
    """Development mock — returns realistic sample responses without calling any external API."""

    async def complete(
        self,
        messages: list[Message],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        response_format: str | None = None,
    ) -> LLMResponse:
        logger.info("mock_llm_complete", message_count=len(messages))
        system = messages[0].content.lower() if messages else ""
        user_content = messages[-1].content.lower() if len(messages) > 1 else ""

        if "timeline" in system or "chronologist" in system:
            content = json.dumps(MOCK_TIMELINE_RESPONSE)
        elif "evidence" in system or "probative" in system:
            content = json.dumps(MOCK_EVIDENCE_RESPONSE)
        elif "situation" in system or "intake" in system or "urgency" in system:
            content = json.dumps(MOCK_SITUATION_RESPONSE)
        elif "research" in system or "hierarchy" in system or "authoritative" in system:
            resp = dict(MOCK_LEGAL_RESEARCH_RESPONSE)
            q_text = user_content
            if "<user_question" in user_content:
                try:
                    q_text = user_content.split("<user_question")[1].split("</user_question>")[0].lower()
                except Exception:
                    q_text = user_content

            if "cheque" in q_text or "138" in q_text or "bounce" in q_text:
                resp["answer"] = "Under Section 138 of the Negotiable Instruments Act, 1881, upon receipt of statutory notice for a dishonoured cheque, you typically have 15 days to settle the amount before criminal proceedings can be initiated."
                resp["citations"] = [{
                    "source_title": "Negotiable Instruments Act, 1881",
                    "section": "Section 138",
                    "authority": "Parliament of India",
                    "excerpt": "Where any cheque is returned by the bank unpaid, demand for payment must be made by giving a notice in writing within thirty days of information from bank, and drawer is given 15 days to make payment.",
                    "url": "https://www.indiacode.nic.in/handle/123456789/2237",
                    "verified": True
                }]
            elif "salary" in q_text or "wage" in q_text or "employer" in q_text:
                resp["answer"] = "Under the Payment of Wages Act, 1936, wages must be disbursed within the statutory timeframe (7th or 10th of the following month). Continued delay provides grounds for an application before the Labour Commissioner / Payment of Wages Authority."
                resp["citations"] = [{
                    "source_title": "Payment of Wages Act, 1936",
                    "section": "Section 5 & Section 15",
                    "authority": "Parliament of India",
                    "excerpt": "The wages of every person employed shall be paid before the expiry of the seventh day or tenth day. Application for delayed wages may be filed before the Authority.",
                    "url": "https://www.indiacode.nic.in/handle/123456789/2361",
                    "verified": True
                }]
            content = json.dumps(resp)
        elif "consistency auditor" in system or "review this document" in system:
            content = json.dumps(MOCK_DOC_REVIEW_RESPONSE)
        elif "lawyer case package" in system or "counsel" in system:
            content = json.dumps(MOCK_LAWYER_PACKAGE_RESPONSE)
        elif "translat" in system or "translat" in user_content:
            target_lang = "hi"
            source_lang = "en"
            mode = "simple"

            m_target = re.search(r"Target Language:\s*([a-zA-Z_-]+)", user_content, re.IGNORECASE)
            if m_target:
                target_lang = m_target.group(1).lower()

            m_source = re.search(r"Source Language:\s*([a-zA-Z_-]+)", user_content, re.IGNORECASE)
            if m_source:
                source_lang = m_source.group(1).lower()

            m_mode = re.search(r"Language Mode:\s*([a-zA-Z_-]+)", user_content, re.IGNORECASE)
            if m_mode:
                mode = m_mode.group(1).lower()

            translations = {
                "hi": "यह दस्तावेज़ आपके कानूनी अधिकारों और समझौते की शर्तों को सरल भाषा में स्पष्ट करता है।",
                "hindi": "यह दस्तावेज़ आपके कानूनी अधिकारों और समझौते की शर्तों को सरल भाषा में स्पष्ट करता है।",
                "bn": "এই নথিটি আপনার আইনি অধিকার এবং চুক্তির শর্তাবলী সহজ ভাষায় ব্যাখ্যা করে।",
                "bengali": "এই নথিটি আপনার আইনি অধিকার এবং চুক্তির শর্তাবলী সহজ ভাষায় ব্যাখ্যা করে।",
                "mr": "हा दस्तऐवज तुमचे कायदेशीर हक्क आणि कराराच्या अटी सोप्या भाषेत स्पष्ट करतो.",
                "marathi": "हा दस्तऐवज तुमचे कायदेशीर हक्क आणि कराराच्या अटी सोप्या भाषेत स्पष्ट करतो.",
                "ta": "இந்த ஆவணம் உங்கள் சட்ட உரிமைகள் மற்றும் ஒப்பந்த விதிமுறைகளை எளிய மொழியில் விளக்குகிறது.",
                "tamil": "இந்த ஆவணம் உங்கள் சட்ட உரிமைகள் மற்றும் ஒப்பந்த விதிமுறைகளை எளிய மொழியில் விளக்குகிறது.",
                "te": "ఈ పత్రం మీ చట్టపరమైన హక్కులు మరియు ఒప్పంద నిబంధనలను సరళమైన భాషలో వివరిస్తుంది.",
                "telugu": "ఈ పత్రం మీ చట్టపరమైన హక్కులు మరియు ఒప్పంద నిబంధనలను సరళమైన భాషలో వివరిస్తుంది.",
                "kn": "ಈ ದಾಖಲೆಯು ನಿಮ್ಮ ಕಾನೂನು ಹಕ್ಕುಗಳು ಮತ್ತು ಒಪ್ಪಂದದ ನಿಯಮಗಳನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಸ್ಪಷ್ಟಪಡಿಸುತ್ತದೆ.",
                "kannada": "ಈ ದಾಖಲೆಯು ನಿಮ್ಮ ಕಾನೂನು ಹಕ್ಕುಗಳು ಮತ್ತು ಒಪ್ಪಂದದ ನಿಯಮಗಳನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಸ್ಪಷ್ಟಪಡಿಸುತ್ತದೆ.",
                "ml": "ഈ രേഖ നിങ്ങളുടെ നിയമപരമായ അവകാശങ്ങളും കരാർ നിబంధനകളും ലളിതമായ ഭാഷയിൽ വ്യക്തമാക്കുന്നു.",
                "malayalam": "ഈ രേഖ നിങ്ങളുടെ നിയമപരമായ അവകാശങ്ങളും കരാർ നിబంధനകളും ലളിതമായ ഭാഷയിൽ വ്യക്തമാക്കുന്നു.",
                "gu": "આ દસ્તાવેજ તમારા કાનૂની અધિકારો અને કરારની શરતોને સરળ ભાષામાં સ્પષ્ટ કરે છે.",
                "gujarati": "આ દસ્તાવેજ તમારા કાનૂની અધિકારો અને કરારની શરતોને સરળ ભાષામાં સ્પષ્ટ કરે છે.",
                "pa": "ਇਹ ਦਸਤਾਵੇਜ਼ ਤੁਹਾਡੇ ਕਾਨੂੰਨੀ ਅਧਿਕਾਰਾਂ ਅਤੇ ਸਮਝੌਤੇ ਦੀਆਂ ਸ਼ਰਤਾਂ ਨੂੰ ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਸਪਸ਼ਟ ਕਰਦਾ ਹੈ।",
                "punjabi": "ਇਹ ਦਸਤਾਵੇਜ਼ ਤੁਹਾਡੇ ਕਾਨੂੰਨੀ ਅਧਿਕਾਰਾਂ ਅਤੇ ਸਮਝੌਤੇ ਦੀਆਂ ਸ਼ਰਤਾਂ ਨੂੰ ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਸਪਸ਼ਟ ਕਰਦਾ ਹੈ।",
                "or": "ଏହି ଦଲିଲ ଆପଣଙ୍କର ଆଇନଗତ ଅଧିକାର ଏବଂ ଚୁକ୍ତିନାମାର ସର୍ତ୍ତାବଳୀକୁ ସରଳ ଭାଷାରେ ବୁଝାଇଥାଏ।",
                "odia": "ଏହି ଦଲିଲ ଆପଣଙ୍କର ଆଇନଗତ ଅଧିକାର ଏବଂ ଚୁକ୍ତିନାମାର ସର୍ତ୍ତାବଳୀକୁ ସରଳ ଭାଷାରେ ବୁଝାଇଥାଏ।",
                "en": "This document explains your legal rights and agreement terms in clear, plain language.",
                "english": "This document explains your legal rights and agreement terms in clear, plain language.",
            }

            translated_text = translations.get(target_lang, "यह दस्तावेज़ आपके कानूनी अधिकारों और समझौते की शर्तों को सरल भाषा में स्पष्ट करता है।")

            # Extract preserved terms dynamically from user_content
            preserved = []
            for token in ["Rahul Sharma", "Amit Verma", "₹45,000", "Rs. 45,000", "Rs 45,000", "Rs 25,000", "01/01/2026", "01 Jan 2026", "Section 108", "Section 138"]:
                if token.lower() in user_content.lower():
                    preserved.append(token)
            if not preserved:
                preserved = ["Crucial Terms Preserved"]

            content = json.dumps({
                "translated_text": translated_text,
                "source_lang": source_lang,
                "target_lang": target_lang,
                "mode": mode,
                "safety_disclaimer": "Translated text is provided for understanding. For formal legal submission, consider using a qualified legal translator or advocate where required.",
                "preserved_terms": preserved,
                "notes": f"Adapted accurately in '{mode}' clarity mode with statutory integrity."
            })
        elif "question" in system or "answer" in system:
            content = json.dumps(MOCK_QA_RESPONSE)
        else:
            content = json.dumps(MOCK_ANALYSIS_RESPONSE)

        return LLMResponse(content=content, model="mock-gpt-4o", usage={"prompt_tokens": 150, "completion_tokens": 350})

    async def complete_json(
        self,
        messages: list[Message],
        temperature: float = 0.1,
        max_tokens: int = 4096,
    ) -> dict:
        response = await self.complete(messages, temperature=temperature, max_tokens=max_tokens, response_format="json")
        return json.loads(response.content)


def get_llm_provider() -> LLMProvider:
    from app.core.config import get_settings
    settings = get_settings()
    if settings.LLM_PROVIDER == "openai" and settings.LLM_API_KEY:
        from app.services.llm.openai_provider import OpenAIProvider
        return OpenAIProvider()
    return MockLLMProvider()
