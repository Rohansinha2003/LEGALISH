"""
Pydantic schemas for LegalSaathi V4.
Covers Knowledge Graph, Temporal Reasoning, Case-Law & Precedents,
Citations, Obligations, Workflows, Professional Reviews, and Webhooks.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, date


# --- Knowledge Graph Schemas ---
class LegalEntityCreate(BaseModel):
    entity_type: str
    canonical_name: str
    identifier: Optional[str] = None
    jurisdiction: str = "India"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LegalEntityRead(BaseModel):
    id: str
    entity_type: str
    canonical_name: str
    identifier: Optional[str] = None
    jurisdiction: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None


class LegalRelationshipCreate(BaseModel):
    source_entity_id: str
    target_entity_id: str
    relationship_type: str
    statutory_reference: Optional[str] = None
    confidence: float = 1.0


class LegalRelationshipRead(BaseModel):
    id: str
    source_entity_id: str
    target_entity_id: str
    relationship_type: str
    statutory_reference: Optional[str] = None
    confidence: float
    created_at: Optional[datetime] = None


class KnowledgeGraphExploreResponse(BaseModel):
    root_entity: LegalEntityRead
    outgoing_relationships: List[Dict[str, Any]]
    incoming_relationships: List[Dict[str, Any]]
    total_connected: int


# --- Temporal Reasoning Schemas ---
class TemporalQueryRequest(BaseModel):
    statute_identifier: str  # e.g. "ACT_TPA_1882" or "ACT_NI_1881"
    target_date: str  # "YYYY-MM-DD"
    section_number: Optional[str] = None


class StatuteVersionRead(BaseModel):
    id: str
    entity_id: str
    version_label: str
    effective_from: date
    effective_to: Optional[date] = None
    is_current: bool
    amendment_act: Optional[str] = None
    full_text: str


class TemporalLawResponse(BaseModel):
    statute_title: str
    target_date: str
    applicable_version: StatuteVersionRead
    current_version: StatuteVersionRead
    is_historically_different: bool
    differences_summary: Optional[str] = None
    substantive_vs_procedural_note: str


# --- Case-Law & Precedents Schemas ---
class JudgmentSearchQuery(BaseModel):
    query: Optional[str] = None
    section: Optional[str] = None
    court: Optional[str] = None
    legal_concept: Optional[str] = None
    bench: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    limit: int = 10


class JudgmentRead(BaseModel):
    id: str
    case_name: str
    neutral_citation: Optional[str] = None
    court_name: str
    decision_date: date
    bench: Optional[str] = None
    outcome: Optional[str] = None
    headnote: Optional[str] = None
    statutory_provisions: List[str] = Field(default_factory=list)
    source_url: Optional[str] = None
    verified: bool = True


class JudgmentSummaryResponse(BaseModel):
    case_overview: str
    factual_matrix: str
    questions_of_law: List[str]
    appellant_arguments: str
    respondent_arguments: str
    ratio_decidendi: str
    precedents_applied: List[Dict[str, str]]
    operative_decision: str
    legal_principles: List[str]
    limitations: str
    neutral_citation: str
    court: str
    date: str


class JudgmentCompareRequest(BaseModel):
    judgment_id_a: str
    judgment_id_b: str
    legal_issue: Optional[str] = None


class JudgmentCompareResponse(BaseModel):
    issue_analyzed: str
    judgment_a: Dict[str, Any]
    judgment_b: Dict[str, Any]
    core_similarities: List[str]
    divergence_in_reasoning: List[str]
    jurisdictional_distinction: str
    controlling_authority_note: str


# --- Citations Schemas ---
class CitationVerifyRequest(BaseModel):
    citation_text: str
    jurisdiction: Optional[str] = "India"


class CitationVerifyResponse(BaseModel):
    citation_text: str
    is_verified: bool
    source_title: Optional[str] = None
    source_type: Optional[str] = None
    verification_status: str  # "VERIFIED", "UNVERIFIED", "AMBIGUOUS"
    verification_details: str


# --- Research Collections & Memos ---
class ResearchCollectionCreate(BaseModel):
    case_id: Optional[str] = None
    title: str
    description: Optional[str] = None


class ResearchItemCreate(BaseModel):
    entity_type: str
    entity_id: Optional[str] = None
    title: str
    citation: Optional[str] = None
    snippet: Optional[str] = None
    user_notes: Optional[str] = None


class LegalMemoRequest(BaseModel):
    research_question: str
    case_id: Optional[str] = None
    facts_summary: Optional[str] = None
    jurisdiction: str = "India"


class LegalMemoResponse(BaseModel):
    title: str
    research_question: str
    statement_of_facts: str
    issues_framed: List[str]
    applicable_statutes: List[Dict[str, str]]
    binding_precedents: List[Dict[str, str]]
    analysis_and_arguments: str
    counterarguments: str
    conclusion_and_next_steps: str
    disclaimer: str


# --- Document Intelligence & Obligations ---
class DocumentObligationCreate(BaseModel):
    document_id: Optional[str] = None
    obligor: str
    obligee: Optional[str] = None
    obligation_text: str
    obligation_type: str = "general"
    amount_inr: Optional[float] = None
    frequency: Optional[str] = None
    due_date: Optional[date] = None
    source_clause: Optional[str] = None


class DocumentObligationRead(BaseModel):
    id: str
    case_id: str
    document_id: Optional[str] = None
    obligor: str
    obligee: Optional[str] = None
    obligation_text: str
    obligation_type: str
    amount_inr: Optional[float] = None
    frequency: Optional[str] = None
    due_date: Optional[date] = None
    source_clause: Optional[str] = None
    status: str


class CrossDocumentReconciliationResponse(BaseModel):
    case_id: str
    documents_audited: List[str]
    inconsistencies: List[Dict[str, Any]]
    reconciliation_summary: str


# --- Workflows & Approval Gates ---
class WorkflowDefinitionCreate(BaseModel):
    name: str
    category: str
    trigger_type: str
    definition: Dict[str, Any]


class WorkflowExecutionRead(BaseModel):
    id: str
    workflow_id: str
    case_id: str
    current_step: int
    status: str
    requires_human_approval: bool
    approval_details: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None


class WorkflowApprovalDecision(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None
    modified_parameters: Optional[Dict[str, Any]] = None


# --- Professional Lawyer Workspace ---
class LawyerReviewSubmit(BaseModel):
    consultation_id: str
    document_id: str
    review_status: str  # lawyer_edited, lawyer_approved, final
    correction_notes: Optional[str] = None
    verified_clauses: List[str] = Field(default_factory=list)


class LawyerFeedbackCreate(BaseModel):
    lawyer_id: str
    case_id: Optional[str] = None
    ai_output_type: str
    original_ai_text: str
    corrected_text: str
    correction_reason: str


# --- Enterprise Knowledge Base ---
class OrganizationKnowledgeCreate(BaseModel):
    title: str
    doc_type: str  # policy, sop, standard_agreement
    content: str


# --- Webhooks ---
class WebhookSubscriptionCreate(BaseModel):
    target_url: str
    subscribed_events: List[str] = Field(default_factory=list)


# --- Accessibility & Voice ---
class VoiceConversationalTurnRequest(BaseModel):
    case_id: Optional[str] = None
    user_speech_transcript: str
    language: str = "hi"  # hi, en, ta, te, bn
    session_history: List[Dict[str, str]] = Field(default_factory=list)


class VoiceConversationalTurnResponse(BaseModel):
    spoken_reply_text: str
    display_summary: str
    language_detected: str
    procedural_next_step: Optional[str] = None
    disclaimer: str
