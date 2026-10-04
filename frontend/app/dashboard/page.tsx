"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  PlusCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { casesApi, documentsApi, CaseSummary, DocumentSummary } from "@/lib/api";

export default function DashboardPage() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Time-based greeting
  const [greeting, setGreeting] = useState("Good day");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
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

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">🔴 Critical</span>;
      case "high":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">🟠 High</span>;
      case "moderate":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">🔵 Moderate</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Low</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6DFD5] pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1A2B49] tracking-tight">
            {greeting}.
          </h1>
          <p className="text-sm text-[#706E6B] mt-1">
            What legal issue or document can we help you understand today?
          </p>
        </div>
        <Link
          href="/cases/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A2B49] text-white hover:bg-[#111C30] shadow-md transition-all text-sm font-semibold cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4 text-[#E6C687]" />
          <span>Start New Case</span>
        </Link>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/upload"
          className="group p-5 rounded-2xl bg-white border border-[#E6DFD5] hover:border-[#C8B99A] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7F2E8] flex items-center justify-center text-[#8C6D23]">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#C8B99A] group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#1A2B49] mb-1">Understand Document</h3>
            <p className="text-xs text-[#706E6B]">Upload any agreement, notice, or legal letter for plain-language clause breakdown.</p>
          </div>
        </Link>

        <Link
          href="/create"
          className="group p-5 rounded-2xl bg-white border border-[#E6DFD5] hover:border-[#C8B99A] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7F2E8] flex items-center justify-center text-[#8C6D23]">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#C8B99A] group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#1A2B49] mb-1">Create Document</h3>
            <p className="text-xs text-[#706E6B]">Draft a rental agreement, demand notice, or complaint using standard verified clauses.</p>
          </div>
        </Link>

        <Link
          href="/cases/new"
          className="group p-5 rounded-2xl bg-white border border-[#E6DFD5] hover:border-[#C8B99A] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7F2E8] flex items-center justify-center text-[#8C6D23]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#C8B99A] group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#1A2B49] mb-1">Explain Legal Situation</h3>
            <p className="text-xs text-[#706E6B]">Describe what happened in plain words to assess urgency, missing facts, and options.</p>
          </div>
        </Link>
      </div>

      {/* Your Cases Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#8C6D23]" />
            <h2 className="font-serif text-xl font-bold text-[#1A2B49]">Your Cases</h2>
            <span className="text-xs font-semibold bg-[#EFE8DD] text-[#55524E] px-2 py-0.5 rounded-full">
              {cases.length}
            </span>
          </div>
          <Link
            href="/cases/new"
            className="text-xs font-semibold text-[#8C6D23] hover:text-[#1A2B49] flex items-center gap-1 transition-colors"
          >
            + Create New Case
          </Link>
        </div>

        {cases.length === 0 && !loading && (
          <div className="p-8 rounded-2xl bg-white border border-[#E6DFD5] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F7F2E8] text-[#8C6D23] flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#1A2B49]">No active cases yet</h3>
            <p className="text-xs text-[#706E6B] max-w-md mx-auto">
              Start a case to organize your documents, receipts, timeline, and questions inside a single structured workspace.
            </p>
            <Link
              href="/cases/new"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] transition-colors"
            >
              Start Your First Case
            </Link>
          </div>
        )}

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="group p-5 rounded-2xl bg-white border border-[#E6DFD5] hover:border-[#C8B99A] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-bold text-[#1A2B49] group-hover:text-[#8C6D23] transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                  {getUrgencyBadge(c.urgency)}
                </div>
                <p className="text-xs text-[#706E6B] line-clamp-2">
                  {c.ai_summary || c.description || "Case initiated."}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between text-[11px] text-[#8C7A63]">
                <span className="font-medium bg-[#F7F2E8] px-2 py-0.5 rounded text-[#55524E]">
                  {c.issue_type}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : "Recently"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Uploaded Documents Quick Access (Preserving V1) */}
      <div className="space-y-4 pt-4 border-t border-[#E6DFD5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8C6D23]" />
            <h2 className="font-serif text-lg font-bold text-[#1A2B49]">Recent Documents</h2>
            <span className="text-xs font-semibold bg-[#EFE8DD] text-[#55524E] px-2 py-0.5 rounded-full">
              {documents.length}
            </span>
          </div>
          <Link
            href="/upload"
            className="text-xs font-semibold text-[#8C6D23] hover:text-[#1A2B49] transition-colors"
          >
            Upload New File →
          </Link>
        </div>

        {documents.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden divide-y divide-[#F2ECE3]">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="p-4 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F7F2E8] text-[#8C6D23] flex items-center justify-center font-bold text-xs">
                    {doc.file_type.toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/analyze?id=${doc.id}`}
                      className="text-sm font-semibold text-[#1A2B49] hover:text-[#8C6D23] transition-colors"
                    >
                      {doc.name}
                    </Link>
                    <p className="text-[11px] text-[#706E6B]">
                      Uploaded {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#8C7A63] bg-[#EFE8DD] px-2.5 py-0.5 rounded-full">
                    {doc.status}
                  </span>
                  <Link
                    href={`/analyze?id=${doc.id}`}
                    className="text-xs font-semibold text-[#1A2B49] hover:underline"
                  >
                    View Analysis
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-[#E6DFD5] text-center text-xs text-[#706E6B]">
            No uploaded documents yet. Upload a PDF, agreement, or notice to start an analysis.
          </div>
        )}
      </div>
    </div>
  );
}
