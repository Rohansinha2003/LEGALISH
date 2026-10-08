"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  PlusCircle,
  MessageSquareText,
  FilePlus2,
  Languages,
  HeartHandshake,
  ArrowRight,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  BookmarkCheck,
  Search,
  Sparkles,
  Scale,
  Send,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { casesApi, documentsApi, CaseSummary, DocumentSummary } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"cases" | "documents" | "deadlines" | "research">("cases");

  // Time-based greeting (Prompt #13)
  const [greeting, setGreeting] = useState("Good evening.");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning.");
    else if (hour < 17) setGreeting("Good afternoon.");
    else setGreeting("Good evening.");
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [casesRes, docsRes] = await Promise.allSettled([
          casesApi.list(),
          documentsApi.list(),
        ]);
        if (casesRes.status === "fulfilled") setCases(casesRes.value);
        if (docsRes.status === "fulfilled") setDocuments(docsRes.value);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(quickQuery.trim())}`);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAEDED] text-[#D95C55] border border-[#F7D1CF]">
            ● Critical
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF4E6] text-[#C98A16] border border-[#F3E3BC]">
            ● High Priority
          </span>
        );
      case "moderate":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF0FC] text-[#4F46E5] border border-[#C7D0FA]">
            ● Moderate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7F2] text-[#0F5C3E] border border-[#BCE5D5]">
            ● Active
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] dark:bg-[#0D0D0F] text-[#171717] dark:text-[#F5F5F5] py-10 md:py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ─── 1. HEADER (Prompt #13) ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DED8CD] dark:border-[#26262B] pb-8">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#171717] dark:text-[#F5F5F5]">
              {greeting}
            </h1>
            <p className="font-sans text-base sm:text-lg text-[#6B6862] dark:text-[#A1A1A8] mt-2">
              What would you like to understand today?
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171717] dark:bg-[#F5F5F5] hover:bg-[#2B2B2B] text-[#FBF9F5] dark:text-[#171717] shadow-xs transition-all text-xs font-semibold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Case</span>
            </Link>
          </div>
        </div>

        {/* ─── 2. AI COMMAND CENTER (Prompt #13) ─── */}
        <div className="bg-[#FBF9F5] dark:bg-[#151518] rounded-3xl p-6 sm:p-7 border border-[#DED8CD] dark:border-[#26262B] shadow-[0_8px_30px_rgba(23,23,23,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#F5F1FD] dark:bg-[#2A213D] text-[#7C3AED] flex items-center justify-center font-serif text-xs font-bold">
                ✦
              </span>
              <h3 className="text-sm font-bold text-[#171717] dark:text-[#F5F5F5]">
                What can I help you understand?
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#8C8880]">Legal Copilot V4</span>
          </div>

          <form onSubmit={handleQuickAsk} className="space-y-3">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Ask a legal question or upload a document..."
              className="w-full px-4 py-3.5 rounded-2xl text-sm border border-[#DED8CD] dark:border-[#26262B] bg-[#F4F0E8] dark:bg-[#1D1D22] text-[#171717] dark:text-[#F5F5F5] placeholder-[#8C8880] focus:outline-none focus:border-[#7C3AED] transition-colors"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs text-[#6B6862]">
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE9DE] dark:bg-[#23232A] hover:bg-[#EAE5DA] text-[#171717] dark:text-[#F5F5F5] font-medium transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>Upload Document</span>
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE9DE] dark:bg-[#23232A] hover:bg-[#EAE5DA] text-[#171717] dark:text-[#F5F5F5] font-medium transition-colors"
                >
                  <FilePlus2 className="w-3.5 h-3.5 text-[#C98A16]" />
                  <span>Generate Agreement</span>
                </Link>
              </div>

              <button
                type="submit"
                disabled={!quickQuery.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#171717] dark:bg-[#F5F5F5] disabled:opacity-40 text-[#FBF9F5] dark:text-[#171717] text-xs font-semibold hover:bg-[#2B2B2B] transition-all cursor-pointer shadow-xs"
              >
                <span>Ask</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* ─── 3. WORKSPACE OVERVIEW CARDS (Prompt #13) ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab("cases")}
            className={`p-5 rounded-3xl border transition-all text-left cursor-pointer ${
              activeTab === "cases"
                ? "bg-[#FBF9F5] dark:bg-[#151518] border-[#4F46E5] shadow-md ring-2 ring-[#4F46E5]/10"
                : "bg-[#FBF9F5] dark:bg-[#151518] border-[#DED8CD] dark:border-[#26262B] hover:border-[#B3A996]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6B6862] dark:text-[#A1A1A8]">Active Cases</span>
              <Briefcase className="w-4 h-4 text-[#4F46E5]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#171717] dark:text-[#F5F5F5]">{cases.length}</p>
            <span className="text-[11px] text-[#4F46E5] font-semibold mt-1 inline-block">View all cases →</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`p-5 rounded-3xl border transition-all text-left cursor-pointer ${
              activeTab === "documents"
                ? "bg-[#FBF9F5] dark:bg-[#151518] border-[#4F46E5] shadow-md ring-2 ring-[#4F46E5]/10"
                : "bg-[#FBF9F5] dark:bg-[#151518] border-[#DED8CD] dark:border-[#26262B] hover:border-[#B3A996]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6B6862] dark:text-[#A1A1A8]">Recent Documents</span>
              <FileText className="w-4 h-4 text-[#4F46E5]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#171717] dark:text-[#F5F5F5]">{documents.length}</p>
            <span className="text-[11px] text-[#4F46E5] font-semibold mt-1 inline-block">Uploaded docs →</span>
          </button>

          <button
            onClick={() => setActiveTab("deadlines")}
            className={`p-5 rounded-3xl border transition-all text-left cursor-pointer ${
              activeTab === "deadlines"
                ? "bg-[#FBF9F5] dark:bg-[#151518] border-[#D95C55] shadow-md ring-2 ring-[#D95C55]/10"
                : "bg-[#FBF9F5] dark:bg-[#151518] border-[#DED8CD] dark:border-[#26262B] hover:border-[#B3A996]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6B6862] dark:text-[#A1A1A8]">Important Deadlines</span>
              <Clock className="w-4 h-4 text-[#D95C55]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#D95C55]">1</p>
            <span className="text-[11px] text-[#D95C55] font-semibold mt-1 inline-block">1 critical due →</span>
          </button>

          <button
            onClick={() => setActiveTab("research")}
            className={`p-5 rounded-3xl border transition-all text-left cursor-pointer ${
              activeTab === "research"
                ? "bg-[#FBF9F5] dark:bg-[#151518] border-[#0F9F9A] shadow-md ring-2 ring-[#0F9F9A]/10"
                : "bg-[#FBF9F5] dark:bg-[#151518] border-[#DED8CD] dark:border-[#26262B] hover:border-[#B3A996]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6B6862] dark:text-[#A1A1A8]">Saved Research</span>
              <BookmarkCheck className="w-4 h-4 text-[#0F9F9A]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#171717] dark:text-[#F5F5F5]">4</p>
            <span className="text-[11px] text-[#0F9F9A] font-semibold mt-1 inline-block">Precedents & acts →</span>
          </button>
        </div>

        {/* ─── 4. IMPORTANT DEADLINES NOTIFICATION BANNER ─── */}
        <div className="p-5 rounded-3xl bg-[#FAEDED] dark:bg-[#251515] border border-[#F7D1CF] dark:border-[#3D2222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D95C55]/20 text-[#D95C55] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#9A3C36] dark:text-[#FCA5A5]">
                  Statutory Limitation Period Expiring
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D95C55] text-white">
                  3 Days Remaining
                </span>
              </div>
              <p className="text-xs text-[#9A3C36] dark:text-[#FCA5A5] mt-0.5">
                Transfer of Property Act § 106: Landlord demand notice cure period expires on 9th Oct. Prepare formal response notice.
              </p>
            </div>
          </div>

          <Link
            href="/create"
            className="px-4 py-2 rounded-full bg-[#D95C55] text-white text-xs font-semibold hover:bg-[#C24D46] transition-colors shrink-0 text-center"
          >
            Draft Response Notice →
          </Link>
        </div>

        {/* ─── 5. TABBED WORKSPACE CONTENT ─── */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-[#DED8CD] dark:border-[#26262B] pb-2">
            {[
              { id: "cases", label: `Active Cases (${cases.length})` },
              { id: "documents", label: `Recent Documents (${documents.length})` },
              { id: "deadlines", label: "Important Deadlines (1)" },
              { id: "research", label: "Saved Research (4)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === t.id
                    ? "bg-[#171717] dark:bg-white text-white dark:text-[#171717]"
                    : "text-[#6B6862] hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Cases Tab */}
          {activeTab === "cases" && (
            <div className="space-y-3">
              {cases.length > 0 ? (
                cases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="paper-card p-5 block space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-serif">🏠</span>
                          <span className="text-[11px] font-semibold text-[#6B6862] uppercase tracking-wider">
                            {c.issue_type}
                          </span>
                          {getUrgencyBadge(c.urgency)}
                        </div>
                        <h4 className="font-serif text-lg font-bold text-[#171717] dark:text-[#F5F5F5] group-hover:text-[#4F46E5] transition-colors">
                          {c.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-[#4F46E5] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <p className="text-xs text-[#6B6862] dark:text-[#A1A1A8] line-clamp-2">
                      {c.ai_summary || c.description || "Case chronology, evidence ledger, and AI research store active."}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#8C8880] border-t border-[#EAE5DA] dark:border-[#26262B]">
                      <span>Jurisdiction: {c.city ? `${c.city}, ` : ""}{c.state || "Delhi • Civil"}</span>
                      <span>Next Step: Review response notice draft</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[#FBF9F5] border border-[#DED8CD] space-y-3">
                  <span className="font-serif text-2xl text-[#8C8880]">✦</span>
                  <h4 className="font-serif text-lg font-bold">No cases registered yet</h4>
                  <p className="text-xs text-[#6B6862]">Create your first case to track documents, deadlines, and evidence.</p>
                  <Link
                    href="/cases/new"
                    className="inline-block px-5 py-2.5 rounded-full bg-[#171717] text-white text-xs font-semibold"
                  >
                    Start First Case
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="space-y-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/analyze/${doc.id}`}
                    className="paper-card p-5 block space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#EEF0FC] text-[#4F46E5] flex items-center justify-center font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif text-base font-bold text-[#171717] dark:text-[#F5F5F5] group-hover:text-[#4F46E5] transition-colors">
                            {doc.name || doc.original_filename}
                          </h4>
                          <span className="text-[11px] text-[#6B6862]">
                            {doc.file_type || "Legal Document"} • {doc.status}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#4F46E5] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        View Analysis <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[#FBF9F5] border border-[#DED8CD] space-y-3">
                  <span className="font-serif text-2xl text-[#8C8880]">✦</span>
                  <h4 className="font-serif text-lg font-bold">No documents uploaded yet</h4>
                  <p className="text-xs text-[#6B6862]">Upload a contract, lease, or notice for instant AI clause extraction.</p>
                  <Link
                    href="/upload"
                    className="inline-block px-5 py-2.5 rounded-full bg-[#171717] text-white text-xs font-semibold"
                  >
                    Upload Document
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Deadlines Tab */}
          {activeTab === "deadlines" && (
            <div className="paper-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DA]">
                <h4 className="font-serif text-base font-bold">Limitation Act & Notice Schedule</h4>
                <span className="text-xs font-semibold text-[#D95C55]">1 Statutory Cure Window</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAEDED] border border-[#F7D1CF] space-y-1 text-xs">
                <span className="font-bold text-[#9A3C36]">Section 106 Notice — Security Deposit Refund</span>
                <p className="text-[#9A3C36]">15-day statutory cure window expires on 9th Oct 2026. If refund is not disbursed, initiate DLSA conciliation or summary suit under Order 37 CPC.</p>
              </div>
            </div>
          )}

          {/* Research Tab */}
          {activeTab === "research" && (
            <div className="paper-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DA]">
                <h4 className="font-serif text-base font-bold">Bookmarked Case-Law & Bare Acts</h4>
                <Link href="/caselaw" className="text-xs text-[#0F9F9A] font-semibold hover:underline">Search Library →</Link>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#ECF9F8] border border-[#B2E7E5] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#0D8682]">Supreme Court of India • Kailash Nath Associates v. DDA (2015)</span>
                    <p className="text-[#0D8682] text-[11px]">Strict proof of damage required under Section 74 before earnest money can be forfeited.</p>
                  </div>
                  <Link href="/caselaw" className="text-[#0F9F9A] font-bold text-xs">Read Ratio →</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
