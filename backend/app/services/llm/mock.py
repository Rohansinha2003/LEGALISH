"""Mock LLM provider for development without API keys."""
import json
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

MOCK_TRANSLATION_RESPONSE = {
    "translated_text": "यह दस्तावेज़ एक किरायेदारी समझौता है जो मकान मालिक और किरायेदार के बीच है। इसमें किराए की शर्तें, भुगतान की तारीखें और दोनों पक्षों की ज़िम्मेदारियाँ शामिल हैं।",
    "source_lang": "en",
    "target_lang": "hi"
}


class MockLLMProvider(LLMProvider):
    """Development mock — returns realistic sample responses without calling any API."""

    async def complete(
        self,
        messages: list[Message],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        response_format: str | None = None,
    ) -> LLMResponse:
        logger.info("mock_llm_complete", message_count=len(messages))
        # Detect intent from system prompt
        system = messages[0].content.lower() if messages else ""
        if "translate" in system:
            content = json.dumps(MOCK_TRANSLATION_RESPONSE)
        elif "question" in system or "answer" in system:
            content = json.dumps(MOCK_QA_RESPONSE)
        else:
            content = json.dumps(MOCK_ANALYSIS_RESPONSE)
        return LLMResponse(content=content, model="mock-gpt-4o", usage={"prompt_tokens": 100, "completion_tokens": 300})

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
    if settings.LLM_PROVIDER == "openai":
        from app.services.llm.openai_provider import OpenAIProvider
        return OpenAIProvider()
    return MockLLMProvider()
