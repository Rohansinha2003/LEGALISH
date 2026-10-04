-- ============================================================================
-- LEGAL SAATHI V2 DATABASE UPGRADE MIGRATION
-- Non-breaking migration: Adds Case-centric architecture, Evidence Locker,
-- Timeline, Legal Sources RAG, Versioning, and Lawyer Reviews.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issue_type TEXT NOT NULL, -- Employment, Rent/tenant, Property, Consumer complaint, Loan/debt, Family, Contract, Business, Criminal, Civil, Other
    description TEXT,
    state TEXT,
    city TEXT,
    incident_date DATE,
    incident_date_approx TEXT,
    desired_outcome TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- active, pending_lawyer, resolved, archived
    urgency TEXT NOT NULL DEFAULT 'moderate', -- low, moderate, high, critical
    urgency_reason TEXT,
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_urgency ON cases(urgency);

-- 2. People involved in a case
CREATE TABLE IF NOT EXISTS case_people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- Landlord, Tenant, Employer, Employee, Opposing Counsel, Witness, etc.
    contact_info TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_case_people_case_id ON case_people(case_id);

-- 3. Case Timeline Events
CREATE TABLE IF NOT EXISTS case_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    event_date DATE,
    date_display TEXT NOT NULL, -- formatted or approximate date string
    is_approximate BOOLEAN DEFAULT FALSE,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT, -- 'user', 'document', 'evidence'
    source_id UUID, -- optional reference to document or evidence
    confidence TEXT DEFAULT 'high', -- high, medium, low
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_date ON case_events(event_date);

-- 4. Evidence Locker
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    evidence_type TEXT NOT NULL, -- pdf, image, screenshot, email, receipt, bank_statement, agreement, notice, audio, other
    file_url TEXT,
    file_size_bytes BIGINT,
    evidence_date DATE,
    evidence_date_approx TEXT,
    description TEXT,
    related_person_id UUID REFERENCES case_people(id) ON DELETE SET NULL,
    related_event_id UUID REFERENCES case_events(id) ON DELETE SET NULL,
    source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    user_notes TEXT,
    ai_status TEXT DEFAULT 'pending', -- pending, analyzed, error
    ai_relevance TEXT, -- 'supports_user', 'conflicting', 'neutral'
    ai_observation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_user_id ON evidence(user_id);

-- 5. Evidence Relationships
CREATE TABLE IF NOT EXISTS evidence_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    source_evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    target_evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    target_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- 'refers_to', 'disputes', 'supports', 'replaces'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_evidence_rel_case ON evidence_relationships(case_id);

-- 6. Case Notes
CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON case_notes(case_id);

-- 7. Authoritative Legal Sources Knowledge Base (Dual RAG)
CREATE TABLE IF NOT EXISTS legal_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id TEXT UNIQUE NOT NULL, -- e.g. "ACT_TPA_1882", "RENT_ACT_KARNATAKA_1999"
    title TEXT NOT NULL,
    source_type TEXT NOT NULL, -- statute, rules, court_judgment, notification, secondary
    jurisdiction TEXT NOT NULL, -- 'India', 'Karnataka', 'Maharashtra', 'Delhi', etc.
    authority TEXT NOT NULL, -- 'Parliament of India', 'Supreme Court of India', 'High Court of Karnataka', etc.
    enactment_date DATE,
    url TEXT,
    document_version TEXT DEFAULT '1.0',
    hierarchy_rank INT NOT NULL DEFAULT 1, -- 1: Statute, 2: Rules, 3: Judgment, 4: Notification, 5: Secondary
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_sources_type ON legal_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_legal_sources_jurisdiction ON legal_sources(jurisdiction);

-- 8. Legal Source Chunks (for RAG Retrieval)
CREATE TABLE IF NOT EXISTS legal_source_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES legal_sources(id) ON DELETE CASCADE,
    section_number TEXT,
    section_title TEXT,
    chunk_index INT NOT NULL,
    text TEXT NOT NULL,
    token_count INT,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_chunks_source_id ON legal_source_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_legal_chunks_embedding ON legal_source_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 9. Lawyer Reviews (Escalation)
CREATE TABLE IF NOT EXISTS lawyer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'requested', -- requested, preparing_package, sent, under_review, completed, cancelled
    urgency TEXT NOT NULL DEFAULT 'moderate',
    lawyer_package JSONB NOT NULL, -- structured case summary, dates, people, docs, questions
    questions_for_lawyer TEXT,
    preferred_language TEXT DEFAULT 'en',
    notes_for_lawyer TEXT,
    review_response TEXT,
    assigned_lawyer_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lawyer_reviews_case_id ON lawyer_reviews(case_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_reviews_status ON lawyer_reviews(status);

-- 10. Document Versions (Advanced Generator)
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generated_document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    facts JSONB,
    change_summary TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_doc_versions_gen_doc ON document_versions(generated_document_id);

-- 11. Clause Library
CREATE TABLE IF NOT EXISTS clause_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clause_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- termination, payment, confidentiality, notice, dispute_resolution, jurisdiction, indemnity, force_majeure
    description TEXT,
    jurisdiction TEXT DEFAULT 'India',
    document_type TEXT NOT NULL, -- rental_agreement, employment_contract, legal_notice, consumer_complaint
    version TEXT DEFAULT '1.0',
    risk_level TEXT DEFAULT 'low', -- low, medium, high
    template_text TEXT NOT NULL,
    variables JSONB, -- list of variable placeholders
    is_standard BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clause_category ON clause_templates(category);
CREATE INDEX IF NOT EXISTS idx_clause_doc_type ON clause_templates(document_type);

-- 12. Non-breaking extensions to existing V1 tables:
-- Add case_id to documents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'case_id') THEN
        ALTER TABLE documents ADD COLUMN case_id UUID REFERENCES cases(id) ON DELETE SET NULL;
        CREATE INDEX idx_documents_case_id ON documents(case_id);
    END IF;
END $$;

-- Add case_id to conversations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'case_id') THEN
        ALTER TABLE conversations ADD COLUMN case_id UUID REFERENCES cases(id) ON DELETE SET NULL;
        CREATE INDEX idx_conversations_case_id ON conversations(case_id);
    END IF;
END $$;

-- Add case_id and current_version to generated_documents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'case_id') THEN
        ALTER TABLE generated_documents ADD COLUMN case_id UUID REFERENCES cases(id) ON DELETE SET NULL;
        CREATE INDEX idx_generated_documents_case_id ON generated_documents(case_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'current_version') THEN
        ALTER TABLE generated_documents ADD COLUMN current_version INT DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'review_findings') THEN
        ALTER TABLE generated_documents ADD COLUMN review_findings JSONB;
    END IF;
END $$;

-- Add why_reasoning and legal_source_id to citations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'citations' AND column_name = 'legal_source_id') THEN
        ALTER TABLE citations ADD COLUMN legal_source_id UUID REFERENCES legal_sources(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'citations' AND column_name = 'source_title') THEN
        ALTER TABLE citations ADD COLUMN source_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'citations' AND column_name = 'source_url') THEN
        ALTER TABLE citations ADD COLUMN source_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'citations' AND column_name = 'why_reasoning') THEN
        ALTER TABLE citations ADD COLUMN why_reasoning TEXT;
    END IF;
END $$;

-- 13. AI Runs / Observability & Prompt Versions
CREATE TABLE IF NOT EXISTS prompt_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_name TEXT NOT NULL,
    version TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    template TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prompt_name, version)
);

CREATE TABLE IF NOT EXISTS ai_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    run_type TEXT NOT NULL, -- analysis, chat, translation, generation, evidence, research
    model_name TEXT NOT NULL,
    prompt_version TEXT,
    tokens_input INT,
    tokens_output INT,
    cost_usd NUMERIC(10, 6) DEFAULT 0,
    latency_ms INT,
    status TEXT NOT NULL, -- success, error
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_runs_user ON ai_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_case ON ai_runs(case_id);
