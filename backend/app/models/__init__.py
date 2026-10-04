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
from sqlalchemy.dialects.postgresql import UUID
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
