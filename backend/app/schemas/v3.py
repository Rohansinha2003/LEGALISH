"""
Pydantic Schemas for LegalSaathi V3 API.
Covers Multi-Agent Orchestration, Fact Store, Deadlines, Contradictions,
Document Comparison, Lawyer Network, Legal Aid, Subscriptions, and Organizations.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date


# --- Orchestrator & Multi-Agent ---
class OrchestratorRunRequest(BaseModel):
    case_id: str
    goal: str
    preferred_language: str = "en"
    clarity_mode: str = "simple"  # legal, simple, very_simple
    max_agent_turns: int = 5


class ClaimGrounding(BaseModel):
    claim: str
    grounding_type: str  # USER PROVIDED, DOCUMENT DERIVED, LEGAL SOURCE DERIVED, AI INFERENCE, UNCERTAIN
    source_reference: Optional[str] = None
    confidence: float = 1.0


class OrchestratorRunResponse(BaseModel):
    run_id: str
    case_id: str
    status: str
    agents_invoked: List[str]
    answer: str
    claim_groundings: List[ClaimGrounding]
    suggested_next_steps: List[str]
    disclaimer: str


# --- Fact Store ---
class FactStoreCreate(BaseModel):
    fact_key: str
    fact_value: str
    data_type: str = "string"  # string, currency, date, person, clause
    source_type: str = "user_input"  # document, user_input, evidence, inferred
    source_ref: Optional[str] = None
    confidence: str = "high"


class FactStoreUpdate(BaseModel):
    fact_value: Optional[str] = None
    user_confirmed: Optional[bool] = None
    confidence: Optional[str] = None


class FactStoreItem(BaseModel):
    id: str
    case_id: str
    fact_key: str
    fact_value: str
    data_type: str
    source_type: str
    source_ref: Optional[str]
    confidence: str
    user_confirmed: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


# --- Deadlines ---
class DeadlineCreate(BaseModel):
    title: str
    due_date: str  # YYYY-MM-DD
    source_document: Optional[str] = None
    source_section: Optional[str] = None
    statutory_basis: Optional[str] = None
    importance: str = "high"
    is_uncertain: bool = False
    uncertainty_reason: Optional[str] = None


class DeadlineUpdate(BaseModel):
    is_completed: Optional[bool] = None
    due_date: Optional[str] = None
    title: Optional[str] = None


class DeadlineItem(BaseModel):
    id: str
    case_id: str
    title: str
    due_date: date
    days_remaining: int
    source_document: Optional[str]
    source_section: Optional[str]
    statutory_basis: Optional[str]
    importance: str
    is_uncertain: bool
    uncertainty_reason: Optional[str]
    is_completed: bool


# --- Contradictions & Discrepancies ---
class DiscrepancyItem(BaseModel):
    discrepancy_id: str
    claim_or_statement: str
    source_a: str
    conflicting_statement: str
    source_b: str
    nature: str  # date_mismatch, amount_mismatch, party_mismatch, obligation_conflict
    severity: str  # critical, moderate, minor
    neutral_observation: str


class ContradictionResult(BaseModel):
    case_id: str
    total_discrepancies: int
    discrepancies: List[DiscrepancyItem]
    audit_notes: str


# --- Document Comparison & Redlining ---
class DocumentComparisonRequest(BaseModel):
    document_id_1: str
    document_id_2: str


class RedlineDiffItem(BaseModel):
    section_title: str
    diff_type: str  # added, removed, modified, unchanged
    text_v1: Optional[str] = None
    text_v2: Optional[str] = None
    explanation: str
    risk_level: str  # low, medium, high


class DocumentComparisonResponse(BaseModel):
    doc_1_title: str
    doc_2_title: str
    summary_of_changes: str
    total_modifications: int
    added_clauses: int
    removed_clauses: int
    modified_clauses: int
    differences: List[RedlineDiffItem]
    risk_warning: Optional[str] = None


# --- Lawyer Marketplace ---
class LawyerProfile(BaseModel):
    id: str
    full_name: str
    bar_council_id: str
    state_bar_council: str
    enrollment_year: int
    practice_areas: List[str]
    languages: List[str]
    state: str
    city: str
    years_experience: int
    consultation_fee: int
    verification_status: str
    bio: Optional[str]
    is_available: bool
    rating: float
    review_count: int


class LawyerSearchQuery(BaseModel):
    state: Optional[str] = None
    city: Optional[str] = None
    practice_area: Optional[str] = None
    language: Optional[str] = None
    max_fee: Optional[int] = None


class LawyerVerificationSubmit(BaseModel):
    bar_council_id: str
    state_bar_council: str
    enrollment_year: int
    id_card_url: str
    certificate_url: Optional[str] = None


class ConsultationCreate(BaseModel):
    case_id: str
    lawyer_id: str
    shared_scopes: List[str] = ["summary", "timeline", "documents", "evidence"]
    initial_message: Optional[str] = None


class ConsultationResponse(BaseModel):
    id: str
    case_id: str
    lawyer_id: str
    lawyer_name: str
    status: str
    fee_inr: int
    shared_scopes: List[str]
    lawyer_brief_summary: Optional[str] = None
    meeting_link: Optional[str] = None
    created_at: Optional[datetime] = None


class LawyerMessageCreate(BaseModel):
    content: str
    attachments: Optional[List[str]] = None


class LawyerMessageItem(BaseModel):
    id: str
    consultation_id: str
    sender_id: str
    sender_role: str
    content: str
    attachments: List[str]
    created_at: Optional[datetime]


# --- Legal Aid & Procedures ---
class LegalAidQuery(BaseModel):
    state: str
    district: Optional[str] = None
    annual_income: Optional[int] = None
    is_woman_or_child: bool = False
    is_sc_or_st: bool = False
    is_disabled_or_workman: bool = False


class LegalAidResourceItem(BaseModel):
    id: str
    authority_name: str
    state: str
    district: Optional[str]
    contact_number: Optional[str]
    toll_free_number: str
    portal_url: Optional[str]
    address: Optional[str]
    eligible: bool
    eligibility_reason: str


class ProceduralStep(BaseModel):
    step_number: int
    title: str
    description: str
    timeframe: Optional[str] = None


class ProceduralExplainerItem(BaseModel):
    slug: str
    title: str
    category: str
    summary: str
    steps: List[ProceduralStep]
    what_to_do: str
    what_not_to_do: str
    faqs: List[Dict[str, str]]
    disclaimer: str


# --- Glossary ---
class GlossaryTermItem(BaseModel):
    english_term: str
    hindi_term: str
    regional_terms: Dict[str, str]
    plain_explanation: str
    legal_context: str


# --- Subscriptions & Billing ---
class PlanItem(BaseModel):
    id: str
    name: str
    price_inr_monthly: int
    document_limit: int
    ai_requests_limit: int
    voice_minutes_limit: int
    features: List[str]


class PaymentCheckoutRequest(BaseModel):
    payment_type: str  # subscription, lawyer_consultation, doc_generation
    plan_id: Optional[str] = None
    lawyer_id: Optional[str] = None
    case_id: Optional[str] = None
    amount_inr: int


class PaymentCheckoutResponse(BaseModel):
    transaction_id: str
    amount_inr: int
    currency: str
    status: str
    payment_url: Optional[str] = None
    message: str


# --- Organizations (Multi-Tenancy) ---
class OrganizationCreate(BaseModel):
    name: str
    slug: str
    org_type: str = "ngo"  # ngo, legal_aid, law_firm, business
    contact_email: str


class OrganizationItem(BaseModel):
    id: str
    name: str
    slug: str
    org_type: str
    contact_email: str
    max_members: int
    is_active: bool
    created_at: Optional[datetime]


# --- Notifications ---
class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    notification_type: str
    severity: str
    read_at: Optional[datetime]
    created_at: Optional[datetime]


# --- Feedback ---
class FeedbackCreate(BaseModel):
    case_id: Optional[str] = None
    response_type: str
    is_helpful: bool
    feedback_text: Optional[str] = None
    reported_discrepancy: Optional[str] = None
