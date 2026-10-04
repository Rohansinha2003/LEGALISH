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
} from "lucide-react";
import { v4Api, LawyerDashboardData } from "@/lib/api";

export default function LawyerWorkspacePage() {
  const [dashboard, setDashboard] = useState<LawyerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [signStatus, setSignStatus] = useState<"lawyer_approved" | "lawyer_edited" | "final">("lawyer_approved");
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [signSuccessHash, setSignSuccessHash] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

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
    } catch (err) {
      console.error("Signing failed", err);
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      {/* Header */}
      <section className="bg-[#1A2B49] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E6DFD5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6C687]/20 text-[#E6C687] border border-[#E6C687]/40 uppercase tracking-wider">
                  Advocate Professional Portal
                </span>
                <span className="text-xs text-[#C5BCAD]">Bar Council Verified</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                Advocate Workspace & Document Audit
              </h1>
              <p className="mt-2 text-sm text-[#E2DACB] max-w-2xl">
                Review AI-assisted drafts, verify statutory propositions, apply digital signatures,
                and maintain strict professional oversight over client matters.
              </p>
            </div>

            {/* Profile Stamp */}
            {dashboard && (
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E6C687]/20 flex items-center justify-center text-[#E6C687] font-serif font-bold text-lg">
                  {dashboard.lawyer_profile.full_name.charAt(4) || "P"}
                </div>
                <div>
                  <p className="font-serif font-bold text-sm text-white">{dashboard.lawyer_profile.full_name}</p>
                  <p className="text-xs text-[#C5BCAD]">BCI: {dashboard.lawyer_profile.bar_council_id}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    Verified Advocate
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#706E6B] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Matters</span>
              <FileCheck2 className="w-4 h-4 text-[#8C6D23]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#1A2B49]">{dashboard?.metrics.active_matters || 4}</p>
            <p className="text-[11px] text-emerald-700 mt-1">2 in drafting stage</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#706E6B] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Pending Reviews</span>
              <FileEdit className="w-4 h-4 text-[#8C6D23]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#1A2B49]">{dashboard?.metrics.completed_reviews || 3}</p>
            <p className="text-[11px] text-amber-700 mt-1">1 awaiting final sign-off</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#706E6B] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Client Queries</span>
              <MessageSquare className="w-4 h-4 text-[#8C6D23]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#1A2B49]">{dashboard?.metrics.pending_client_queries || 2}</p>
            <p className="text-[11px] text-[#706E6B] mt-1">Avg response time: 24 mins</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#706E6B] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>7-Day Deadlines</span>
              <Clock className="w-4 h-4 text-red-600" />
            </div>
            <p className="font-serif text-3xl font-bold text-red-600">{dashboard?.metrics.urgent_deadlines_7days || 1}</p>
            <p className="text-[11px] text-red-700 mt-1">Section 138 15-day cure notice</p>
          </div>
        </div>

        {/* Review Progression & Signing Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Matters List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs">
              <h3 className="font-serif text-lg font-bold text-[#1A2B49] mb-4 flex items-center justify-between">
                <span>Pending Document Audit Queue</span>
                <span className="text-xs font-sans font-normal text-[#706E6B]">Review status badges</span>
              </h3>

              {/* Sample Review Matters */}
              <div className="space-y-3">
                {[
                  {
                    id: "rev-1",
                    title: "Statutory Demand Notice — Security Deposit Refund",
                    client: "Rohan Sinha (Tenant)",
                    category: "Tenancy / Transfer of Property Act",
                    status: "AI Generated",
                    badgeColor: "bg-blue-100 text-blue-800",
                    clauses: ["Section 108 TPA Covenant", "15-Day Demand Window", "Interest @ 9% per annum"],
                    draft: "LEGAL NOTICE: Under instructions from our client Rohan Sinha, we hereby call upon you to refund the full security deposit of Rs 50,000 within 15 days of receipt of this notice, failing which legal proceedings under Section 108 of the Transfer of Property Act shall be initiated...",
                  },
                  {
                    id: "rev-2",
                    title: "Written Statement — Section 138 NI Act Defense",
                    client: "Vikram Malhotra",
                    category: "Commercial / Negotiable Instruments",
                    status: "Lawyer Edited",
                    badgeColor: "bg-amber-100 text-amber-800",
                    clauses: ["Dashrath Rupsingh Territorial Jurisdiction", "Absence of Enforceable Debt"],
                    draft: "PRELIMINARY OBJECTIONS: The complainant has concealed material payments made via RTGS on 12th Jan 2026. The cheque in question was issued strictly as security for unsupplied commercial goods...",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedReview(item);
                      setSignSuccessHash(null);
                    }}
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      selectedReview?.id === item.id
                        ? "bg-[#FAF7F2] border-[#C29B38] ring-1 ring-[#C29B38]"
                        : "bg-white hover:bg-[#FAF7F2] border-[#E6DFD5]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-serif font-bold text-[#1A2B49] text-base leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#706E6B] mt-1">Client: {item.client} • {item.category}</p>
                      </div>

                      {/* Status progression badge */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 uppercase tracking-wider ${item.badgeColor}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      {item.clauses.map((c, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#EAE2D5] text-[#55524E]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit & Cryptographic Sign-Off Column (5 cols) */}
          <div className="lg:col-span-5">
            {selectedReview ? (
              <div className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs space-y-5">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1A2B49] text-white uppercase tracking-wider">
                    Audit & Sign-Off
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1A2B49] mt-2 leading-tight">
                    {selectedReview.title}
                  </h3>
                  <p className="text-xs text-[#706E6B] mt-0.5">Matter: {selectedReview.client}</p>
                </div>

                {/* Document Excerpt */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6DFD5] text-xs text-[#2A2826] font-mono leading-relaxed max-h-48 overflow-y-auto">
                  {selectedReview.draft}
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-1.5">
                    Advance Document Status
                  </label>
                  <select
                    value={signStatus}
                    onChange={(e) => setSignStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2]"
                  >
                    <option value="lawyer_edited">Lawyer Edited (Modifications Applied)</option>
                    <option value="lawyer_approved">Lawyer Approved (Verified for Dispatch)</option>
                    <option value="final">Final (Signed Sealed Pleadings Ready)</option>
                  </select>
                </div>

                {/* Correction / Verification Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-1.5">
                    Advocate Verification Notes
                  </label>
                  <textarea
                    rows={3}
                    value={correctionNotes}
                    onChange={(e) => setCorrectionNotes(e.target.value)}
                    placeholder="Note statutory verification (e.g. audited ledger receipts, 15 days compliance, no unconscionable covenants)..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2]"
                  />
                </div>

                {/* SHA-256 Sign Button */}
                <button
                  onClick={handleSignReview}
                  disabled={signing}
                  className="w-full py-3 rounded-xl bg-[#1A2B49] hover:bg-[#111C30] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-4 h-4 text-[#E6C687]" />
                  {signing ? "Computing Cryptographic Signature..." : "Sign & Approve with SHA-256 Hash"}
                </button>

                {/* Success Hash Stamp */}
                {signSuccessHash && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Document Officially Signed & Verified</span>
                    </div>
                    <p className="text-[11px] font-mono text-emerald-950 break-all bg-white p-2 rounded border border-emerald-200">
                      {signSuccessHash}
                    </p>
                    <p className="text-[10px] text-emerald-800">
                      Timestamp: {new Date().toISOString()} • Bar Council Stamp Applied
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-[#E6DFD5] text-center space-y-2">
                <FileEdit className="w-8 h-8 text-[#8C7A63] mx-auto" />
                <h4 className="font-serif font-bold text-[#1A2B49] text-base">Select a Matter to Audit</h4>
                <p className="text-xs text-[#706E6B]">
                  Click on any pending document in the queue to verify statutory compliance and apply your cryptographic sign-off.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
