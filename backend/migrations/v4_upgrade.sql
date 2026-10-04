-- ==============================================================================
-- LegalSaathi V4 Migration Schema — Scalable Indian Legal Intelligence & Access
-- Non-breaking addition of Legal Knowledge Graph, Temporal Reasoning, Case-Law,
-- Citations, Obligations, Workflows, Professional Reviews, and Webhooks.
-- ==============================================================================

-- 1. Legal Knowledge Graph Entities
CREATE TABLE IF NOT EXISTS legal_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- act, section, subsection, rule, regulation, notification, judgment, court, judge, concept, procedure, jurisdiction
    canonical_name VARCHAR(500) NOT NULL,
    identifier VARCHAR(255) UNIQUE, -- e.g. "ACT_TPA_1882", "SEC_108_M", "SC_2022_121"
    jurisdiction VARCHAR(100) DEFAULT 'India',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_entities_type ON legal_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_legal_entities_identifier ON legal_entities(identifier);

-- 2. Legal Knowledge Graph Relationships
CREATE TABLE IF NOT EXISTS legal_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    target_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- belongs_to, interprets, follows, distinguishes, overrules, amends, repealed_by, made_under, relates_to
    statutory_reference TEXT,
    confidence NUMERIC(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rel_source ON legal_relationships(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_rel_target ON legal_relationships(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_rel_type ON legal_relationships(relationship_type);

-- 3. Temporal Statute Versions & Amendments
CREATE TABLE IF NOT EXISTS statute_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    version_label VARCHAR(100) NOT NULL, -- e.g. "Original 1882", "Post-2002 Amendment"
    effective_from DATE NOT NULL,
    effective_to DATE, -- NULL if currently in force
    is_current BOOLEAN DEFAULT FALSE,
    amendment_act VARCHAR(255),
    full_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_statute_versions_dates ON statute_versions(effective_from, effective_to);

-- 4. Case-Law & Judgments
CREATE TABLE IF NOT EXISTS judgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_name VARCHAR(500) NOT NULL,
    neutral_citation VARCHAR(255),
    court_name VARCHAR(255) NOT NULL,
    decision_date DATE NOT NULL,
    bench VARCHAR(255),
    facts TEXT,
    issues TEXT,
    arguments_appellant TEXT,
    arguments_respondent TEXT,
    ratio_decidendi TEXT,
    outcome VARCHAR(100),
    headnote TEXT,
    statutory_provisions JSONB DEFAULT '[]'::jsonb,
    source_url TEXT,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_judgments_court ON judgments(court_name);
CREATE INDEX IF NOT EXISTS idx_judgments_date ON judgments(decision_date);
CREATE INDEX IF NOT EXISTS idx_judgments_citation ON judgments(neutral_citation);

-- 5. Verified Citations Repository
CREATE TABLE IF NOT EXISTS legal_citations_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citation_text VARCHAR(255) UNIQUE NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- judgment, statute, notification
    source_id UUID,
    is_verified BOOLEAN DEFAULT TRUE,
    verification_source VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_citations_text ON legal_citations_catalog(citation_text);

-- 6. Research Collections & Items
CREATE TABLE IF NOT EXISTS research_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES research_collections(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- statute, judgment, concept
    entity_id UUID,
    title VARCHAR(255) NOT NULL,
    citation VARCHAR(255),
    snippet TEXT,
    user_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Document Obligations Engine
CREATE TABLE IF NOT EXISTS document_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    obligor VARCHAR(255) NOT NULL,
    obligee VARCHAR(255),
    obligation_text TEXT NOT NULL,
    obligation_type VARCHAR(50) DEFAULT 'general', -- monetary, notice, maintenance, restriction, confidentiality
    amount_inr NUMERIC(12,2),
    frequency VARCHAR(50),
    due_date DATE,
    source_clause VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, complied, breached
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_obligations_case ON document_obligations(case_id);

-- 8. Configurable Legal Workflows & Approval Gates
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL, -- on_notice_received, on_contract_uploaded, on_case_created
    definition JSONB NOT NULL, -- step sequence, conditions, actions
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    current_step INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, awaiting_human_approval, completed, cancelled
    execution_state JSONB DEFAULT '{}'::jsonb,
    requires_human_approval BOOLEAN DEFAULT FALSE,
    approval_details JSONB,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Lawyer Structured Review & Audit Badges
CREATE TABLE IF NOT EXISTS lawyer_document_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES generated_documents(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    review_status VARCHAR(50) NOT NULL DEFAULT 'lawyer_edited', -- lawyer_edited, lawyer_approved, final
    correction_notes TEXT,
    verified_clauses JSONB DEFAULT '[]'::jsonb,
    signed_approval_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Lawyer Evaluation Feedback Loop
CREATE TABLE IF NOT EXISTS lawyer_ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    ai_output_type VARCHAR(100) NOT NULL, -- fact_extraction, risk_analysis, research, draft
    original_ai_text TEXT NOT NULL,
    corrected_text TEXT NOT NULL,
    correction_reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Enterprise / Organization Private Knowledge Base
CREATE TABLE IF NOT EXISTS organization_knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL, -- policy, sop, standard_agreement, guidelines
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_org_knowledge_org ON organization_knowledge_documents(organization_id);

-- 12. Webhooks & Event Bus
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    subscribed_events JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INT,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. AI Benchmark & Human Expert Evaluation
CREATE TABLE IF NOT EXISTS evaluation_benchmark_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benchmark_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    metrics JSONB NOT NULL,
    pass_rate NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS human_expert_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES users(id),
    prompt TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    rating VARCHAR(50) NOT NULL, -- correct, partially_correct, unsupported, citation_incorrect, unsafe
    feedback_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
