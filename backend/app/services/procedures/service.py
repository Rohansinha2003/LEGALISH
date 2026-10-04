"""
Procedural Explainer Repository (V3).
Plain-language 6-step walkthroughs for common Indian citizen disputes:
- Responding to a Legal Notice
- Cheque Bounce (§138 NI Act) Notice
- Tenancy Deposit Withheld
- Delayed Wages / Salary Dispute
- Defective Product Consumer Complaint
- Unlawful Eviction Threat
"""
from typing import Dict, Any, List, Optional

PROCEDURAL_GUIDES = [
    {
        "slug": "legal-notice-response",
        "title": "What Happens After Receiving a Legal Notice?",
        "category": "notices",
        "summary": "A legal notice is a formal written communication warning of potential legal proceedings. Receiving one does NOT mean you have lost a case; it is your opportunity to resolve the issue before court.",
        "steps": [
            {"step_number": 1, "title": "Check the Clock & Response Window", "description": "Identify the exact deadline stipulated (typically 15 or 30 days). Calculate from the date of physical receipt or email.", "timeframe": "Day 1"},
            {"step_number": 2, "title": "Read Allegations & Separate Facts", "description": "Highlight the specific claims: monetary demands, breach of contract, or termination allegations. Note any factual mistakes.", "timeframe": "Days 1-3"},
            {"step_number": 3, "title": "Preserve All Physical & Digital Evidence", "description": "Do not delete emails, WhatsApp messages, bank statements, or handover receipts related to the dispute.", "timeframe": "Immediate"},
            {"step_number": 4, "title": "Formulate Your Position & Defense", "description": "Determine if you admit part of the claim (e.g. rent due) or dispute it completely (e.g. damages fabricated).", "timeframe": "Days 3-7"},
            {"step_number": 5, "title": "Consult an Advocate for a Formal Reply", "description": "Drafting a reply notice through an advocate creates a binding legal record on your behalf.", "timeframe": "Before Deadline"},
            {"step_number": 6, "title": "Dispatch via Speed Post / Registered AD", "description": "Always preserve proof of dispatch and postal tracking consignment number.", "timeframe": "Deadline Day"}
        ],
        "what_to_do": "Keep the postal envelope as proof of delivery date. Reply within the stated period. Be polite and factual.",
        "what_not_to_do": "Never ignore a legal notice. Never contact the opposing party in rage or make undocumented informal admissions.",
        "faqs": [
            {"q": "Can I be arrested immediately after receiving a civil legal notice?", "a": "No. In civil and commercial matters, a legal notice is simply a precursor to a civil suit or complaint."},
            {"q": "What if the notice has factual errors?", "a": "Your reply notice should specifically deny false allegations paragraph-by-paragraph."}
        ],
        "disclaimer": "This procedural guidance is provided for awareness and does not replace formal advocate consultation."
    },
    {
        "slug": "cheque-bounce-section-138",
        "title": "Cheque Bounce Notice under Section 138 NI Act",
        "category": "commercial",
        "summary": "Section 138 of the Negotiable Instruments Act, 1881 deals with dishonour of cheques for insufficiency of funds. Strict statutory limitation periods apply.",
        "steps": [
            {"step_number": 1, "title": "Verify Cheque Return Memo", "description": "Confirm the bank dishonour reason ('Funds Insufficient', 'Stop Payment', etc.) and memo date.", "timeframe": "Day 1"},
            {"step_number": 2, "title": "Note 30-Day Notice Period", "description": "The payee must send statutory demand notice within 30 days of receiving the bank memo.", "timeframe": "Within 30 days of memo"},
            {"step_number": 3, "title": "15-Day Cure Window for Drawer", "description": "The person who issued the cheque has strictly 15 days from notice receipt to make payment.", "timeframe": "15 Days"},
            {"step_number": 4, "title": "Offence Committed on 16th Day", "description": "If payment is not made within 15 days, cause of action arises on the 16th day.", "timeframe": "Day 16"},
            {"step_number": 5, "title": "Filing Criminal Complaint in Court", "description": "The payee has exactly 1 month from the cause of action to file a complaint before the Magistrate.", "timeframe": "1 Month window"}
        ],
        "what_to_do": "If you issued the cheque and owe the money, pay within the 15-day window to completely avoid criminal liability.",
        "what_not_to_do": "Do not ignore the 15-day notice period. After 15 days, criminal proceedings can be initiated.",
        "faqs": [
            {"q": "Can cheque bounce lead to jail?", "a": "Yes, Section 138 provides for imprisonment up to 2 years, or a fine up to twice the cheque amount, or both."},
            {"q": "What if the cheque was given for security?", "a": "You must establish that there was no existing legally enforceable debt on the date of presentation."}
        ],
        "disclaimer": "Section 138 proceedings are criminal in nature. Engaging a criminal advocate is strongly recommended."
    },
    {
        "slug": "tenancy-security-deposit",
        "title": "Landlord Withholding Security Deposit Without Reason",
        "category": "rent",
        "summary": "Under Indian tenancy laws and the Model Tenancy Act, a security deposit is refundable upon peaceful handover. Landlords cannot deduct for normal wear and tear.",
        "steps": [
            {"step_number": 1, "title": "Document Peaceful Handover", "description": "Take timestamped photos and videos of the empty apartment on the day keys are handed over.", "timeframe": "Move-out Day"},
            {"step_number": 2, "title": "Demand Itemized Repair Invoices", "description": "Request written bills and GST invoices for any alleged repainting or repairs.", "timeframe": "Within 7 Days"},
            {"step_number": 3, "title": "Distinguish Normal Wear and Tear", "description": "Under Section 108 TPA, standard usage aging is the landlord's responsibility, not the tenant's.", "timeframe": "Ongoing"},
            {"step_number": 4, "title": "Send Formal Demand Notice", "description": "Issue a formal written notice demanding refund within 15 days via registered post/email.", "timeframe": "Day 15"},
            {"step_number": 5, "title": "Approach Rent Authority or Consumer Forum", "description": "File before the Rent Court under State Rent Act or Consumer Commission for deficiency in service.", "timeframe": "Day 30+"}
        ],
        "what_to_do": "Preserve bank transfer proofs of deposit payment and written rent receipts.",
        "what_not_to_do": "Do not hand over keys without a written acknowledgement or video recording of property condition.",
        "faqs": [
            {"q": "Can the landlord deduct painting charges automatically?", "a": "Only if specifically agreed in the rental agreement, or if there is extraordinary damage beyond normal wear."}
        ],
        "disclaimer": "Check your applicable State Rent Control Act or Tenancy Act for regional rules."
    }
]


class ProceduralService:
    def list_procedures(self) -> List[Dict[str, Any]]:
        return [
            {
                "slug": p["slug"],
                "title": p["title"],
                "category": p["category"],
                "summary": p["summary"],
            }
            for p in PROCEDURAL_GUIDES
        ]

    def get_procedure(self, slug: str) -> Optional[Dict[str, Any]]:
        for p in PROCEDURAL_GUIDES:
            if p["slug"] == slug:
                return p
        return None
