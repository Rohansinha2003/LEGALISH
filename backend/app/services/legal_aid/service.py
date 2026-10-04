"""
Legal Aid Discovery Engine under the Legal Services Authorities Act, 1987.
Identifies eligibility for free legal aid and routes citizens to NALSA, SLSA, and DLSA offices.
"""
from typing import Dict, Any, List, Optional
from app.core.logging import get_logger

logger = get_logger(__name__)

# State-wise annual income ceilings for free legal aid under Section 12(h) of the Act (in INR)
STATE_INCOME_CEILINGS = {
    "delhi": 300000,
    "karnataka": 300000,
    "maharashtra": 300000,
    "tamil nadu": 300000,
    "telangana": 300000,
    "west bengal": 300000,
    "uttar pradesh": 300000,
    "haryana": 300000,
    "punjab": 300000,
    "gujarat": 300000,
    "rajasthan": 300000,
    "bihar": 300000,
    "kerala": 300000,
    "odisha": 300000,
}

LEGAL_AID_AUTHORITIES = [
    {
        "id": "aid_nalsa_national",
        "authority_name": "National Legal Services Authority (NALSA)",
        "state": "National / All India",
        "district": "New Delhi",
        "contact_number": "011-23386176",
        "toll_free_number": "15100",
        "portal_url": "https://nalsa.gov.in",
        "address": "B-Block, Additional Building Complex, Supreme Court of India, New Delhi",
    },
    {
        "id": "aid_karnataka_slsa",
        "authority_name": "Karnataka State Legal Services Authority (KSLSA)",
        "state": "Karnataka",
        "district": "Bengaluru",
        "contact_number": "080-22111714",
        "toll_free_number": "15100",
        "portal_url": "https://kslsa.kar.nic.in",
        "address": "Nyaya Degula, 1st Floor, H. Siddaiah Road, Bengaluru - 560027",
    },
    {
        "id": "aid_delhi_slsa",
        "authority_name": "Delhi State Legal Services Authority (DSLSA)",
        "state": "Delhi",
        "district": "Central Delhi",
        "contact_number": "011-23384781",
        "toll_free_number": "15100",
        "portal_url": "https://dslsa.org",
        "address": "Central Office, Rouse Avenue Court Complex, Pandit Deen Dayal Upadhyaya Marg, New Delhi",
    },
    {
        "id": "aid_maharashtra_slsa",
        "authority_name": "Maharashtra State Legal Services Authority (MSLSA)",
        "state": "Maharashtra",
        "district": "Mumbai",
        "contact_number": "022-22673962",
        "toll_free_number": "15100",
        "portal_url": "https://legalservices.maharashtra.gov.in",
        "address": "High Court PWD Building, Fort, Mumbai - 400032",
    },
    {
        "id": "aid_tamilnadu_slsa",
        "authority_name": "Tamil Nadu State Legal Services Authority (TNSLSA)",
        "state": "Tamil Nadu",
        "district": "Chennai",
        "contact_number": "044-25342834",
        "toll_free_number": "15100",
        "portal_url": "https://tnslsa.tn.gov.in",
        "address": "North Fort Road, High Court Campus, Chennai - 600104",
    },
    {
        "id": "aid_westbengal_slsa",
        "authority_name": "West Bengal State Legal Services Authority",
        "state": "West Bengal",
        "district": "Kolkata",
        "contact_number": "033-22483892",
        "toll_free_number": "15100",
        "portal_url": "https://wbslsa.gov.in",
        "address": "City Civil Court Building, 2 & 3 Kiran Sankar Roy Road, Kolkata - 700001",
    }
]


class LegalAidService:
    def discover_legal_aid(
        self,
        state: str,
        annual_income: Optional[int] = None,
        is_woman_or_child: bool = False,
        is_sc_or_st: bool = False,
        is_disabled_or_workman: bool = False,
    ) -> List[Dict[str, Any]]:
        state_clean = state.strip().lower()
        ceiling = STATE_INCOME_CEILINGS.get(state_clean, 300000)

        # Statutory eligibility logic under Section 12
        is_eligible = False
        reasons = []

        if is_woman_or_child:
            is_eligible = True
            reasons.append("Eligible unconditionally as a woman or child under Section 12(c) of the Legal Services Authorities Act, 1987.")
        elif is_sc_or_st:
            is_eligible = True
            reasons.append("Eligible as a member of Scheduled Caste / Scheduled Tribe under Section 12(a).")
        elif is_disabled_or_workman:
            is_eligible = True
            reasons.append("Eligible as an industrial workman or person with disability under Section 12(e)/12(f).")
        elif annual_income is not None and annual_income <= ceiling:
            is_eligible = True
            reasons.append(f"Eligible based on annual income (₹{annual_income:,} is within state limit of ₹{ceiling:,}) under Section 12(h).")
        elif annual_income is not None:
            reasons.append(f"Annual income ₹{annual_income:,} exceeds the standard state ceiling of ₹{ceiling:,}. However, you may still qualify if a special vulnerability applies.")
        else:
            reasons.append("Income or category details not fully provided. Standard eligibility ceiling in your state is ₹3,00,000 per year.")

        eligibility_summary = " ".join(reasons)

        matched_authorities = []
        for auth in LEGAL_AID_AUTHORITIES:
            if auth["state"].lower() == state_clean or auth["state"] == "National / All India":
                matched_authorities.append({
                    **auth,
                    "eligible": is_eligible,
                    "eligibility_reason": eligibility_summary,
                })

        if not matched_authorities:
            # Fallback to National
            matched_authorities.append({
                **LEGAL_AID_AUTHORITIES[0],
                "eligible": is_eligible,
                "eligibility_reason": eligibility_summary,
            })

        return matched_authorities
