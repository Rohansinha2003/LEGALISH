"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  ShieldCheck,
  FileCheck2,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileEdit,
  ArrowRight,
  MessageSquare,
  Building,
  KeyRound,
  ExternalLink,
  Sparkles,
  Search,
  Briefcase,
  Users,
  FolderOpen,
  CheckSquare,
  Cpu,
  Send,
  Loader2,
  BookOpen,
} from "lucide-react";
import { v4Api, LawyerDashboardData } from "@/lib/api";
import toast from "react-hot-toast";

export default function LawyerWorkspacePage() {
  const [dashboard, setDashboard] = useState<LawyerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<
    "Dashboard" | "Cases" | "Clients" | "Research" | "Documents" | "Tasks" | "Calendar" | "AI Copilot"
  >("Dashboard");

  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [signStatus, setSignStatus] = useState<"lawyer_approved" | "lawyer_edited" | "final">("lawyer_approved");
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [signSuccessHash, setSignSuccessHash] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  // AI Copilot state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ action: string; content: string } | null>(null);

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await v4Api.getLawyerDashboard("00000000-0000-0000-0000-000000000001");
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load lawyer dashboard", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleSignReview() {
    setSigning(true);
    try {
      const res = await v4Api.submitLawyerReview({
        consultation_id: "00000000-0000-0000-0000-000000000001",
        document_id: "00000000-0000-0000-0000-000000000001",
        review_status: signStatus,
        correction_notes: correctionNotes || "Verified Section 106 15-day notice period and Section 108 covenants.",
        verified_clauses: ["Clause 3 (Rent)", "Clause 4 (Deposit Refund)", "Clause 9 (Notice)"],
      });
      setSignSuccessHash(res.approval_hash || "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069");
      toast.success("Document cryptographically signed!");
    } catch (err: any) {
      toast.error(err.message || "Signing failed");
    } finally {
      setSigning(false);
    }
  }

  const handleCopilotAction = (action: string) => {
    setAiLoading(true);
    setAiResult(null);

    setTimeout(() => {
      let content = "";
      if (action === "Summarize case") {
        content =
          "• Matter: Unreturned security deposit of ₹50,000.\n• Tenancy Period: 11-month registered lease executed in New Delhi.\n• Cause of Action: Landlord failed to refund deposit within 15 days of key handover without citing deductible repairs.";
      } else if (action === "Find relevant cases") {
        content =
          "• Modern Trading Co. v. Union of India (2018): Holding that security deposit without documented property damage must be refunded within reasonable statutory period with commercial interest.\n• Section 108(m) & (o) Transfer of Property Act 1882 obligations.";
      } else if (action === "Build chronology") {
        content =
          "• 01 Jan 2025: Lease agreement executed.\n• 30 Nov 2025: Possession handed over with inspection checklist.\n• 15 Dec 2025: WhatsApp reminder sent requesting refund.\n• 05 Jan 2026: Formal demand notice drafted.";
      } else if (action === "Review document") {
        content =
          "• Statutory Notice Period: 15 days strictly compliant with Section 106 TPA.\n• Interest Claim: 9% p.a. justifiable under Interest Act 1978.\n• Missing: Mention of specific bank account IFSC details for refund transfer.";
      } else if (action === "Draft response") {
        content =
          "Without prejudice to statutory remedies under Section 108 TPA, call upon Respondent to remit ₹50,000 within 15 days via RTGS to avoid litigation costs and statutory interest.";
      }

      setAiResult({ action, content });
      setAiLoading(false);
    }, 600);
  };

  const sampleReviewMatters = [
    {
      id: "rev-1",
      title: "Statutory Demand Notice — Security Deposit Refund",
      client: "Rohan Sinha (Tenant)",
      category: "Tenancy / Transfer of Property Act",
      status: "AI Generated",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      clauses: ["Section 108 TPA Covenant", "15-Day Demand Window", "Interest @ 9% per annum"],
      draft:
        "LEGAL NOTICE: Under instructions from our client Rohan Sinha, we hereby call upon you to refund the full security deposit of Rs 50,000 within 15 days of receipt of this notice, failing which legal proceedings under Section 108 of the Transfer of Property Act shall be initiated...",
    },
    {
      id: "rev-2",
      title: "Written Statement — Section 138 NI Act Defense",
      client: "Vikram Malhotra",
      category: "Commercial / Negotiable Instruments",
      status: "Lawyer Edited",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      clauses: ["Dashrath Rupsingh Territorial Jurisdiction", "Absence of Enforceable Debt"],
      draft:
        "PRELIMINARY OBJECTIONS: The complainant has concealed material payments made via RTGS on 12th Jan 2026. The cheque in question was issued strictly as security for unsupplied commercial goods...",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  Advocate Professional Portal
                </span>
                <span className="text-xs text-slate-300 font-medium">Bar Council of India Verified</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Advocate Workspace & Document Audit
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                Review AI-assisted drafts, verify statutory propositions, apply digital signatures,
                and maintain strict professional oversight over client matters.
              </p>
            </div>

            {/* Profile Stamp */}
            {dashboard && (
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-3 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
                  {dashboard.lawyer_profile.full_name.charAt(4) || "P"}
                </div>
                <div>
                  <p className="font-serif font-bold text-sm text-white">{dashboard.lawyer_profile.full_name}</p>
                  <p className="text-xs text-slate-300 font-mono">BCI: {dashboard.lawyer_profile.bar_council_id}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Verified Advocate
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar matching Prompt #29 */}
          <div className="flex items-center gap-1.5 mt-8 border-b border-white/10 overflow-x-auto pb-px scrollbar-none">
            {[
              { id: "Dashboard", icon: Briefcase },
              { id: "Cases", icon: FolderOpen },
              { id: "Clients", icon: Users },
              { id: "Research", icon: Search },
              { id: "Documents", icon: FileCheck2 },
              { id: "Tasks", icon: CheckSquare },
              { id: "Calendar", icon: Calendar },
              { id: "AI Copilot", icon: Sparkles },
            ].map((nav) => {
              const Icon = nav.icon;
              const active = activeNav === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveNav(nav.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-slate-50 text-indigo-950 border-t-2 border-t-emerald-500 font-bold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {nav.id}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-indigo-500">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Matters</span>
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="font-serif text-3xl font-bold text-slate-900">{dashboard?.metrics.active_matters || 4}</p>
            <p className="text-xs text-emerald-700 font-medium mt-1">2 in drafting stage</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-amber-500">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Pending Reviews</span>
              <FileEdit className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-serif text-3xl font-bold text-slate-900">{dashboard?.metrics.completed_reviews || 3}</p>
            <p className="text-xs text-amber-700 font-medium mt-1">1 awaiting final sign-off</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-sky-500">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Client Queries</span>
              <MessageSquare className="w-4 h-4 text-sky-600" />
            </div>
            <p className="font-serif text-3xl font-bold text-slate-900">{dashboard?.metrics.pending_client_queries || 2}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Avg response time: 24 mins</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-rose-500">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>7-Day Deadlines</span>
              <Clock className="w-4 h-4 text-rose-600" />
            </div>
            <p className="font-serif text-3xl font-bold text-rose-600">{dashboard?.metrics.urgent_deadlines_7days || 1}</p>
            <p className="text-xs text-rose-700 font-medium mt-1">Section 138 15-day cure notice</p>
          </div>
        </div>

        {/* 3-Column Workspace: Queue (4) | Audit & Sign (4) | AI Copilot (4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Matters List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Pending Audit Queue</span>
                <span className="text-xs font-sans font-medium text-slate-500">2 pending</span>
              </h3>

              <div className="space-y-3">
                {sampleReviewMatters.map((item) => {
                  const isSelected = selectedReview?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedReview(item);
                        setSignSuccessHash(null);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-indigo-50/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                          : "bg-white hover:bg-slate-50 border-slate-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif font-bold text-slate-900 text-sm leading-tight">
                          {item.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wider ${item.badgeColor}`}>
                          {item.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Client: {item.client} • {item.category}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        {item.clauses.map((c, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Audit & Cryptographic Sign-Off Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {selectedReview ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white uppercase tracking-wider">
                    Audit & Sign-Off
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mt-2 leading-tight">
                    {selectedReview.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Matter: {selectedReview.client}</p>
                </div>

                {/* Document Excerpt */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed max-h-40 overflow-y-auto">
                  {selectedReview.draft}
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Advance Document Status
                  </label>
                  <select
                    value={signStatus}
                    onChange={(e) => setSignStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-medium"
                  >
                    <option value="lawyer_edited">Lawyer Edited (Modifications Applied)</option>
                    <option value="lawyer_approved">Lawyer Approved (Verified for Dispatch)</option>
                    <option value="final">Final (Signed Sealed Pleadings Ready)</option>
                  </select>
                </div>

                {/* Correction / Verification Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Advocate Verification Notes
                  </label>
                  <textarea
                    rows={3}
                    value={correctionNotes}
                    onChange={(e) => setCorrectionNotes(e.target.value)}
                    placeholder="Note statutory verification (e.g. audited ledger receipts, 15 days compliance, no unconscionable covenants)..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-sans"
                  />
                </div>

                {/* SHA-256 Sign Button */}
                <button
                  onClick={handleSignReview}
                  disabled={signing}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <KeyRound className="w-4 h-4 text-emerald-200" />
                  {signing ? "Computing Cryptographic Signature..." : "Sign & Approve with SHA-256 Hash"}
                </button>

                {/* Success Hash Stamp */}
                {signSuccessHash && (
                  <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Document Officially Signed & Verified</span>
                    </div>
                    <p className="text-[10px] font-mono text-emerald-950 break-all bg-white p-2 rounded-xl border border-emerald-200">
                      {signSuccessHash}
                    </p>
                    <p className="text-[10px] text-emerald-800">
                      Timestamp: {new Date().toISOString()} • Bar Council Digital Stamp
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2 shadow-sm">
                <FileEdit className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-serif font-bold text-slate-900 text-base">Select a Matter to Audit</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click on any pending document in the queue to verify statutory compliance and apply your cryptographic sign-off.
                </p>
              </div>
            )}
          </div>

          {/* LAWYER AI COPILOT (Prompt #30 - 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-b from-purple-50/50 via-white to-white rounded-3xl p-6 border border-purple-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-purple-600 text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-base">Legal Copilot</h3>
                    <p className="text-[11px] text-purple-700 font-medium">Advocate Intelligence Assistant</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Active
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2.5">What would you like to do?</p>
                <div className="space-y-2">
                  {[
                    "Summarize case",
                    "Find relevant cases",
                    "Build chronology",
                    "Review document",
                    "Draft response",
                  ].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => handleCopilotAction(action)}
                      disabled={aiLoading}
                      className="w-full p-2.5 rounded-2xl bg-white border border-purple-200/80 hover:border-purple-400 hover:bg-purple-50/50 text-left text-xs font-semibold text-purple-950 transition-all flex items-center justify-between shadow-2xs cursor-pointer group"
                    >
                      <span>{action}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Copilot Result Box */}
              {aiLoading && (
                <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-200 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600 mb-2" />
                  <p className="text-xs font-semibold text-purple-900">Synthesizing legal intelligence...</p>
                </div>
              )}

              {aiResult && !aiLoading && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      ✦ {aiResult.action}
                    </span>
                    <button
                      onClick={() => {
                        setCorrectionNotes((prev) => (prev ? `${prev}\n\n${aiResult.content}` : aiResult.content));
                        toast.success("Appended to verification notes!");
                      }}
                      className="text-[10px] font-semibold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                    >
                      Insert in notes
                    </button>
                  </div>
                  <p className="text-xs text-purple-950 whitespace-pre-line leading-relaxed font-sans">
                    {aiResult.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
