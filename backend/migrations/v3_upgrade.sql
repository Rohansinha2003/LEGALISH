-- =============================================================================
-- LEGALSAATHI V3 DATABASE MIGRATION SCRIPT
-- Non-breaking schema extension for V3 Digital Legal-Access Platform
-- =============================================================================

-- 1. Organizations & Multi-tenancy (B2B / NGO Mode)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    org_type VARCHAR(50) NOT NULL DEFAULT 'ngo', -- ngo, legal_aid, law_firm, business, education
    contact_email VARCHAR(255) NOT NULL,
    max_members INT NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- admin, staff, member, viewer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 2. Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    name VARCHAR(50) PRIMARY KEY,
    description TEXT
);

INSERT INTO roles (name, description) VALUES
('user', 'Citizen seeking legal assistance'),
('lawyer', 'Practicing advocate verified by Bar Council'),
('org_admin', 'Administrator of an organization/NGO workspace'),
('staff', 'Staff member within an organization'),
('platform_admin', 'LegalSaathi system operator'),
('super_admin', 'Root administrative control')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) REFERENCES roles(name) ON DELETE CASCADE,
    PRIMARY KEY(user_id, role_name)
);

-- 3. Lawyer Marketplace & Verification
CREATE TABLE IF NOT EXISTS lawyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    bar_council_id VARCHAR(100) NOT NULL,
    state_bar_council VARCHAR(100) NOT NULL,
    enrollment_year INT NOT NULL,
    practice_areas JSON NOT NULL DEFAULT '[]', -- Property, Tenancy, Consumer, Employment, Cyber, Family
    languages JSON NOT NULL DEFAULT '["en", "hi"]',
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    years_experience INT NOT NULL DEFAULT 1,
    consultation_fee INT NOT NULL DEFAULT 0, -- in INR (0 = pro bono / legal aid)
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, under_review, verified, rejected, suspended
    verification_notes TEXT,
    bio TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lawyer_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    id_card_url TEXT,
    certificate_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    admin_feedback TEXT
);

CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'requested', -- requested, accepted, in_progress, completed, cancelled
    shared_scopes JSON NOT NULL DEFAULT '["summary", "timeline", "documents", "evidence"]',
    fee_inr INT NOT NULL DEFAULT 0,
    meeting_link TEXT,
    lawyer_summary TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lawyer_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments JSON DEFAULT '[]',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Case Fact Store & Structured Intelligence
CREATE TABLE IF NOT EXISTS fact_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    fact_key VARCHAR(100) NOT NULL, -- e.g. "security_deposit_amount", "rent_agreement_date"
    fact_value TEXT NOT NULL,
    data_type VARCHAR(50) NOT NULL DEFAULT 'string', -- string, currency, date, person, clause
    source_type VARCHAR(50) NOT NULL, -- document, user_input, evidence, inferred
    source_ref TEXT, -- e.g. "Rental Agreement, Page 2"
    confidence VARCHAR(50) NOT NULL DEFAULT 'high', -- high, medium, low
    user_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Deadline Engine & Notification Center
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    source_document VARCHAR(255),
    source_section VARCHAR(255),
    statutory_basis VARCHAR(255), -- e.g. "Section 138 NI Act (15-day notice period)"
    importance VARCHAR(50) NOT NULL DEFAULT 'high', -- critical, high, moderate, low
    is_uncertain BOOLEAN NOT NULL DEFAULT FALSE,
    uncertainty_reason TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- deadline_approaching, lawyer_review_ready, doc_analyzed, system
    severity VARCHAR(50) NOT NULL DEFAULT 'info', -- info, warning, urgent
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Legal Aid Discovery & Procedural Explainers
CREATE TABLE IF NOT EXISTS legal_aid_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authority_name VARCHAR(255) NOT NULL, -- NALSA, State Legal Services Authority, DLSA
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    contact_number VARCHAR(100),
    toll_free_number VARCHAR(100) DEFAULT '15100',
    portal_url TEXT,
    address TEXT,
    eligibility_criteria JSON NOT NULL DEFAULT '[]', -- Income limits, SC/ST, women, industrial workman
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS procedural_explainers (
    slug VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- notices, civil_litigation, consumer, rent, criminal
    summary TEXT NOT NULL,
    steps JSON NOT NULL, -- Array of step objects
    what_to_do TEXT NOT NULL,
    what_not_to_do TEXT NOT NULL,
    faqs JSON NOT NULL DEFAULT '[]',
    disclaimer TEXT NOT NULL
);

-- 7. Multilingual Glossary
CREATE TABLE IF NOT EXISTS glossary_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    english_term VARCHAR(255) UNIQUE NOT NULL,
    hindi_term VARCHAR(255) NOT NULL,
    regional_terms JSON NOT NULL DEFAULT '{}', -- { "ta": "...", "bn": "...", "mr": "..." }
    plain_explanation TEXT NOT NULL,
    legal_context TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Subscriptions, Payments & Usage Quotas
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY, -- free, plus, pro, business
    name VARCHAR(100) NOT NULL,
    price_inr_monthly INT NOT NULL DEFAULT 0,
    document_limit INT NOT NULL DEFAULT 3,
    ai_requests_limit INT NOT NULL DEFAULT 30,
    voice_minutes_limit INT NOT NULL DEFAULT 10,
    features JSON NOT NULL DEFAULT '[]'
);

INSERT INTO plans (id, name, price_inr_monthly, document_limit, ai_requests_limit, voice_minutes_limit, features) VALUES
('free', 'Citizen Free', 0, 3, 30, 10, '["Document Breakdown", "Basic Translation", "Legal Aid Search"]'),
('plus', 'LegalSaathi Plus', 499, 15, 150, 60, '["Case Workspace", "Timeline & Evidence", "Document Redlining", "11 Indian Languages"]'),
('pro', 'LegalSaathi Pro', 1499, 50, 500, 200, '["All Plus Features", "Lawyer Network Access", "Advanced Drafts", "Priority AI"]'),
('business', 'Organization & NGO', 4999, 250, 2500, 1000, '["Multi-member Workspace", "Audit Logs", "Dedicated Support", "Custom Clauses"]')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, past_due, canceled
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES lawyers(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    amount_inr INT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_type VARCHAR(50) NOT NULL, -- subscription, lawyer_consultation, doc_generation
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, success, failed, refunded
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'mock', -- razorpay, stripe, mock
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric VARCHAR(50) NOT NULL, -- documents_processed, ai_requests, voice_minutes, translations
    amount INT NOT NULL DEFAULT 1,
    period_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Immutable Audit Logs & User Feedback
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- document_uploaded, case_created, lawyer_accessed_case, consent_revoked
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    ip_hash VARCHAR(64),
    details JSON DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    response_type VARCHAR(50) NOT NULL, -- ai_chat, research, translation, draft
    is_helpful BOOLEAN NOT NULL,
    feedback_text TEXT,
    reported_discrepancy TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Agent Orchestration Observability
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    orchestrator_goal TEXT NOT NULL,
    agents_invoked JSON NOT NULL DEFAULT '[]',
    tokens_consumed INT DEFAULT 0,
    latency_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
