import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    BigInteger,
    DateTime,
    Date,
    Boolean,
    Numeric,
    ForeignKey,
    JSON,
)
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from pgvector.sqlalchemy import Vector


class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cases = relationship("Case", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    generated_documents = relationship("GeneratedDocument", back_populates="user", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="user", cascade="all, delete-orphan")
    case_notes = relationship("CaseNote", back_populates="user", cascade="all, delete-orphan")
    lawyer_reviews = relationship("LawyerReview", back_populates="user", cascade="all, delete-orphan")


class Case(Base):
    __tablename__ = "cases"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    issue_type = Column(String, nullable=False)  # Employment, Rent/tenant, Property, Consumer complaint, etc.
    description = Column(Text)
    state = Column(String)
    city = Column(String)
    incident_date = Column(Date)
    incident_date_approx = Column(String)
    desired_outcome = Column(Text)
    status = Column(String, nullable=False, default="active")  # active, pending_lawyer, resolved, archived
    urgency = Column(String, nullable=False, default="moderate")  # low, moderate, high, critical
    urgency_reason = Column(Text)
    ai_summary = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="cases")
    documents = relationship("Document", back_populates="case")
    people = relationship("CasePerson", back_populates="case", cascade="all, delete-orphan")
    events = relationship("CaseEvent", back_populates="case", cascade="all, delete-orphan", order_by="CaseEvent.event_date")
    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    evidence_relationships = relationship("EvidenceRelationship", back_populates="case", cascade="all, delete-orphan")
    notes = relationship("CaseNote", back_populates="case", cascade="all, delete-orphan")
    lawyer_reviews = relationship("LawyerReview", back_populates="case", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="case")
    generated_documents = relationship("GeneratedDocument", back_populates="case")


class CasePerson(Base):
    __tablename__ = "case_people"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Landlord, Tenant, Employer, Opposing Party, Witness, etc.
    contact_info = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    case = relationship("Case", back_populates="people")


class CaseEvent(Base):
    __tablename__ = "case_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    event_date = Column(Date)
    date_display = Column(String, nullable=False)  # e.g. "01 Jan 2026", "March 2026 (Approx)"
    is_approximate = Column(Boolean, default=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    source = Column(String)  # 'user', 'document', 'evidence'
    source_id = Column(UUID(as_uuid=True))
    confidence = Column(String, default="high")  # high, medium, low
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    case = relationship("Case", back_populates="events")


class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    evidence_type = Column(String, nullable=False)  # pdf, image, screenshot, email, receipt, bank_statement, notice, etc.
    file_url = Column(String)
    file_size_bytes = Column(BigInteger)
    evidence_date = Column(Date)
    evidence_date_approx = Column(String)
    description = Column(Text)
    related_person_id = Column(UUID(as_uuid=True), ForeignKey("case_people.id", ondelete="SET NULL"))
    related_event_id = Column(UUID(as_uuid=True), ForeignKey("case_events.id", ondelete="SET NULL"))
    source_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"))
    user_notes = Column(Text)
    ai_status = Column(String, default="pending")  # pending, analyzed, error
    ai_relevance = Column(String)  # 'supports_user', 'conflicting', 'neutral'
    ai_observation = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    case = relationship("Case", back_populates="evidence")
    user = relationship("User", back_populates="evidence")


class EvidenceRelationship(Base):
    __tablename__ = "evidence_relationships"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    source_evidence_id = Column(UUID(as_uuid=True), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False)
    target_evidence_id = Column(UUID(as_uuid=True), ForeignKey("evidence.id", ondelete="CASCADE"))
    target_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"))
    relationship_type = Column(String, nullable=False)  # 'refers_to', 'disputes', 'supports', 'replaces'
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    case = relationship("Case", back_populates="evidence_relationships")


class CaseNote(Base):
    __tablename__ = "case_notes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    case = relationship("Case", back_populates="notes")
    user = relationship("User", back_populates="case_notes")


class Document(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_url = Column(String)
    file_size_bytes = Column(BigInteger)
    status = Column(String, nullable=False, default="uploading")
    page_count = Column(Integer)
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="documents")
    case = relationship("Case", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    analysis = relationship("DocumentAnalysis", back_populates="document", uselist=False, cascade="all, delete-orphan")
    entities = relationship("DocumentEntity", back_populates="document", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="document")


class DocumentPage(Base):
    __tablename__ = "document_pages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    raw_text = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    document = relationship("Document", back_populates="pages")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer)
    section = Column(String)
    chunk_index = Column(Integer)
    text = Column(Text, nullable=False)
    token_count = Column(Integer)
    embedding = Column(Vector(1536))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")


class DocumentAnalysis(Base):
    __tablename__ = "document_analysis"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, unique=True)
    document_type = Column(String)
    summary = Column(Text)
    result = Column(JSON)
    confidence = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    document = relationship("Document", back_populates="analysis")


class DocumentEntity(Base):
    __tablename__ = "document_entities"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String, nullable=False)
    value = Column(Text)
    context = Column(Text)
    page_number = Column(Integer)
    confidence = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    document = relationship("Document", back_populates="entities")


class LegalSource(Base):
    __tablename__ = "legal_sources"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # statute, rules, court_judgment, notification, secondary
    jurisdiction = Column(String, nullable=False)  # India, Karnataka, Maharashtra, etc.
    authority = Column(String, nullable=False)
    enactment_date = Column(Date)
    url = Column(String)
    document_version = Column(String, default="1.0")
    hierarchy_rank = Column(Integer, default=1)  # 1: Statute, 2: Rules, 3: Judgment, 4: Notification, 5: Secondary
    summary = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    chunks = relationship("LegalSourceChunk", back_populates="source", cascade="all, delete-orphan")


class LegalSourceChunk(Base):
    __tablename__ = "legal_source_chunks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("legal_sources.id", ondelete="CASCADE"), nullable=False)
    section_number = Column(String)
    section_title = Column(String)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    token_count = Column(Integer)
    embedding = Column(Vector(1536))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    source = relationship("LegalSource", back_populates="chunks")


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=True)
    title = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    document = relationship("Document", back_populates="conversations")
    case = relationship("Case", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    confidence = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    citations = relationship("Citation", back_populates="message", cascade="all, delete-orphan")


class Citation(Base):
    __tablename__ = "citations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    legal_source_id = Column(UUID(as_uuid=True), ForeignKey("legal_sources.id", ondelete="SET NULL"), nullable=True)
    source_title = Column(String)
    source_url = Column(String)
    page_number = Column(Integer)
    section = Column(String)
    excerpt = Column(Text)
    why_reasoning = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    message = relationship("Message", back_populates="citations")


class GeneratedDocument(Base):
    __tablename__ = "generated_documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True)
    doc_type = Column(String, nullable=False)
    title = Column(String)
    facts = Column(JSON)
    content = Column(Text)
    pdf_url = Column(String)
    docx_url = Column(String)
    template_version = Column(String)
    current_version = Column(Integer, default=1)
    review_findings = Column(JSON)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="generated_documents")
    case = relationship("Case", back_populates="generated_documents")
    versions = relationship("DocumentVersion", back_populates="generated_document", cascade="all, delete-orphan", order_by="DocumentVersion.version_number")


class DocumentVersion(Base):
    __tablename__ = "document_versions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    generated_document_id = Column(UUID(as_uuid=True), ForeignKey("generated_documents.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    title = Column(String)
    content = Column(Text, nullable=False)
    facts = Column(JSON)
    change_summary = Column(Text)
    pdf_url = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    generated_document = relationship("GeneratedDocument", back_populates="versions")


class ClauseTemplate(Base):
    __tablename__ = "clause_templates"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clause_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # termination, payment, confidentiality, notice, dispute_resolution, etc.
    description = Column(Text)
    jurisdiction = Column(String, default="India")
    document_type = Column(String, nullable=False)
    version = Column(String, default="1.0")
    risk_level = Column(String, default="low")
    template_text = Column(Text, nullable=False)
    variables = Column(JSON)
    is_standard = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class LawyerReview(Base):
    __tablename__ = "lawyer_reviews"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False, default="requested")  # requested, sent, under_review, completed
    urgency = Column(String, nullable=False, default="moderate")
    lawyer_package = Column(JSON, nullable=False)
    questions_for_lawyer = Column(Text)
    preferred_language = Column(String, default="en")
    notes_for_lawyer = Column(Text)
    review_response = Column(Text)
    assigned_lawyer_name = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    case = relationship("Case", back_populates="lawyer_reviews")
    user = relationship("User", back_populates="lawyer_reviews")


class Translation(Base):
    __tablename__ = "translations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source_lang = Column(String, nullable=False)
    target_lang = Column(String, nullable=False)
    translation_mode = Column(String, nullable=False)  # legal | simple | very_simple
    source_text = Column(Text)
    translated_text = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class PromptVersion(Base):
    __tablename__ = "prompt_versions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prompt_name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    system_prompt = Column(Text, nullable=False)
    template = Column(Text, nullable=False)
    variables = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class AIRun(Base):
    __tablename__ = "ai_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True)
    run_type = Column(String, nullable=False)
    model_name = Column(String, nullable=False)
    prompt_version = Column(String)
    tokens_input = Column(Integer)
    tokens_output = Column(Integer)
    cost_usd = Column(Numeric(10, 6), default=0)
    latency_ms = Column(Integer)
    status = Column(String, nullable=False)
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    action = Column(String, nullable=False)
    resource_type = Column(String)
    resource_id = Column(UUID(as_uuid=True))
    metadata_ = Column("metadata", JSON)
    ip_address = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


# --- V3 Domain Models ---

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    org_type = Column(String, default="ngo")  # ngo, legal_aid, law_firm, business, education
    contact_email = Column(String, nullable=False)
    max_members = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class OrganizationMember(Base):
    __tablename__ = "organization_members"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, default="member")  # admin, staff, member, viewer
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class Role(Base):
    __tablename__ = "roles"
    name = Column(String, primary_key=True)
    description = Column(Text)


class UserRole(Base):
    __tablename__ = "user_roles"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_name = Column(String, ForeignKey("roles.name", ondelete="CASCADE"), primary_key=True)


class Lawyer(Base):
    __tablename__ = "lawyers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    bar_council_id = Column(String, nullable=False, index=True)
    state_bar_council = Column(String, nullable=False)
    enrollment_year = Column(Integer, nullable=False)
    practice_areas = Column(JSON, default=list)  # ["Property", "Tenancy", "Consumer", "Employment"]
    languages = Column(JSON, default=lambda: ["en", "hi"])
    state = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False, index=True)
    years_experience = Column(Integer, default=1)
    consultation_fee = Column(Integer, default=0)  # in INR (0 = pro bono / legal aid)
    verification_status = Column(String, default="pending", index=True)  # pending, under_review, verified, rejected, suspended
    verification_notes = Column(Text)
    bio = Column(Text)
    is_available = Column(Boolean, default=True)
    rating = Column(Numeric(3, 2), default=5.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class LawyerVerification(Base):
    __tablename__ = "lawyer_verifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("lawyers.id", ondelete="CASCADE"), nullable=False)
    id_card_url = Column(Text)
    certificate_url = Column(Text)
    submitted_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="pending")  # pending, under_review, verified, rejected
    admin_feedback = Column(Text)


class Consultation(Base):
    __tablename__ = "consultations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("lawyers.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="requested")  # requested, accepted, in_progress, completed, cancelled
    shared_scopes = Column(JSON, default=lambda: ["summary", "timeline", "documents", "evidence"])
    fee_inr = Column(Integer, default=0)
    meeting_link = Column(Text)
    lawyer_summary = Column(Text)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class LawyerMessage(Base):
    __tablename__ = "lawyer_messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    attachments = Column(JSON, default=list)
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class FactStore(Base):
    __tablename__ = "fact_store"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    fact_key = Column(String, nullable=False)  # e.g. "security_deposit_amount"
    fact_value = Column(Text, nullable=False)
    data_type = Column(String, default="string")  # string, currency, date, person, clause
    source_type = Column(String, nullable=False)  # document, user_input, evidence, inferred
    source_ref = Column(Text)  # e.g. "Rental Agreement, Page 2"
    confidence = Column(String, default="high")  # high, medium, low
    user_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class Deadline(Base):
    __tablename__ = "deadlines"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    due_date = Column(Date, nullable=False)
    source_document = Column(String)
    source_section = Column(String)
    statutory_basis = Column(String)  # e.g. "Section 138 NI Act"
    importance = Column(String, default="high")  # critical, high, moderate, low
    is_uncertain = Column(Boolean, default=False)
    uncertainty_reason = Column(Text)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, nullable=False)  # deadline_approaching, lawyer_review_ready, doc_analyzed, system
    severity = Column(String, default="info")  # info, warning, urgent
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class LegalAidResource(Base):
    __tablename__ = "legal_aid_resources"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    authority_name = Column(String, nullable=False)  # NALSA, State Legal Services Authority, DLSA
    state = Column(String, nullable=False, index=True)
    district = Column(String)
    contact_number = Column(String)
    toll_free_number = Column(String, default="15100")
    portal_url = Column(Text)
    address = Column(Text)
    eligibility_criteria = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class ProceduralExplainer(Base):
    __tablename__ = "procedural_explainers"
    slug = Column(String, primary_key=True)  # e.g. "legal-notice-response"
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # notices, civil_litigation, consumer, rent, criminal
    summary = Column(Text, nullable=False)
    steps = Column(JSON, nullable=False)  # Array of step objects
    what_to_do = Column(Text, nullable=False)
    what_not_to_do = Column(Text, nullable=False)
    faqs = Column(JSON, default=list)
    disclaimer = Column(Text, nullable=False)


class GlossaryTerm(Base):
    __tablename__ = "glossary_terms"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    english_term = Column(String, unique=True, nullable=False, index=True)
    hindi_term = Column(String, nullable=False)
    regional_terms = Column(JSON, default=dict)  # { "ta": "...", "bn": "...", "mr": "..." }
    plain_explanation = Column(Text, nullable=False)
    legal_context = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class Plan(Base):
    __tablename__ = "plans"
    id = Column(String, primary_key=True)  # free, plus, pro, business
    name = Column(String, nullable=False)
    price_inr_monthly = Column(Integer, default=0)
    document_limit = Column(Integer, default=3)
    ai_requests_limit = Column(Integer, default=30)
    voice_minutes_limit = Column(Integer, default=10)
    features = Column(JSON, default=list)


class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(String, ForeignKey("plans.id"), nullable=False)
    status = Column(String, default="active")  # active, past_due, canceled
    current_period_start = Column(DateTime(timezone=True), default=datetime.utcnow)
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class Payment(Base):
    __tablename__ = "payments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("lawyers.id", ondelete="SET NULL"), nullable=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True)
    amount_inr = Column(Integer, nullable=False)
    currency = Column(String, default="INR")
    payment_type = Column(String, nullable=False)  # subscription, lawyer_consultation, doc_generation
    status = Column(String, default="pending")  # pending, success, failed, refunded
    gateway_provider = Column(String, default="mock")  # razorpay, stripe, mock
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class UsageRecord(Base):
    __tablename__ = "usage_records"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    metric = Column(String, nullable=False)  # documents_processed, ai_requests, voice_minutes, translations
    amount = Column(Integer, default=1)
    period_date = Column(Date, default=date.today)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True)
    response_type = Column(String, nullable=False)  # ai_chat, research, translation, draft
    is_helpful = Column(Boolean, nullable=False)
    feedback_text = Column(Text)
    reported_discrepancy = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class AgentRun(Base):
    __tablename__ = "agent_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    orchestrator_goal = Column(Text, nullable=False)
    agents_invoked = Column(JSON, default=list)
    tokens_consumed = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


# --- V4 Domain Models ---

class LegalEntity(Base):
    __tablename__ = "legal_entities"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(50), nullable=False, index=True)  # act, section, rule, judgment, court, judge, concept
    canonical_name = Column(String(500), nullable=False)
    identifier = Column(String(255), unique=True, index=True)
    jurisdiction = Column(String(100), default="India")
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class LegalRelationship(Base):
    __tablename__ = "legal_relationships"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_entity_id = Column(UUID(as_uuid=True), ForeignKey("legal_entities.id", ondelete="CASCADE"), nullable=False, index=True)
    target_entity_id = Column(UUID(as_uuid=True), ForeignKey("legal_entities.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(100), nullable=False, index=True)  # belongs_to, interprets, follows, distinguishes, overrules, amends
    statutory_reference = Column(Text)
    confidence = Column(Numeric(3, 2), default=1.0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class StatuteVersion(Base):
    __tablename__ = "statute_versions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_id = Column(UUID(as_uuid=True), ForeignKey("legal_entities.id", ondelete="CASCADE"), nullable=False)
    version_label = Column(String(100), nullable=False)
    effective_from = Column(Date, nullable=False)
    effective_to = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    amendment_act = Column(String(255))
    full_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class Judgment(Base):
    __tablename__ = "judgments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_name = Column(String(500), nullable=False)
    neutral_citation = Column(String(255), index=True)
    court_name = Column(String(255), nullable=False, index=True)
    decision_date = Column(Date, nullable=False, index=True)
    bench = Column(String(255))
    facts = Column(Text)
    issues = Column(Text)
    arguments_appellant = Column(Text)
    arguments_respondent = Column(Text)
    ratio_decidendi = Column(Text)
    outcome = Column(String(100))
    headnote = Column(Text)
    statutory_provisions = Column(JSON, default=list)
    source_url = Column(Text)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class LegalCitationCatalog(Base):
    __tablename__ = "legal_citations_catalog"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    citation_text = Column(String(255), unique=True, nullable=False, index=True)
    source_type = Column(String(50), nullable=False)
    source_id = Column(UUID(as_uuid=True))
    is_verified = Column(Boolean, default=True)
    verification_source = Column(String(255))
    verified_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class ResearchCollection(Base):
    __tablename__ = "research_collections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class ResearchItem(Base):
    __tablename__ = "research_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    collection_id = Column(UUID(as_uuid=True), ForeignKey("research_collections.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(UUID(as_uuid=True))
    title = Column(String(255), nullable=False)
    citation = Column(String(255))
    snippet = Column(Text)
    user_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class DocumentObligation(Base):
    __tablename__ = "document_obligations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    obligor = Column(String(255), nullable=False)
    obligee = Column(String(255))
    obligation_text = Column(Text, nullable=False)
    obligation_type = Column(String(50), default="general")
    amount_inr = Column(Numeric(12, 2))
    frequency = Column(String(50))
    due_date = Column(Date)
    source_clause = Column(String(255))
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class WorkflowDefinition(Base):
    __tablename__ = "workflow_definitions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    trigger_type = Column(String(100), nullable=False)
    definition = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflow_definitions.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    current_step = Column(Integer, default=1)
    status = Column(String(50), default="in_progress")
    execution_state = Column(JSON, default=dict)
    requires_human_approval = Column(Boolean, default=False)
    approval_details = Column(JSON)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class LawyerDocumentReview(Base):
    __tablename__ = "lawyer_document_reviews"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("generated_documents.id", ondelete="CASCADE"), nullable=False)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("lawyers.id", ondelete="CASCADE"), nullable=False)
    review_status = Column(String(50), default="lawyer_edited")  # lawyer_edited, lawyer_approved, final
    correction_notes = Column(Text)
    verified_clauses = Column(JSON, default=list)
    signed_approval_hash = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class LawyerAIFeedback(Base):
    __tablename__ = "lawyer_ai_feedback"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("lawyers.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"))
    ai_output_type = Column(String(100), nullable=False)
    original_ai_text = Column(Text, nullable=False)
    corrected_text = Column(Text, nullable=False)
    correction_reason = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class OrganizationKnowledgeDocument(Base):
    __tablename__ = "organization_knowledge_documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    doc_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class WebhookSubscription(Base):
    __tablename__ = "webhook_subscriptions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"))
    target_url = Column(Text, nullable=False)
    secret_key = Column(String(255), nullable=False)
    subscribed_events = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("webhook_subscriptions.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSON, nullable=False)
    response_status = Column(Integer)
    delivered_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class EvaluationBenchmarkRun(Base):
    __tablename__ = "evaluation_benchmark_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    benchmark_name = Column(String(100), nullable=False)
    model_version = Column(String(100), nullable=False)
    metrics = Column(JSON, nullable=False)
    pass_rate = Column(Numeric(5, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class HumanExpertEvaluation(Base):
    __tablename__ = "human_expert_evaluations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    rating = Column(String(50), nullable=False)
    feedback_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

