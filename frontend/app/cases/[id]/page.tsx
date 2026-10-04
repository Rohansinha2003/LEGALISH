"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  FileText,
  Shield,
  MessageSquare,
  FileCheck,
  AlertTriangle,
  Calendar,
  Plus,
  Sparkles,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Volume2,
  Send,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Search,
  HelpCircle,
} from "lucide-react";
import {
  casesApi,
  CaseWorkspace,
  EvidenceAnalysis,
  LegalResearchResponse,
  LawyerReviewResult,
  ClauseTemplate,
  DocumentReviewResult,
  generationV2Api,
} from "@/lib/api";
import { VoiceInputButton, ReadAloudButton } from "@/components/VoiceHelper";
import toast from "react-hot-toast";

export default function CaseWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "evidence" | "documents" | "research" | "drafts" | "lawyer" | "notes"
  >("overview");

  const [workspace, setWorkspace] = useState<CaseWorkspace | null>(null);
  const [loading, setLoading] = useState(true);

  // Evidence AI state
  const [evidenceAnalysis, setEvidenceAnalysis] = useState<EvidenceAnalysis | null>(null);
  const [analyzingEvidence, setAnalyzingEvidence] = useState(false);

  // New Evidence Modal state
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [newEvidenceName, setNewEvidenceName] = useState("");
  const [newEvidenceType, setNewEvidenceType] = useState("receipt");
  const [newEvidenceDesc, setNewEvidenceDesc] = useState("");
  const [newEvidenceDate, setNewEvidenceDate] = useState("");
  const [newEvidenceNotes, setNewEvidenceNotes] = useState("");

  // Timeline add state
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");

  // Legal Research & Chat state
  const [chatQuery, setChatQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [researchResponses, setResearchResponses] = useState<
    { q: string; res: LegalResearchResponse; expandedWhy?: boolean }[]
  >([]);

  // Lawyer Review state
  const [lawyerQuestions, setLawyerQuestions] = useState("");
  const [lawyerNotes, setLawyerNotes] = useState("");
  const [submittingLawyer, setSubmittingLawyer] = useState(false);
  const [lawyerPackageResult, setLawyerPackageResult] = useState<any>(null);

  // New Note state
  const [noteContent, setNoteContent] = useState("");

  // Load Workspace Data
  const loadWorkspace = async () => {
    try {
      const data = await casesApi.get(caseId);
      setWorkspace(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load case workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [caseId]);

  // Evidence AI Handler
  const handleAnalyzeEvidence = async () => {
    setAnalyzingEvidence(true);
    try {
      const res = await casesApi.analyzeEvidence(caseId);
      setEvidenceAnalysis(res);
      toast.success("Evidence analyzed successfully!");
    } catch (err: any) {
      toast.error("Failed to analyze evidence.");
    } finally {
      setAnalyzingEvidence(false);
    }
  };

  // Add Evidence Handler
  const handleAddEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await casesApi.addEvidence(caseId, {
        name: newEvidenceName,
        evidence_type: newEvidenceType,
        description: newEvidenceDesc,
        evidence_date: newEvidenceDate || undefined,
        user_notes: newEvidenceNotes,
      });
      toast.success("Evidence record added!");
      setShowAddEvidence(false);
      setNewEvidenceName("");
      setNewEvidenceDesc("");
      loadWorkspace();
    } catch (err: any) {
      toast.error("Failed to add evidence.");
    }
  };

  // Add Timeline Event Handler
  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await casesApi.addTimelineEvent(caseId, {
        title: newEventTitle,
        event_date: newEventDate || undefined,
        date_display: newEventDate || "Approximate",
        description: newEventDesc,
      });
      toast.success("Timeline milestone added!");
      setShowAddEvent(false);
      setNewEventTitle("");
      setNewEventDesc("");
      loadWorkspace();
    } catch (err: any) {
      toast.error("Failed to add event.");
    }
  };

  // Auto-Extract Timeline Handler
  const handleExtractTimeline = async () => {
    try {
      toast.loading("Extracting chronological milestones...", { id: "extract" });
      const res = await casesApi.extractTimeline(caseId);
      toast.success(`Extracted ${res.extracted_count} events!`, { id: "extract" });
      loadWorkspace();
    } catch (err: any) {
      toast.error("Timeline extraction failed.", { id: "extract" });
    }
  };

  // Legal Research Ask Handler
  const handleAskResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    const q = chatQuery.trim();
    setChatQuery("");
    setChatLoading(true);

    try {
      const res = await casesApi.research(caseId, q, workspace?.state || "India");
      setResearchResponses((prev) => [...prev, { q, res, expandedWhy: false }]);
    } catch (err: any) {
      toast.error("Research query failed.");
    } finally {
      setChatLoading(false);
    }
  };

  // Lawyer Review Request Handler
  const handleLawyerRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLawyer(true);
    try {
      const res = await casesApi.requestLawyerReview(caseId, lawyerQuestions, lawyerNotes);
      setLawyerPackageResult(res.lawyer_package);
      toast.success("Lawyer Case Package generated and review registered!");
      loadWorkspace();
    } catch (err: any) {
      toast.error("Failed to submit lawyer review request.");
    } finally {
      setSubmittingLawyer(false);
    }
  };

  // Add Note Handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await casesApi.addNote(caseId, "Note", noteContent);
      setNoteContent("");
      toast.success("Note saved.");
      loadWorkspace();
    } catch (err: any) {
      toast.error("Failed to save note.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-[#1A2B49] text-sm font-semibold">
          <Loader2 className="w-6 h-6 animate-spin text-[#8C6D23]" />
          Loading case workspace...
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#1A2B49]">Case Not Found</h2>
        <p className="text-xs text-[#706E6B]">The requested case does not exist or you do not have permission to view it.</p>
        <Link href="/dashboard" className="inline-block px-4 py-2 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isCritical = workspace.urgency === "critical";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Critical Emergency Banner if high risk */}
      {isCritical && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-red-800">This matter may require immediate human advocate assistance</h4>
            <p className="text-red-700">
              {workspace.urgency_reason || "Critical statutory deadline or imminent eviction threat detected."} Preserve all written receipts and communications immediately.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setActiveTab("lawyer")}
                className="font-bold underline text-red-900 hover:text-red-700"
              >
                Prepare Lawyer Package →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DFD5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-[#F7F2E8] text-[#8C6D23] px-2.5 py-0.5 rounded-md">
                {workspace.issue_type}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                workspace.urgency === "critical" ? "bg-red-100 text-red-800" :
                workspace.urgency === "high" ? "bg-amber-100 text-amber-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {workspace.urgency.toUpperCase()} URGENCY
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A2B49] mt-1.5">
              {workspace.title}
            </h1>
            <p className="text-xs text-[#706E6B] mt-1">
              Jurisdiction: {workspace.city ? `${workspace.city}, ` : ""}{workspace.state || "India"} • Created on {workspace.created_at ? new Date(workspace.created_at).toLocaleDateString() : "Recent"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("lawyer")}
              className="px-4 py-2 rounded-xl bg-[#8C6D23] text-white text-xs font-semibold hover:bg-[#73581B] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Lawyer Review</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[#F2ECE3] overflow-x-auto pt-2 scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: Briefcase },
            { id: "timeline", label: `Timeline (${workspace.timeline.length})`, icon: Clock },
            { id: "evidence", label: `Evidence (${workspace.evidence.length})`, icon: Shield },
            { id: "documents", label: `Documents (${workspace.documents.length})`, icon: FileText },
            { id: "research", label: "Legal AI & RAG", icon: Sparkles },
            { id: "drafts", label: `Drafts (${workspace.generated_drafts.length})`, icon: FileCheck },
            { id: "lawyer", label: "Lawyer Escalation", icon: UserCheck },
            { id: "notes", label: `Notes (${workspace.notes.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "border-[#1A2B49] text-[#1A2B49] font-bold"
                    : "border-transparent text-[#706E6B] hover:text-[#1A2B49] hover:border-[#DDD5C7]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-[#8C6D23]" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Factual Summary Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#E6DFD5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-[#1A2B49]">What We Understand</h3>
                <ReadAloudButton text={workspace.ai_summary || workspace.description} />
              </div>
              <p className="text-sm text-[#55524E] leading-relaxed">
                {workspace.ai_summary || workspace.description}
              </p>
            </div>

            {/* Urgency & Risk Explanation */}
            <div className="p-6 rounded-3xl bg-white border border-[#E6DFD5] shadow-xs space-y-2">
              <h3 className="font-serif text-base font-bold text-[#1A2B49]">AI Urgency Assessment</h3>
              <p className="text-xs text-[#706E6B] leading-relaxed">
                {workspace.urgency_reason || "Urgency evaluated based on potential financial loss and notice periods."}
              </p>
              <div className="pt-2 text-[11px] text-[#8C7A63] italic">
                * Note: AI-generated urgency assessment is informational and not a formal court determination.
              </div>
            </div>

            {/* Desired Outcome */}
            {workspace.desired_outcome && (
              <div className="p-6 rounded-3xl bg-[#FDFAF5] border border-[#E6DFD5] shadow-xs space-y-2">
                <h3 className="font-serif text-base font-bold text-[#1A2B49]">Target Outcome</h3>
                <p className="text-xs text-[#55524E]">{workspace.desired_outcome}</p>
              </div>
            )}
          </div>

          {/* Sidebar: Key Parties & Next Steps */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E6DFD5] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#1A2B49]">People Involved</h3>
              {workspace.people.length > 0 ? (
                <div className="space-y-2">
                  {workspace.people.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] text-xs">
                      <p className="font-semibold text-[#1A2B49]">{p.name}</p>
                      <p className="text-[11px] text-[#706E6B]">{p.role}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#706E6B]">No other parties recorded yet.</p>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-[#1A2B49] text-white shadow-xs space-y-3">
              <h3 className="font-serif text-base font-bold text-[#FAF7F2]">Recommended Next Action</h3>
              <p className="text-xs text-[#DDD0BC] leading-relaxed">
                Organize your receipts and communications in the Evidence Locker, then run Evidence AI to spot any conflicting statements.
              </p>
              <button
                onClick={() => setActiveTab("evidence")}
                className="w-full py-2 rounded-xl bg-[#8C6D23] hover:bg-[#A4802B] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Go to Evidence Locker →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIMELINE */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A2B49]">Case Chronology & Milestones</h2>
              <p className="text-xs text-[#706E6B]">Key events extracted from agreements, notices, and user dates.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExtractTimeline}
                className="px-3.5 py-1.5 rounded-xl bg-[#F7F2E8] border border-[#DDD5C7] text-xs font-semibold text-[#1A2B49] hover:bg-[#EFE8DD] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8C6D23]" />
                <span>AI Extract Milestones</span>
              </button>
              <button
                onClick={() => setShowAddEvent(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event</span>
              </button>
            </div>
          </div>

          {/* Add Event Form Modal/Drawer */}
          {showAddEvent && (
            <form onSubmit={handleAddEventSubmit} className="p-6 rounded-3xl bg-white border border-[#C8B99A] shadow-md space-y-4">
              <h3 className="font-serif text-base font-bold text-[#1A2B49]">Add Timeline Milestone</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#55524E] mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g., Security deposit transfer / Move-out date"
                    className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#55524E] mb-1">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#55524E] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Details of what took place..."
                  className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#55524E] hover:bg-[#F2ECE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          )}

          {/* Chronological Event List */}
          {workspace.timeline.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-[#DDD0BC] space-y-6 ml-4">
              {workspace.timeline.map((ev, idx) => (
                <div key={ev.id || idx} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#1A2B49] border-2 border-white ring-2 ring-[#E6DFD5]" />
                  <div className="p-4 rounded-2xl bg-white border border-[#E6DFD5] shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#8C6D23] bg-[#F7F2E8] px-2 py-0.5 rounded">
                        {ev.date_display || ev.event_date || "Approximate"}
                        {ev.is_approximate ? " (Approx)" : ""}
                      </span>
                      <span className="text-[10px] text-[#706E6B]">Source: {ev.source || "User"}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-[#1A2B49]">{ev.title}</h4>
                    {ev.description && <p className="text-xs text-[#706E6B]">{ev.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-[#E6DFD5] text-center text-xs text-[#706E6B]">
              No timeline milestones recorded yet. Click &quot;Add Event&quot; or &quot;AI Extract Milestones&quot;.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EVIDENCE LOCKER & EVIDENCE AI */}
      {activeTab === "evidence" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A2B49]">Evidence Locker</h2>
              <p className="text-xs text-[#706E6B]">Preserve receipts, screenshots, agreements, and notices.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnalyzeEvidence}
                disabled={analyzingEvidence || workspace.evidence.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-[#8C6D23] text-white text-xs font-semibold hover:bg-[#73581B] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {analyzingEvidence ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Analyze Evidence with AI</span>
              </button>
              <button
                onClick={() => setShowAddEvidence(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>
          </div>

          {/* Add Evidence Modal */}
          {showAddEvidence && (
            <form onSubmit={handleAddEvidenceSubmit} className="p-6 rounded-3xl bg-white border border-[#C8B99A] shadow-md space-y-4">
              <h3 className="font-serif text-base font-bold text-[#1A2B49]">Add Evidence Record</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#55524E] mb-1">Evidence Title</label>
                  <input
                    type="text"
                    required
                    value={newEvidenceName}
                    onChange={(e) => setNewEvidenceName(e.target.value)}
                    placeholder="e.g., Security deposit transfer receipt #104"
                    className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#55524E] mb-1">Evidence Type</label>
                  <select
                    value={newEvidenceType}
                    onChange={(e) => setNewEvidenceType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49]"
                  >
                    <option value="receipt">Payment Receipt / Bank Statement</option>
                    <option value="screenshot">WhatsApp / Text Screenshot</option>
                    <option value="email">Email Record</option>
                    <option value="notice">Legal Notice / Letter</option>
                    <option value="agreement">Contract / Agreement</option>
                    <option value="audio">Audio / Call Recording Note</option>
                    <option value="other">Other Supporting Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55524E] mb-1">Description & What It Demonstrates</label>
                <textarea
                  rows={3}
                  value={newEvidenceDesc}
                  onChange={(e) => setNewEvidenceDesc(e.target.value)}
                  placeholder="e.g., Shows Rs 45,000 sent from HDFC account to landlord on 1st Jan 2026 with remark 'deposit'..."
                  className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvidence(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#55524E] hover:bg-[#F2ECE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold"
                >
                  Save Evidence
                </button>
              </div>
            </form>
          )}

          {/* Evidence AI Analysis Output (if available) */}
          {evidenceAnalysis && (
            <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#DDD5C7] shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8C6D23]" />
                <h3 className="font-serif text-base font-bold text-[#1A2B49]">AI Evidence Assessment</h3>
              </div>
              <p className="text-xs text-[#55524E] italic leading-relaxed">
                &quot;{evidenceAnalysis.overall_assessment}&quot;
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Supporting */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Evidence Supporting You
                  </h4>
                  {evidenceAnalysis.supporting_evidence.map((s, idx) => (
                    <div key={idx} className="text-[11px] text-emerald-950 space-y-0.5">
                      <p className="font-semibold">{s.evidence_id}</p>
                      <p>{s.observation}</p>
                    </div>
                  ))}
                  {evidenceAnalysis.supporting_evidence.length === 0 && (
                    <p className="text-[11px] text-emerald-800 italic">None logged yet.</p>
                  )}
                </div>

                {/* Conflicting */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Potential Conflicts / Counter-Claims
                  </h4>
                  {evidenceAnalysis.potential_conflicting_evidence.map((c, idx) => (
                    <div key={idx} className="text-[11px] text-amber-950 space-y-0.5">
                      <p className="font-semibold">{c.evidence_id}</p>
                      <p>{c.observation}</p>
                    </div>
                  ))}
                  {evidenceAnalysis.potential_conflicting_evidence.length === 0 && (
                    <p className="text-[11px] text-amber-800 italic">No direct contradictions detected.</p>
                  )}
                </div>

                {/* Missing */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-600" /> Missing Proof to Preserve
                  </h4>
                  {evidenceAnalysis.missing_evidence.map((m, idx) => (
                    <div key={idx} className="text-[11px] text-blue-950 space-y-0.5">
                      <p className="font-semibold">{m.item}</p>
                      <p>{m.why_needed}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Evidence Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspace.evidence.map((e) => (
              <div key={e.id} className="p-5 rounded-2xl bg-white border border-[#E6DFD5] shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F7F2E8] text-[#8C6D23] px-2 py-0.5 rounded">
                      {e.evidence_type}
                    </span>
                    <h4 className="font-semibold text-sm text-[#1A2B49] mt-1">{e.name}</h4>
                  </div>
                  <span className="text-[11px] text-[#706E6B] font-mono">{e.evidence_date || "Date unknown"}</span>
                </div>
                <p className="text-xs text-[#55524E]">{e.description}</p>
                {e.user_notes && (
                  <p className="text-[11px] text-[#706E6B] bg-[#FDFAF5] p-2 rounded-lg border border-[#F2ECE3]">
                    Note: {e.user_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CASE DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A2B49]">Documents in this Case</h2>
              <p className="text-xs text-[#706E6B]">Agreements, legal notices, and official submissions.</p>
            </div>
            <Link
              href="/upload"
              className="px-4 py-2 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspace.documents.map((doc) => (
              <div key={doc.id} className="p-5 rounded-2xl bg-white border border-[#E6DFD5] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F7F2E8] text-[#8C6D23] flex items-center justify-center font-bold text-xs">
                      {doc.file_type.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[#1A2B49]">{doc.name}</h4>
                      <p className="text-[11px] text-[#706E6B]">Status: {doc.status}</p>
                    </div>
                  </div>
                  <Link
                    href={`/analyze?id=${doc.id}`}
                    className="text-xs font-semibold text-[#8C6D23] hover:underline"
                  >
                    View Analysis →
                  </Link>
                </div>
              </div>
            ))}
            {workspace.documents.length === 0 && (
              <div className="col-span-2 p-8 rounded-3xl bg-white border border-[#E6DFD5] text-center text-xs text-[#706E6B]">
                No files uploaded to this case yet. Click &quot;Upload Document&quot; to upload a rental agreement, legal notice, or contract.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LEGAL AI RESEARCH & DUAL-RAG */}
      {activeTab === "research" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A2B49]">Indian Legal Research & Q&A</h2>
              <p className="text-xs text-[#706E6B]">
                Answers grounded in Indian statutes (Transfer of Property Act, Consumer Protection Act, State Tenancy Laws) & your case records.
              </p>
            </div>
            <VoiceInputButton
              onTranscript={(txt) => setChatQuery(txt)}
            />
          </div>

          {/* Query Input Box */}
          <form onSubmit={handleAskResearch} className="flex gap-2">
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              placeholder="Ask a question (e.g. 'Can my landlord deduct my deposit for normal wear and tear in Karnataka?')..."
              className="flex-1 p-3.5 rounded-2xl border border-[#DDD5C7] bg-white text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49] shadow-2xs"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-[#1A2B49] text-white hover:bg-[#111C30] text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Ask AI</span>
            </button>
          </form>

          {/* Research Responses Stream */}
          <div className="space-y-4">
            {researchResponses.map((item, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-[#E6DFD5] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F2ECE3] pb-2">
                  <h4 className="font-serif text-sm font-bold text-[#1A2B49]">Q: {item.q}</h4>
                  <ReadAloudButton text={item.res.answer} />
                </div>

                <p className="text-sm text-[#55524E] leading-relaxed">
                  {item.res.answer}
                </p>

                {/* Grounded Statutory Citations */}
                {item.res.citations.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23]">Authoritative Statutory Citations</h5>
                    <div className="space-y-1.5">
                      {item.res.citations.map((cite, cIdx) => (
                        <div key={cIdx} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1A2B49]">{cite.source_title} — {cite.section}</span>
                            {cite.url && (
                              <a href={cite.url} target="_blank" rel="noreferrer" className="text-[10px] text-[#8C6D23] flex items-center gap-1 hover:underline">
                                View Official Statute <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-[#706E6B] italic font-serif">&quot;{cite.excerpt}&quot;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expandable "Why am I getting this answer?" */}
                {item.res.why_this_answer && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...researchResponses];
                        updated[idx].expandedWhy = !updated[idx].expandedWhy;
                        setResearchResponses(updated);
                      }}
                      className="text-xs font-semibold text-[#8C6D23] hover:text-[#1A2B49] flex items-center gap-1 cursor-pointer"
                    >
                      {item.expandedWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      Why am I getting this answer?
                    </button>
                    {item.expandedWhy && (
                      <div className="mt-2 p-3.5 rounded-xl bg-[#F7F2E8] border border-[#DDD0BC] text-xs text-[#55524E] space-y-1.5 animate-fadeIn">
                        <p><strong>Your Case Facts:</strong> {item.res.why_this_answer.relevant_case_facts}</p>
                        <p><strong>Applicable Rule:</strong> {item.res.why_this_answer.applicable_provision}</p>
                        <p><strong>Plain Reasoning:</strong> {item.res.why_this_answer.simple_reasoning}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DRAFTS & CLAUSES */}
      {activeTab === "drafts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A2B49]">Generated Drafts & Clause Library</h2>
              <p className="text-xs text-[#706E6B]">Create agreements, notice responses, and complaints with verified clauses.</p>
            </div>
            <Link
              href="/create"
              className="px-4 py-2 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft New Document</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspace.generated_drafts.map((draft) => (
              <div key={draft.id} className="p-5 rounded-2xl bg-white border border-[#E6DFD5] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#1A2B49]">{draft.title}</h4>
                  <span className="text-[10px] font-mono bg-[#EFE8DD] text-[#55524E] px-2 py-0.5 rounded">
                    Version {draft.current_version}
                  </span>
                </div>
                <p className="text-xs text-[#706E6B]">Type: {draft.doc_type}</p>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[#8C7A63] text-[11px]">
                    Created {draft.created_at ? new Date(draft.created_at).toLocaleDateString() : ""}
                  </span>
                  <a
                    href={`http://localhost:8000/api/v1/generate/${draft.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[#8C6D23] hover:underline"
                  >
                    Download PDF →
                  </a>
                </div>
              </div>
            ))}
            {workspace.generated_drafts.length === 0 && (
              <div className="col-span-2 p-8 rounded-3xl bg-white border border-[#E6DFD5] text-center text-xs text-[#706E6B]">
                No drafts generated for this case yet. Click &quot;Draft New Document&quot; to launch the 9-step generator.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: LAWYER ESCALATION */}
      {activeTab === "lawyer" && (
        <div className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <h2 className="font-serif text-lg font-bold text-[#1A2B49]">Get Reviewed by a Practicing Advocate</h2>
            <p className="text-xs text-[#706E6B] leading-relaxed">
              When high stakes, eviction threats, or significant monetary claims are involved, our system compiles an executive &quot;Lawyer Case Package&quot; organizing your chronology, evidence, and specific questions to save counsel hours of intake time.
            </p>
          </div>

          {lawyerPackageResult ? (
            <div className="p-6 rounded-3xl bg-white border border-[#8C6D23] shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-[#F2ECE3] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-serif text-base font-bold text-[#1A2B49]">{lawyerPackageResult.package_title}</h3>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                  Status: Under Review Queue
                </span>
              </div>

              <div className="space-y-3 text-xs text-[#55524E]">
                <div>
                  <h4 className="font-bold text-[#1A2B49] mb-1">Executive Summary:</h4>
                  <p className="leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE2D5]">
                    {lawyerPackageResult.executive_summary}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#1A2B49] mb-1">Questions Prepared for Counsel:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {lawyerPackageResult.key_legal_questions_for_counsel?.map((q: string, idx: number) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-[#1A2B49] mb-1">Recommended Advocate Specialization:</h4>
                  <p className="font-semibold text-[#8C6D23]">
                    {lawyerPackageResult.recommended_advocate_specialization}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLawyerRequest} className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6DFD5] shadow-xs space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-[#55524E] mb-1">
                  What specific questions do you want the lawyer to advise on?
                </label>
                <textarea
                  rows={4}
                  required
                  value={lawyerQuestions}
                  onChange={(e) => setLawyerQuestions(e.target.value)}
                  placeholder="e.g., Should I serve a statutory legal notice under Section 108 of the Transfer of Property Act? What is my limitation deadline to file in the Consumer Forum?"
                  className="w-full p-3.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55524E] mb-1">
                  Private notes for the reviewing advocate (Optional)
                </label>
                <textarea
                  rows={2}
                  value={lawyerNotes}
                  onChange={(e) => setLawyerNotes(e.target.value)}
                  placeholder="Any confidential background or preferred settlement figure..."
                  className="w-full p-3.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingLawyer || !lawyerQuestions.trim()}
                className="w-full py-3 rounded-xl bg-[#1A2B49] text-white hover:bg-[#111C30] text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                {submittingLawyer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Advocate Package...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-[#E6C687]" />
                    Compile Case Package & Request Review
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 8: CASE NOTES */}
      {activeTab === "notes" && (
        <div className="space-y-6 max-w-3xl">
          <form onSubmit={handleAddNote} className="p-6 rounded-3xl bg-white border border-[#E6DFD5] shadow-xs space-y-3">
            <h3 className="font-serif text-base font-bold text-[#1A2B49]">Add Personal Case Note</h3>
            <textarea
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Record private thoughts, telephone conversations, or lawyer advice..."
              className="w-full p-3 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {workspace.notes.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-white border border-[#E6DFD5] text-xs space-y-1">
                <p className="text-[#55524E] leading-relaxed">{n.content}</p>
                <p className="text-[10px] text-[#8C7A63]">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
