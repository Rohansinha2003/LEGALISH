/**
 * API client — all backend calls go through here.
 * Preserves V1 endpoints and provides comprehensive V2 Case Workspace,
 * Evidence Locker, Timeline, Dual-RAG, Multilingual, and Versioning APIs.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(res.status, body.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ==========================================
// V1 Endpoints (Preserved for compatibility)
// ==========================================
export const documentsApi = {
  upload: async (file: File): Promise<{ id: string; status: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/v1/documents/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new ApiError(res.status, body.detail);
    }
    return res.json();
  },

  list: () => request<DocumentSummary[]>("/api/v1/documents/"),

  status: (id: string) =>
    request<{ id: string; status: string; error_message?: string }>(
      `/api/v1/documents/${id}/status`,
    ),

  delete: (id: string) =>
    request(`/api/v1/documents/${id}`, { method: "DELETE" }),
};

export const analysisApi = {
  get: (documentId: string) =>
    request<AnalysisResult>(`/api/v1/analysis/${documentId}`),
};

export const chatApi = {
  ask: (documentId: string, question: string, conversationId?: string) =>
    request<ChatResponse>("/api/v1/chat/ask", {
      method: "POST",
      body: JSON.stringify({ document_id: documentId, question, conversation_id: conversationId }),
    }),

  history: (conversationId: string) =>
    request<ConversationHistory>(`/api/v1/chat/${conversationId}/history`),
};

export const translateApi = {
  translate: (
    text: string,
    sourceLang: "en" | "hi",
    targetLang: "en" | "hi",
    mode: "legal" | "simple",
    documentId?: string,
  ) =>
    request<TranslationResult>("/api/v1/translate/", {
      method: "POST",
      body: JSON.stringify({
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
        mode,
        document_id: documentId,
      }),
    }),

  languages: () => request<{ languages: Language[] }>("/api/v1/translate/languages"),
};

export const generateApi = {
  types: () => request<{ document_types: DocumentType[] }>("/api/v1/generate/types"),

  generate: (docType: string, facts: Record<string, string>) =>
    request<GeneratedDocumentResult>("/api/v1/generate/", {
      method: "POST",
      body: JSON.stringify({ doc_type: docType, facts }),
    }),

  downloadPdf: (docId: string) =>
    `${API_BASE}/api/v1/generate/${docId}/pdf`,
};

// ==========================================
// V2 Endpoints (Case-centric & Full Upgrade)
// ==========================================

export const casesApi = {
  create: (data: CaseCreateInput) =>
    request<CaseCreateResult>("/api/v2/cases/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => request<CaseSummary[]>("/api/v2/cases/"),

  get: (caseId: string) =>
    request<CaseWorkspace>(`/api/v2/cases/${caseId}`),

  update: (caseId: string, data: Partial<CaseCreateInput>) =>
    request<{ status: string; id: string }>(`/api/v2/cases/${caseId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (caseId: string) =>
    request<{ status: string; id: string }>(`/api/v2/cases/${caseId}`, {
      method: "DELETE",
    }),

  // Timeline
  getTimeline: (caseId: string) =>
    request<TimelineEvent[]>(`/api/v2/cases/${caseId}/timeline`),

  addTimelineEvent: (caseId: string, event: Partial<TimelineEvent>) =>
    request<{ id: string; status: string }>(`/api/v2/cases/${caseId}/timeline`, {
      method: "POST",
      body: JSON.stringify(event),
    }),

  extractTimeline: (caseId: string) =>
    request<{ extracted_count: number; events: TimelineEvent[] }>(
      `/api/v2/cases/${caseId}/timeline/extract`,
      { method: "POST" }
    ),

  // Evidence
  getEvidence: (caseId: string) =>
    request<EvidenceItem[]>(`/api/v2/cases/${caseId}/evidence`),

  addEvidence: (caseId: string, data: Partial<EvidenceItem>) =>
    request<{ id: string; status: string }>(`/api/v2/cases/${caseId}/evidence`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  analyzeEvidence: (caseId: string) =>
    request<EvidenceAnalysis>(`/api/v2/cases/${caseId}/evidence/analyze`, {
      method: "POST",
    }),

  // Legal Research RAG
  research: (caseId: string, question: string, jurisdiction?: string, caseContext?: string) =>
    request<LegalResearchResponse>(`/api/v2/cases/${caseId}/research`, {
      method: "POST",
      body: JSON.stringify({ question, jurisdiction, case_context: caseContext }),
    }),

  // Lawyer Review Escalation
  requestLawyerReview: (caseId: string, questions: string, notes?: string, preferredLang?: string) =>
    request<LawyerReviewResult>(`/api/v2/cases/${caseId}/lawyer-review`, {
      method: "POST",
      body: JSON.stringify({
        questions_for_lawyer: questions,
        notes_for_lawyer: notes,
        preferred_language: preferredLang,
      }),
    }),

  // Notes
  addNote: (caseId: string, title: string, content: string) =>
    request<{ id: string; status: string }>(`/api/v2/cases/${caseId}/notes`, {
      method: "POST",
      body: JSON.stringify({ title, content }),
    }),
};

export const generationV2Api = {
  clauses: (docType?: string) =>
    request<{ clauses: ClauseTemplate[] }>(
      `/api/v2/generate/clauses${docType ? `?doc_type=${docType}` : ""}`
    ),

  verifyFacts: (facts: Record<string, any>) =>
    request<{ valid: boolean; warnings: string[] }>("/api/v2/generate/verify-facts", {
      method: "POST",
      body: JSON.stringify(facts),
    }),

  generate: (data: {
    doc_type: string;
    jurisdiction?: string;
    facts: Record<string, any>;
    selected_clauses?: string[];
    version_number?: number;
    case_id?: string;
  }) =>
    request<{
      id: string;
      title: string;
      content: string;
      current_version: number;
      disclaimer: string;
      included_clauses: string[];
      action_items_before_signing: string[];
    }>(`/api/v2/generate/${data.case_id ? `?case_id=${data.case_id}` : ""}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  review: (data: {
    title: string;
    doc_type: string;
    content: string;
    facts?: Record<string, any>;
  }) =>
    request<DocumentReviewResult>("/api/v2/generate/review", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  versions: (docId: string) =>
    request<DocumentVersionItem[]>(`/api/v2/generate/${docId}/versions`),

  restore: (docId: string, versionNumber: number) =>
    request<{ status: string; current_version: number; content: string }>(
      `/api/v2/generate/${docId}/restore/${versionNumber}`,
      { method: "POST" }
    ),
};

export const translateV2Api = {
  languages: () =>
    request<{ languages: Language[] }>("/api/v2/translate/languages"),

  translate: (
    text: string,
    sourceLang: string,
    targetLang: string,
    mode: "legal" | "simple" | "very_simple"
  ) =>
    request<TranslationV2Result>("/api/v2/translate/", {
      method: "POST",
      body: JSON.stringify({
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
        mode,
      }),
    }),
};

export const searchApi = {
  search: (query: string) =>
    request<GlobalSearchResult>("/api/v2/search/", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),
};

export const adminApi = {
  health: () => request<any>("/api/v2/admin/health"),
  sources: () => request<{ total_sources: number; sources: any[] }>("/api/v2/admin/knowledge-base/sources"),
  stats: () => request<any>("/api/v2/admin/stats"),
};

// ==========================================
// V3 API Clients & Orchestration
// ==========================================
export const orchestratorV3Api = {
  run: (
    caseId: string,
    goalOrOptions?: string | { user_goal?: string; goal?: string; preferred_language?: string; clarity_mode?: string },
    preferredLanguage = "en",
    clarityMode = "simple"
  ) => {
    let goal = "Analyze complete case facts, risks, and next steps";
    let lang = preferredLanguage;
    let mode = clarityMode;
    if (typeof goalOrOptions === "object" && goalOrOptions !== null) {
      goal = goalOrOptions.user_goal || goalOrOptions.goal || goal;
      lang = goalOrOptions.preferred_language || lang;
      mode = goalOrOptions.clarity_mode || mode;
    } else if (typeof goalOrOptions === "string" && goalOrOptions.trim()) {
      goal = goalOrOptions;
    }
    return request<OrchestratorRunResponse>("/api/v3/orchestrator/run", {
      method: "POST",
      body: JSON.stringify({
        case_id: caseId,
        goal,
        preferred_language: lang,
        clarity_mode: mode,
      }),
    });
  },
  runs: (caseId: string) =>
    request<any[]>(`/api/v3/orchestrator/runs/${caseId}`),
};

export const intelligenceV3Api = {
  getFacts: (caseId: string) =>
    request<FactStoreItem[]>(`/api/v3/cases/${caseId}/facts`),

  addFact: (caseId: string, data: { fact_key: string; fact_value: string; data_type?: string; source_type?: string; source_ref?: string }) =>
    request<FactStoreItem>(`/api/v3/cases/${caseId}/facts`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateFact: (caseId: string, factId: string, data: { fact_value?: string; user_confirmed?: boolean; confidence?: string }) =>
    request<FactStoreItem>(`/api/v3/cases/${caseId}/facts/${factId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getDeadlines: (caseId: string) =>
    request<DeadlineItem[]>(`/api/v3/cases/${caseId}/deadlines`),

  createDeadline: (caseId: string, data: { title: string; due_date: string; statutory_basis?: string; importance?: string }) =>
    request<DeadlineItem>(`/api/v3/cases/${caseId}/deadlines`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateDeadline: (caseId: string, deadlineId: string, data: { is_completed?: boolean; due_date?: string; title?: string }) =>
    request<DeadlineItem>(`/api/v3/cases/${caseId}/deadlines/${deadlineId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getContradictions: (caseId: string) =>
    request<ContradictionResult>(`/api/v3/cases/${caseId}/contradictions`),

  compareDocuments: (doc1Id: string, doc2Id: string) =>
    request<DocumentComparisonResponse>("/api/v3/documents/compare", {
      method: "POST",
      body: JSON.stringify({ document_id_1: doc1Id, document_id_2: doc2Id }),
    }),

  exportCase: (caseId: string) =>
    request<any>(`/api/v3/cases/${caseId}/export`),
};

export const guidanceV3Api = {
  discoverLegalAid: (params: { state: string; income?: number; is_woman_or_child?: boolean }) => {
    const q = new URLSearchParams({ state: params.state });
    if (params.income) q.append("income", params.income.toString());
    if (params.is_woman_or_child) q.append("is_woman_or_child", "true");
    return request<LegalAidResourceItem[]>(`/api/v3/legal-aid/discover?${q.toString()}`);
  },

  listProcedures: () =>
    request<{ procedures: { slug: string; title: string; category: string; summary: string }[] }>("/api/v3/procedures/"),

  getProcedure: (slug: string) =>
    request<ProceduralExplainerItem>(`/api/v3/procedures/${slug}`),

  listGlossary: (search?: string) => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    return request<{ terms: GlossaryTermItem[] }>(`/api/v3/glossary/${q}`);
  },

  getGlossaryTerm: (term: string) =>
    request<GlossaryTermItem>(`/api/v3/glossary/${encodeURIComponent(term)}`),
};

export const lawyersV3Api = {
  list: (params?: { state?: string; city?: string; practice_area?: string; language?: string; max_fee?: number }) => {
    const q = new URLSearchParams();
    if (params?.state) q.append("state", params.state);
    if (params?.city) q.append("city", params.city);
    if (params?.practice_area) q.append("practice_area", params.practice_area);
    if (params?.language) q.append("language", params.language);
    if (params?.max_fee) q.append("max_fee", params.max_fee.toString());
    return request<LawyerProfile[]>(`/api/v3/lawyers/?${q.toString()}`);
  },

  getProfile: (lawyerId: string) =>
    request<LawyerProfile>(`/api/v3/lawyers/${lawyerId}/profile`),

  requestConsultation: (caseId: string, lawyerId: string, sharedScopes: string[], initialMessage?: string) =>
    request<ConsultationResponse>("/api/v3/lawyers/consultations/", {
      method: "POST",
      body: JSON.stringify({
        case_id: caseId,
        lawyer_id: lawyerId,
        shared_scopes: sharedScopes,
        initial_message: initialMessage,
      }),
    }),

  getMessages: (consultationId: string) =>
    request<LawyerMessageItem[]>(`/api/v3/lawyers/consultations/${consultationId}/messages`),

  sendMessage: (consultationId: string, content: string) =>
    request<LawyerMessageItem>(`/api/v3/lawyers/consultations/${consultationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  revokeAccess: (consultationId: string) =>
    request<{ status: string; message: string }>(`/api/v3/lawyers/consultations/${consultationId}/revoke`, {
      method: "POST",
    }),
};

export const billingV3Api = {
  plans: () =>
    request<{ plans: PlanItem[] }>("/api/v3/billing/plans"),

  usage: () =>
    request<any>("/api/v3/billing/usage"),

  checkout: (data: { payment_type: string; plan_id?: string; lawyer_id?: string; case_id?: string; amount_inr: number }) =>
    request<PaymentCheckoutResponse>("/api/v3/billing/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listOrgs: () =>
    request<any[]>("/api/v3/billing/organizations/"),

  createOrg: (data: { name: string; slug: string; contact_email: string; org_type?: string }) =>
    request<any>("/api/v3/billing/organizations/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const privacyV3Api = {
  notifications: () =>
    request<NotificationItem[]>("/api/v3/privacy/notifications/"),

  dataSummary: () =>
    request<any>("/api/v3/privacy/data-summary"),

  deleteCase: (caseId: string) =>
    request<{ status: string; message: string }>(`/api/v3/privacy/cases/${caseId}`, {
      method: "DELETE",
    }),
};

// ==========================================
// V1 Types
// ==========================================
export interface DocumentSummary {
  id: string;
  name: string;
  original_filename: string;
  file_type: string;
  status: "uploading" | "processing" | "extracting" | "analyzing" | "ready" | "error";
  page_count?: number;
  created_at: string;
}

export interface Party {
  name: string;
  role: string;
  address?: string;
}

export interface ImportantDate {
  label: string;
  date: string;
  page?: number;
}

export interface FinancialTerm {
  label: string;
  amount: string;
  due_date?: string;
  notes?: string;
  page?: number;
}

export interface Obligation {
  text: string;
  page?: number;
}

export interface ImportantClause {
  title: string;
  summary: string;
  page?: number;
  risk_level: "high" | "medium" | "low";
}

export interface PotentialConcern {
  text: string;
  page?: number;
  severity: "high" | "medium" | "low";
}

export interface DocumentCitation {
  claim: string;
  page: number;
  section?: string;
  excerpt: string;
}

export interface AnalysisData {
  document_type: string;
  summary: string;
  parties: Party[];
  important_dates: ImportantDate[];
  financial_terms: FinancialTerm[];
  obligations: {
    your_obligations: Obligation[];
    other_party_obligations: Obligation[];
  };
  important_clauses: ImportantClause[];
  potential_concerns: PotentialConcern[];
  next_steps: string[];
  citations: DocumentCitation[];
  confidence: "high" | "medium" | "low";
  is_high_risk: boolean;
  high_risk_recommendation?: string;
}

export interface AnalysisResult {
  document_id: string;
  document_name: string;
  status: string;
  analysis: AnalysisData;
  document_type: string;
  confidence: string;
  created_at: string;
}

export interface ChatCitation {
  page_number: number;
  section?: string;
  excerpt: string;
}

export interface ChatResponse {
  conversation_id: string;
  answer: string;
  found_in_document: boolean;
  citations: ChatCitation[];
  confidence: string;
  uncertainty_note?: string;
  is_high_risk: boolean;
  high_risk_recommendation?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  confidence?: string;
  created_at: string;
}

export interface ConversationHistory {
  conversation_id: string;
  document_id?: string;
  messages: ChatMessage[];
}

export interface TranslationResult {
  translated_text: string;
  source_lang: string;
  target_lang: string;
  mode: string;
  notes?: string;
}

export interface Language {
  code: string;
  name: string;
  native_name?: string;
  available: boolean;
  coming_soon?: boolean;
}

export interface DocumentTypeQuestion {
  id: string;
  label: string;
  type: string;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  questions: DocumentTypeQuestion[];
}

export interface GeneratedDocumentResult {
  id: string;
  title: string;
  content: string;
  disclaimer: string;
  missing_information: string[];
  warnings: string[];
}

// ==========================================
// V2 Types
// ==========================================
export type UrgencyLevel = "low" | "moderate" | "high" | "critical";

export interface CaseCreateInput {
  title: string;
  issue_type: string;
  description: string;
  state?: string;
  city?: string;
  incident_date?: string;
  incident_date_approx?: string;
  desired_outcome?: string;
}

export interface CaseCreateResult {
  id: string;
  title: string;
  issue_type: string;
  status: string;
  urgency: UrgencyLevel;
  urgency_reason?: string;
  ai_summary?: string;
  initial_analysis?: any;
  created_at?: string;
}

export interface CaseSummary {
  id: string;
  title: string;
  issue_type: string;
  description?: string;
  state?: string;
  city?: string;
  status: string;
  urgency: UrgencyLevel;
  urgency_reason?: string;
  ai_summary?: string;
  updated_at?: string;
  created_at?: string;
}

export interface TimelineEvent {
  id?: string;
  event_date?: string;
  date_display: string;
  is_approximate: boolean;
  title: string;
  description?: string;
  source?: string;
  confidence?: string;
}

export interface EvidenceItem {
  id?: string;
  name: string;
  evidence_type: string;
  description?: string;
  evidence_date?: string;
  user_notes?: string;
  file_url?: string;
  ai_status?: string;
  ai_relevance?: string;
  ai_observation?: string;
  created_at?: string;
}

export interface EvidenceAnalysis {
  overall_assessment: string;
  supporting_evidence: {
    evidence_id: string;
    observation: string;
    key_detail: string;
  }[];
  potential_conflicting_evidence: {
    evidence_id: string;
    observation: string;
    reconciliation_advice: string;
  }[];
  missing_evidence: {
    item: string;
    why_needed: string;
    how_to_obtain: string;
  }[];
  timeline_suggestions?: {
    date: string;
    description: string;
    source_evidence: string;
  }[];
}

export interface StatutoryCitation {
  source_title: string;
  section: string;
  authority: string;
  excerpt: string;
  url?: string;
  verified: boolean;
}

export interface LegalResearchResponse {
  answer: string;
  legal_summary: string;
  citations: StatutoryCitation[];
  potential_conflicts?: string | null;
  why_this_answer: {
    relevant_case_facts: string;
    applicable_provision: string;
    simple_reasoning: string;
  };
  urgency_assessment: UrgencyLevel;
  next_practical_steps: string[];
}

export interface LawyerReviewResult {
  status: string;
  review_id: string;
  lawyer_package: {
    package_title: string;
    executive_summary: string;
    parties_summary: string;
    chronology_summary: string;
    evidence_table: { item: string; type: string; probative_value: string }[];
    key_legal_questions_for_counsel: string[];
    urgency_level: UrgencyLevel;
    recommended_advocate_specialization: string;
  };
}

export interface CaseWorkspace {
  id: string;
  title: string;
  issue_type: string;
  description: string;
  state?: string;
  city?: string;
  incident_date?: string;
  incident_date_approx?: string;
  desired_outcome?: string;
  status: string;
  urgency: UrgencyLevel;
  urgency_reason?: string;
  ai_summary?: string;
  documents: {
    id: string;
    name: string;
    file_type: string;
    status: string;
    created_at?: string;
  }[];
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
  people: { id: string; name: string; role: string; contact_info?: string }[];
  notes: { id: string; title?: string; content: string; created_at?: string }[];
  generated_drafts: {
    id: string;
    title: string;
    doc_type: string;
    current_version: number;
    created_at?: string;
  }[];
  lawyer_review_status?: {
    status: string;
    assigned_lawyer?: string;
    updated_at?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClauseTemplate {
  clause_id: string;
  name: string;
  category: string;
  description: string;
  risk_level: string;
  is_standard: boolean;
}

export interface DocumentReviewResult {
  overall_readiness: "ready_for_review" | "needs_corrections" | "high_risk_defects";
  readiness_score: number;
  summary_findings: string;
  critical_issues: {
    type: string;
    clause_or_location: string;
    issue_description: string;
    recommended_fix: string;
  }[];
  warnings: string[];
  missing_details_to_fill: string[];
}

export interface DocumentVersionItem {
  id: string;
  version_number: number;
  title: string;
  change_summary?: string;
  created_at?: string;
}

export interface TranslationV2Result {
  translated_text: string;
  source_lang: string;
  target_lang: string;
  mode: string;
  safety_disclaimer: string;
  preserved_terms?: string[];
  notes?: string;
}

export interface GlobalSearchResult {
  query: string;
  results: {
    cases: { id: string; title: string; issue_type: string; urgency: UrgencyLevel }[];
    documents: { id: string; name: string; case_id?: string; status: string }[];
    evidence: { id: string; name: string; case_id: string; evidence_type: string }[];
    drafts: { id: string; title: string; case_id?: string; doc_type: string }[];
  };
  total_matches: number;
}

// ==========================================
// V3 Types
// ==========================================
export interface ClaimGrounding {
  claim: string;
  grounding_type: "USER PROVIDED" | "DOCUMENT DERIVED" | "LEGAL SOURCE DERIVED" | "AI INFERENCE" | "UNCERTAIN";
  source_reference?: string;
  confidence: number;
}

export interface OrchestratorRunResponse {
  run_id: string;
  case_id: string;
  status: string;
  agents_invoked: string[];
  answer: string;
  claim_groundings: ClaimGrounding[];
  suggested_next_steps: string[];
  disclaimer: string;
}

export interface FactStoreItem {
  id: string;
  case_id: string;
  fact_key: string;
  fact_value: string;
  data_type: string;
  source_type: string;
  source_ref?: string;
  confidence: string;
  user_confirmed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DeadlineItem {
  id: string;
  case_id: string;
  title: string;
  due_date: string;
  days_remaining: number;
  source_document?: string;
  source_section?: string;
  statutory_basis?: string;
  importance: string;
  is_uncertain: boolean;
  uncertainty_reason?: string;
  is_completed: boolean;
}

export interface DiscrepancyItem {
  discrepancy_id: string;
  claim_or_statement: string;
  source_a: string;
  conflicting_statement: string;
  source_b: string;
  nature: string;
  severity: "critical" | "moderate" | "minor";
  neutral_observation: string;
}

export interface ContradictionResult {
  case_id: string;
  total_discrepancies: number;
  discrepancies: DiscrepancyItem[];
  audit_notes: string;
}

export interface RedlineDiffItem {
  section_title: string;
  diff_type: "added" | "removed" | "modified" | "unchanged";
  text_v1?: string;
  text_v2?: string;
  explanation: string;
  risk_level: "low" | "medium" | "high";
}

export interface DocumentComparisonResponse {
  doc_1_title: string;
  doc_2_title: string;
  summary_of_changes: string;
  total_modifications: number;
  added_clauses: number;
  removed_clauses: number;
  modified_clauses: number;
  differences: RedlineDiffItem[];
  risk_warning?: string;
}

export interface LawyerProfile {
  id: string;
  full_name: string;
  bar_council_id: string;
  state_bar_council: string;
  enrollment_year: number;
  practice_areas: string[];
  languages: string[];
  state: string;
  city: string;
  years_experience: number;
  consultation_fee: number;
  verification_status: string;
  bio?: string;
  is_available: boolean;
  rating: number;
  review_count: number;
}

export interface ConsultationResponse {
  id: string;
  case_id: string;
  lawyer_id: string;
  lawyer_name: string;
  status: string;
  fee_inr: number;
  shared_scopes: string[];
  lawyer_brief_summary?: string;
  meeting_link?: string;
  created_at?: string;
}

export interface LawyerMessageItem {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  attachments: string[];
  created_at?: string;
}

export interface LegalAidResourceItem {
  id: string;
  authority_name: string;
  state: string;
  district?: string;
  contact_number?: string;
  toll_free_number: string;
  portal_url?: string;
  address?: string;
  eligible: boolean;
  eligibility_reason: string;
}

export interface ProceduralStep {
  step_number: number;
  title: string;
  description: string;
  timeframe?: string;
}

export interface ProceduralExplainerItem {
  slug: string;
  title: string;
  category: string;
  summary: string;
  steps: ProceduralStep[];
  what_to_do: string;
  what_not_to_do: string;
  faqs: { q: string; a: string }[];
  disclaimer: string;
}

export interface GlossaryTermItem {
  english_term: string;
  hindi_term: string;
  regional_terms: Record<string, string>;
  plain_explanation: string;
  legal_context: string;
}

export interface PlanItem {
  id: string;
  name: string;
  price_inr_monthly: number;
  document_limit: number;
  ai_requests_limit: number;
  voice_minutes_limit: number;
  features: string[];
}

export interface PaymentCheckoutResponse {
  transaction_id: string;
  amount_inr: number;
  currency: string;
  status: string;
  payment_url?: string;
  message: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  severity: string;
  read_at?: string;
  created_at?: string;
}

// ==========================================
// V4 Endpoints (Legal Intelligence, Case-Law, Workflows, Workspaces)
// ==========================================

export interface LegalEntityItem {
  id: string;
  identifier?: string;
  entity_type: string;
  canonical_name: string;
  jurisdiction: string;
  metadata: Record<string, any>;
}

export interface GraphExploreItem {
  root_entity: LegalEntityItem;
  outgoing_relationships: Array<{
    relationship_type: string;
    statutory_reference?: string;
    confidence: number;
    target_entity: {
      id: string;
      canonical_name: string;
      entity_type: string;
      identifier?: string;
    };
  }>;
  incoming_relationships: Array<{
    relationship_type: string;
    statutory_reference?: string;
    confidence: number;
    source_entity: {
      id: string;
      canonical_name: string;
      entity_type: string;
      identifier?: string;
    };
  }>;
  total_connected: number;
}

export interface TemporalLawResult {
  statute_title: string;
  target_date: string;
  applicable_version: {
    id: string;
    version_label: string;
    effective_from: string;
    effective_to?: string;
    is_current: boolean;
    amendment_act?: string;
    full_text: string;
  };
  current_version: {
    id: string;
    version_label: string;
    is_current: boolean;
    amendment_act?: string;
    full_text: string;
  };
  is_historically_different: boolean;
  differences_summary?: string;
  substantive_vs_procedural_note: string;
}

export interface JudgmentItem {
  id: string;
  case_name: string;
  neutral_citation: string;
  court_name: string;
  decision_date: string;
  bench?: string;
  outcome?: string;
  headnote?: string;
  statutory_provisions: string[];
  source_url?: string;
  verified: boolean;
}

export interface JudgmentSummaryItem {
  case_overview: string;
  factual_matrix: string;
  questions_of_law: string[];
  appellant_arguments: string;
  respondent_arguments: string;
  ratio_decidendi: string;
  precedents_applied: Array<{ precedent: string; relationship: string }>;
  operative_decision: string;
  legal_principles: string[];
  limitations: string;
  neutral_citation: string;
  court: string;
  date: string;
}

export interface JudgmentCompareResult {
  issue_analyzed: string;
  judgment_a: Record<string, any>;
  judgment_b: Record<string, any>;
  core_similarities: string[];
  divergence_in_reasoning: string[];
  jurisdictional_distinction: string;
  controlling_authority_note: string;
}

export interface CitationVerifyResult {
  citation_text: string;
  is_verified: boolean;
  source_title?: string;
  source_type?: string;
  verification_status: string;
  verification_details: string;
}

export interface LegalMemoResult {
  title: string;
  research_question: string;
  statement_of_facts: string;
  issues_framed: string[];
  applicable_statutes: Array<{ statute: string; provision: string }>;
  binding_precedents: Array<{ citation: string; case_name: string; principle: string }>;
  analysis_and_arguments: string;
  counterarguments: string;
  conclusion_and_next_steps: string;
  disclaimer: string;
}

export interface DocumentObligationItem {
  id: string;
  case_id: string;
  document_id?: string;
  obligor: string;
  obligee?: string;
  obligation_text: string;
  obligation_type: string;
  amount_inr?: number;
  frequency?: string;
  due_date?: string;
  source_clause?: string;
  status: string;
}

export interface CrossReconciliationResult {
  case_id: string;
  documents_audited: string[];
  inconsistencies: Array<{
    issue: string;
    document_a: string;
    clause_a: string;
    document_b: string;
    clause_b: string;
    significance: string;
  }>;
  reconciliation_summary: string;
}

export interface WorkflowDefItem {
  id: string;
  name: string;
  category: string;
  trigger_type: string;
  steps_count: number;
  definition: {
    steps: Array<{
      step_num: number;
      title: string;
      action: string;
      requires_approval: boolean;
      description?: string;
    }>;
  };
}

export interface WorkflowExecItem {
  id: string;
  execution_id?: string;
  workflow_name: string;
  case_id: string;
  current_step: number;
  status: string;
  requires_human_approval: boolean;
  approval_details?: Record<string, any>;
}

export interface LawyerDashboardData {
  lawyer_profile: {
    id: string;
    full_name: string;
    bar_council_id: string;
    verification_status: string;
  };
  metrics: {
    active_matters: number;
    completed_reviews: number;
    pending_client_queries: number;
    urgent_deadlines_7days: number;
  };
  recent_matters: any[];
  pending_document_reviews: any[];
}

export interface NgoDashboardData {
  organization_name: string;
  organization_type: string;
  active_caseworkers: number;
  statistics: {
    intake_cases_this_month: number;
    nalsa_section_12_eligible_cases: number;
    assigned_pro_bono_advocates: number;
    resolved_lok_adalat_matters: number;
  };
  recent_client_matters: Array<{
    client_identifier: string;
    issue_type: string;
    nalsa_category: string;
    assigned_advocate: string;
    status: string;
  }>;
  dlsa_reporting_status: string;
}

export interface ProceduralWalkthroughResult {
  case_type: string;
  document_analyzed: string;
  procedural_steps_breakdown: Array<{
    step_name: string;
    category: "KNOWN FROM DOCUMENT" | "GENERAL PROCEDURAL INFORMATION" | "POSSIBLE NEXT STEP" | "UNKNOWN";
    explanation: string;
    timeframe: string;
  }>;
  statutory_caution: string;
  last_verified_timestamp: string;
}

export interface VoiceTurnResponse {
  spoken_reply_text: string;
  display_summary: string;
  language_detected: string;
  procedural_next_step?: string;
  disclaimer: string;
}

export const v4Api = {
  // Knowledge Graph
  searchEntities: (query?: string, entityType?: string) => {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (entityType) params.append("entity_type", entityType);
    return request<LegalEntityItem[]>(`/api/v4/knowledge-graph/entities?${params.toString()}`);
  },
  exploreGraph: (entityId: string) =>
    request<GraphExploreItem>(`/api/v4/knowledge-graph/explore/${entityId}`),

  // Temporal Reasoning
  resolveTemporalLaw: (statuteIdentifier: string, targetDate: string, sectionNumber?: string) =>
    request<TemporalLawResult>("/api/v4/temporal/resolve", {
      method: "POST",
      body: JSON.stringify({
        statute_identifier: statuteIdentifier,
        target_date: targetDate,
        section_number: sectionNumber,
      }),
    }),

  // Case-Law & Precedents
  searchJudgments: (query?: string, court?: string, section?: string, legalConcept?: string) =>
    request<JudgmentItem[]>("/api/v4/caselaw/search", {
      method: "POST",
      body: JSON.stringify({ query, court, section, legal_concept: legalConcept, limit: 10 }),
    }),
  getJudgmentSummary: (judgmentId: string) =>
    request<JudgmentSummaryItem>(`/api/v4/caselaw/judgments/${judgmentId}/summary`),
  compareJudgments: (idA: string, idB: string, legalIssue?: string) =>
    request<JudgmentCompareResult>("/api/v4/caselaw/compare", {
      method: "POST",
      body: JSON.stringify({ judgment_id_a: idA, judgment_id_b: idB, legal_issue: legalIssue }),
    }),

  // Citations & Research
  verifyCitation: (citationText: string) =>
    request<CitationVerifyResult>("/api/v4/research/verify-citation", {
      method: "POST",
      body: JSON.stringify({ citation_text: citationText }),
    }),
  generateMemo: (payload: { research_question: string; facts_summary?: string; case_id?: string }) =>
    request<LegalMemoResult>("/api/v4/research/memo", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getCollections: () => request<any[]>("/api/v4/research/collections"),

  // Document Intelligence
  extractObligations: (caseId: string, documentId?: string) =>
    request<DocumentObligationItem[]>(`/api/v4/documents/cases/${caseId}/obligations/extract`, {
      method: "POST",
      body: JSON.stringify({ document_id: documentId }),
    }),
  listObligations: (caseId: string) =>
    request<DocumentObligationItem[]>(`/api/v4/documents/cases/${caseId}/obligations`),
  reconcileDocuments: (caseId: string, documentIds?: string[]) =>
    request<CrossReconciliationResult>(`/api/v4/documents/cases/${caseId}/reconcile`, {
      method: "POST",
      body: JSON.stringify({ document_ids: documentIds }),
    }),
  reviewContractRisks: (documentText: string, userSide: string = "tenant") =>
    request<any>("/api/v4/documents/risk-review", {
      method: "POST",
      body: JSON.stringify({ document_text: documentText, user_side: userSide }),
    }),

  // Workflows & Human Gates
  listWorkflows: () => request<WorkflowDefItem[]>("/api/v4/workflows/definitions"),
  executeWorkflow: (workflowId: string, caseId: string) =>
    request<WorkflowExecItem>("/api/v4/workflows/execute", {
      method: "POST",
      body: JSON.stringify({ workflow_id: workflowId, case_id: caseId }),
    }),
  submitWorkflowDecision: (executionId: string, approved: boolean, rejectionReason?: string) =>
    request<any>(`/api/v4/workflows/executions/${executionId}/decision`, {
      method: "POST",
      body: JSON.stringify({ approved, rejection_reason: rejectionReason }),
    }),

  // Professional Workspaces
  getLawyerDashboard: (lawyerId: string) =>
    request<LawyerDashboardData>(`/api/v4/workspaces/lawyer/dashboard/${lawyerId}`),
  submitLawyerReview: (payload: {
    consultation_id: string;
    document_id: string;
    review_status: string;
    correction_notes?: string;
    verified_clauses?: string[];
  }) =>
    request<any>("/api/v4/workspaces/lawyer/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getNgoDashboard: (orgId: string = "default-ngo") =>
    request<NgoDashboardData>(`/api/v4/workspaces/ngo/dashboard/${orgId}`),

  // Court Assistant
  getProcedureWalkthrough: (caseType: string, documentType: string) =>
    request<ProceduralWalkthroughResult>("/api/v4/court/procedure-walkthrough", {
      method: "POST",
      body: JSON.stringify({ case_type: caseType, document_type: documentType }),
    }),

  // Accessibility Voice Turn
  processVoiceTurn: (transcript: string, language: string = "hi", caseId?: string) =>
    request<VoiceTurnResponse>("/api/v4/accessibility/voice-turn", {
      method: "POST",
      body: JSON.stringify({
        user_speech_transcript: transcript,
        language,
        case_id: caseId,
      }),
    }),

  // Evaluation & Red-Teaming
  runBenchmark: (benchmarkName?: string) =>
    request<any>("/api/v4/evaluation/run-benchmark", {
      method: "POST",
      body: JSON.stringify({ benchmark_name: benchmarkName }),
    }),
  runAdversarialSuite: () =>
    request<any>("/api/v4/evaluation/run-adversarial", {
      method: "POST",
    }),

  // Webhooks
  listWebhooks: () => request<any[]>("/api/v4/webhooks/subscriptions"),
  createWebhook: (targetUrl: string, subscribedEvents: string[]) =>
    request<any>("/api/v4/webhooks/subscriptions", {
      method: "POST",
      body: JSON.stringify({ target_url: targetUrl, subscribed_events: subscribedEvents }),
    }),
};

export { ApiError };

