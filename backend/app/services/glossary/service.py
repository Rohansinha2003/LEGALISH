"""
Multilingual Legal Terminology Glossary (V3).
Contains plain-language explanations of Indian legal terminology across English, Hindi,
and major regional scripts (Tamil, Bengali, Telugu, Marathi, Kannada).
"""
from typing import Dict, Any, List, Optional

GLOSSARY_DATABASE = [
    {
        "english_term": "Affidavit",
        "hindi_term": "शपथपत्र",
        "regional_terms": {
            "ta": "உறுதிமொழிப் பத்திரம்",
            "bn": "হলফনামা",
            "te": "ప్రమాణ పత్రం",
            "mr": "प्रतिज्ञापत्र",
            "kn": "ಪ್ರಮಾಣ ಪತ್ರ"
        },
        "plain_explanation": "A written statement sworn under oath in the presence of an authorized officer (Oath Commissioner/Notary). Lying on an affidavit is an offence punishable as perjury.",
        "legal_context": "Used in court filings, verification of petitions, and government declaration procedures under the Oaths Act, 1969."
    },
    {
        "english_term": "Vakalatnama",
        "hindi_term": "वकालतनामा",
        "regional_terms": {
            "ta": "வக்காலத்து",
            "bn": "ওকালতনামা",
            "te": "వకాలత్",
            "mr": "वकालतनामा",
            "kn": "ವಕಾಲತ್ತುನಾಮ"
        },
        "plain_explanation": "A formal written document authorizing an advocate to represent and act on your behalf in a court of law or judicial tribunal.",
        "legal_context": "Required under Order III of the Code of Civil Procedure before an advocate can plead on behalf of a litigant."
    },
    {
        "english_term": "Injunction",
        "hindi_term": "व्यादेश (स्टे ऑर्डर)",
        "regional_terms": {
            "ta": "தடை உத்தரவு",
            "bn": "স্থগিতাদেশ",
            "te": "స్టే ఆర్డర్",
            "mr": "मनाई हुकूम",
            "kn": "ತಡೆಯಾಜ್ಞೆ"
        },
        "plain_explanation": "A court order that restrains a party from doing an act (temporary stay) or commands them to restore an earlier status.",
        "legal_context": "Governed by the Specific Relief Act, 1963 and Order 39 of the Code of Civil Procedure."
    },
    {
        "english_term": "Caveat",
        "hindi_term": "कैविएट (सावधानी सूचना)",
        "regional_terms": {
            "ta": "கேவியட் மனு",
            "bn": "ক্যাভিয়েট",
            "te": "కావియట్",
            "mr": "कॅव्हिएट",
            "kn": "ಕ್ಯಾವಿಯಟ್"
        },
        "plain_explanation": "A precautionary notice lodged in court requesting that no order or injunction be passed against you without giving you prior notice and an opportunity to be heard.",
        "legal_context": "Filed under Section 148A of the Code of Civil Procedure; remains valid for 90 days from the date of lodging."
    },
    {
        "english_term": "Bail",
        "hindi_term": "जमानत",
        "regional_terms": {
            "ta": "ஜாமீன்",
            "bn": "জামিন",
            "te": "బెయిల్",
            "mr": "जामीन",
            "kn": "ಜಾಮೀನು"
        },
        "plain_explanation": "Temporary release of an accused person awaiting trial upon providing security or surety guaranteeing their appearance before court.",
        "legal_context": "Classified into Bailable, Non-Bailable, and Anticipatory Bail under the Bharatiya Nagarik Suraksha Sanhita (formerly CrPC)."
    },
    {
        "english_term": "Lok Adalat",
        "hindi_term": "लोक अदालत (जनता की अदालत)",
        "regional_terms": {
            "ta": "மக்கள் நீதிமன்றம்",
            "bn": "লোক আদালত",
            "te": "లోక్ అదాలత్",
            "mr": "लोक न्यायालय",
            "kn": "ಲೋಕ ಅದಾಲತ್"
        },
        "plain_explanation": "A statutory alternative dispute resolution forum where disputes pending before courts or at pre-litigation stage are settled amicably with no court fee.",
        "legal_context": "Established under the Legal Services Authorities Act, 1987. The award passed by a Lok Adalat is final and binding with no appeal."
    }
]


class GlossaryService:
    def list_terms(self, search: Optional[str] = None) -> List[Dict[str, Any]]:
        if not search:
            return GLOSSARY_DATABASE
        q = search.lower().strip()
        return [
            t for t in GLOSSARY_DATABASE
            if q in t["english_term"].lower() or q in t["hindi_term"].lower() or q in t["plain_explanation"].lower()
        ]

    def get_term(self, term: str) -> Optional[Dict[str, Any]]:
        t_clean = term.lower().strip()
        for t in GLOSSARY_DATABASE:
            if t["english_term"].lower() == t_clean:
                return t
        return None
