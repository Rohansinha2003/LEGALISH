"""
Hallucination Firewall & Claim-Level Grounding Classifier.
Classifies AI legal assertions into:
- USER PROVIDED
- DOCUMENT DERIVED
- LEGAL SOURCE DERIVED
- AI INFERENCE
- UNCERTAIN

Enforces non-negotiable legal safety guardrails:
1. Blocks false outcome guarantees ("You will win this case").
2. Enforces advocate consultation disclaimers on litigation actions.
3. Downgrades unverified statutory citations to UNCERTAIN.
"""
import re
from typing import List, Dict, Any
from app.services.legal_research.service import AUTHORITATIVE_LEGAL_KNOWLEDGE
from app.core.logging import get_logger

logger = get_logger(__name__)

OUTCOME_GUARANTEE_PATTERNS = [
    r"you will win",
    r"guaranteed win",
    r"guarantee.*win",
    r"court will certainly",
    r"judge will rule in your favor",
    r"surefire claim",
    r"100%\s*(?:chance|win)",
    r"you are guaranteed to get",
]

LITIGATION_ACTION_PATTERNS = [
    r"file a petition",
    r"file an fir",
    r"file a lawsuit",
    r"approach high court",
    r"approach supreme court",
    r"file civil suit",
    r"issue a legal notice",
]


class HallucinationFirewall:
    def __init__(self):
        # Index all authoritative statute titles and sections
        self.known_statute_sections = set()
        for source in AUTHORITATIVE_LEGAL_KNOWLEDGE:
            for sec in source.get("sections", []):
                self.known_statute_sections.add(sec.get("section", "").lower())
                self.known_statute_sections.add(source.get("title", "").lower())

    def audit_response(
        self,
        raw_text: str,
        user_facts: List[Dict[str, Any]],
        document_texts: List[str],
        citations: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Passes raw AI response through claim extraction, source classification,
        and outcome guardrails.
        """
        # Split text into sentences / assertion units
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", raw_text) if len(s.strip()) > 10]
        grounded_claims = []

        all_doc_corpus = " ".join(document_texts).lower()
        all_user_corpus = " ".join([f.get("fact_value", "") + " " + f.get("fact_key", "") for f in user_facts]).lower()

        contains_outcome_guarantee = False
        requires_advocate_disclaimer = False

        for sentence in sentences:
            sentence_lower = sentence.lower()

            # Check outcome guarantee violations
            for pat in OUTCOME_GUARANTEE_PATTERNS:
                if re.search(pat, sentence_lower):
                    contains_outcome_guarantee = True
                    break

            # Check litigation advice
            for pat in LITIGATION_ACTION_PATTERNS:
                if re.search(pat, sentence_lower):
                    requires_advocate_disclaimer = True
                    break

            # Classify claim
            grounding_type = "AI INFERENCE"
            source_ref = None
            confidence = 0.85

            # 1. Check if user-provided
            if any(f.get("fact_value", "").lower() in sentence_lower for f in user_facts if len(f.get("fact_value", "")) > 3):
                grounding_type = "USER PROVIDED"
                source_ref = "Client intake facts"
                confidence = 0.98

            # 2. Check if document-derived
            elif any(word in all_doc_corpus for word in sentence_lower.split() if len(word) > 7):
                grounding_type = "DOCUMENT DERIVED"
                source_ref = "Uploaded case documents"
                confidence = 0.95

            # 3. Check if statutory citation
            statute_match = re.search(r"section\s+\d+[a-z]*|article\s+\d+|act,\s*\d{4}", sentence_lower)
            if statute_match:
                matched_sec = statute_match.group(0)
                # Verify if present in authoritative database
                if any(matched_sec in k or k in matched_sec for k in self.known_statute_sections):
                    grounding_type = "LEGAL SOURCE DERIVED"
                    source_ref = f"Authoritative Indian Statute ({matched_sec.title()})"
                    confidence = 1.0
                else:
                    grounding_type = "UNCERTAIN"
                    source_ref = f"Citation verification pending ({matched_sec.title()})"
                    confidence = 0.60

            grounded_claims.append({
                "claim": sentence,
                "grounding_type": grounding_type,
                "source_reference": source_ref,
                "confidence": confidence,
            })

        # Sanitize text if outcome guarantee detected
        sanitized_text = raw_text
        if contains_outcome_guarantee:
            for pat in OUTCOME_GUARANTEE_PATTERNS:
                sanitized_text = re.sub(
                    pat,
                    "there may be statutory grounds to support",
                    sanitized_text,
                    flags=re.IGNORECASE,
                )

        disclaimer = (
            "DISCLAIMER: LegalSaathi provides legal information and document assistance for understanding. "
            "It does not provide legal representation. Consult a qualified advocate before filing in court."
        )

        return {
            "sanitized_answer": sanitized_text,
            "claim_groundings": grounded_claims,
            "contains_outcome_guarantee": contains_outcome_guarantee,
            "requires_advocate_disclaimer": requires_advocate_disclaimer,
            "disclaimer": disclaimer,
        }


_firewall_instance = None


def get_hallucination_firewall() -> HallucinationFirewall:
    global _firewall_instance
    if _firewall_instance is None:
        _firewall_instance = HallucinationFirewall()
    return _firewall_instance
