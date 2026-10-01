import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, BigInteger, DateTime, ForeignKey, JSON
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

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    generated_documents = relationship("GeneratedDocument", back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
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


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"))
    title = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    document = relationship("Document", back_populates="conversations")
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
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer)
    section = Column(String)
    excerpt = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    message = relationship("Message", back_populates="citations")


class GeneratedDocument(Base):
    __tablename__ = "generated_documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String, nullable=False)
    title = Column(String)
    facts = Column(JSON)
    content = Column(Text)
    pdf_url = Column(String)
    docx_url = Column(String)
    template_version = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="generated_documents")


class Translation(Base):
    __tablename__ = "translations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source_lang = Column(String, nullable=False)
    target_lang = Column(String, nullable=False)
    translation_mode = Column(String, nullable=False)
    source_text = Column(Text)
    translated_text = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    action = Column(String, nullable=False)
    resource_type = Column(String)
    resource_id = Column(UUID(as_uuid=True))
    metadata = Column(JSON)
    ip_address = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
