"""
Pydantic Schemas for LegalSaathi V2 APIs.
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime, date


# --- Case Schemas ---
class CaseCreate(BaseModel):
    title: str = Field(..., min_length=2, description="Title of the case or dispute")
    issue_type: str = Field(..., description="Employment, Rent/tenant, Property, Consumer complaint, etc.")
    description: str = Field(..., min_length=5, description="Free-text narrative of what happened")
    state: Optional[str] = None
    city: Optional[str] = None
    incident_date: Optional[str] = None
    incident_date_approx: Optional[str] = None
    desired_outcome: Optional[str] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    issue_type: Optional[str] = None
    description: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    desired_outcome: Optional[str] = None
    status: Optional[str] = None
    urgency: Optional[str] = None


class CasePersonCreate(BaseModel):
    name: str
    role: str
    contact_info: Optional[str] = None
    notes: Optional[str] = None


class CaseEventCreate(BaseModel):
    event_date: Optional[str] = None
    date_display: str
    is_approximate: bool = False
    title: str
    description: Optional[str] = None
    source: Optional[str] = "user"
    confidence: Optional[str] = "high"


class CaseNoteCreate(BaseModel):
    title: Optional[str] = None
    content: str


# --- Evidence Schemas ---
class EvidenceCreate(BaseModel):
    name: str
    evidence_type: str  # pdf, image, screenshot, email, receipt, bank_statement, notice, etc.
    description: Optional[str] = None
    evidence_date: Optional[str] = None
    evidence_date_approx: Optional[str] = None
    user_notes: Optional[str] = None
    related_person_name: Optional[str] = None
    file_url: Optional[str] = None


class EvidenceAnalyzeRequest(BaseModel):
    pass  # Runs over all evidence associated with the case


# --- Legal Situation Analyzer ---
class SituationAnalyzeRequest(BaseModel):
    situation_text: str
    state: Optional[str] = None
    city: Optional[str] = None
    incident_date: Optional[str] = None
    desired_outcome: Optional[str] = None


# --- Legal Research RAG ---
class LegalResearchRequest(BaseModel):
    question: str
    jurisdiction: Optional[str] = "India"
    case_context: Optional[str] = None


# --- Multilingual Translation ---
class TranslationV2Request(BaseModel):
    text: str
    source_lang: str = "en"
    target_lang: str = "hi"
    mode: str = "simple"  # legal | simple | very_simple
    case_id: Optional[str] = None


# --- Advanced Document Generation & Review ---
class DraftGenerateV2Request(BaseModel):
    doc_type: str
    jurisdiction: str = "India"
    facts: dict[str, Any]
    selected_clauses: Optional[list[str]] = None
    version_number: Optional[int] = 1


class DocumentReviewRequest(BaseModel):
    title: str
    doc_type: str
    content: str
    facts: Optional[dict[str, Any]] = None


# --- Lawyer Review Escalation ---
class LawyerReviewRequest(BaseModel):
    questions_for_lawyer: str
    notes_for_lawyer: Optional[str] = None
    preferred_language: Optional[str] = "en"


# --- Global Search ---
class GlobalSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 20
