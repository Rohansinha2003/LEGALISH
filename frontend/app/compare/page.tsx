"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowRight,
  GitCompare,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  Edit3,
  ShieldAlert,
  Loader2,
  Sparkles,
  Download,
  Info,
  Scale,
} from "lucide-react";
import {
  documentsApi,
  intelligenceV3Api,
  DocumentSummary,
  DocumentComparisonResponse,
  RedlineDiffItem,
} from "@/lib/api";
import toast from "react-hot-toast";

export default function DocumentComparePage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [doc1Id, setDoc1Id] = useState("");
  const [doc2Id, setDoc2Id] = useState("");
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<DocumentComparisonResponse | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    async function loadDocs() {
      try {
        const docs = await documentsApi.list();
        setDocuments(docs || []);
        if (docs && docs.length >= 2) {
          setDoc1Id(docs[0].id);
          setDoc2Id(docs[1].id);
        } else if (docs && docs.length === 1) {
          setDoc1Id(docs[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load documents:", err);
      } finally {
        setLoadingDocs(false);
      }
    }
    loadDocs();
  }, []);

  const handleCompare = async () => {
    if (!doc1Id || !doc2Id) {
      toast.error("Please select two documents to compare.");
      return;
    }
    if (doc1Id === doc2Id) {
      toast.error("Please select two different documents to detect changes.");
      return;
    }

    setComparing(true);
    try {
      const res = await intelligenceV3Api.compareDocuments(doc1Id, doc2Id);
      setResult(res);
      toast.success("Document comparison and redline complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to compare documents.");
    } finally {
      setComparing(false);
    }
  };

  const handleLoadSample = async () => {
    setComparing(true);
    try {
      // If we don't have 2 docs in DB, pass sample IDs or existing ones
      const sample1 = doc1Id || (documents[0]?.id) || "00000000-0000-0000-0000-000000000001";
      const sample2 = (documents[1]?.id) || "00000000-0000-0000-0000-000000000002";
      const res = await intelligenceV3Api.compareDocuments(sample1, sample2);
      setResult(res);
      toast.success("Loaded sample tenancy contract amendment comparison!");
    } catch (err: any) {
      // In case dummy IDs fail, generate a synthetic demo preview
      setResult({
        doc_1_title: "Standard Residential Tenancy Agreement 2024",
        doc_2_title: "Landlord Proposed Amended Agreement 2025",
        summary_of_changes: "The revised draft introduces a 15-day notice reduction, unilateral forfeiture of security deposit on minor repair claims, and shifts structural maintenance liabilities entirely onto the tenant.",
        total_modifications: 4,
        added_clauses: 1,
        removed_clauses: 1,
        modified_clauses: 2,
        risk_warning: "HIGH RISK: The counterparty has inserted a unilateral deposit deduction clause and shortened the notice period to 15 days without standard 30-day cure rights.",
        differences: [
          {
            section_title: "Clause 4: Security Deposit Refund & Deductions",
            diff_type: "modified",
            text_v1: "Security deposit shall be refunded in full within 14 banking days of vacating, subject only to actual unpaid utility bills.",
            text_v2: "Security deposit may be retained or deducted at the sole discretion of the Lessor for any alleged wear, tear, or repaint requirements, with 45-day refund window.",
            explanation: "This unilateral amendment removes the requirement for objective proof of damage and grants the landlord unconstrained discretion to withhold your funds.",
            risk_level: "high",
          },
          {
            section_title: "Clause 9: Termination and Notice Period",
            diff_type: "modified",
            text_v1: "Either party may terminate this agreement by providing at least 30 (thirty) days written notice.",
            text_v2: "The Lessor may terminate this agreement by giving 15 (fifteen) days notice. Lessee must provide 60 (sixty) days notice.",
            explanation: "Asymmetric notice periods heavily bias termination power against the tenant.",
            risk_level: "high",
          },
          {
            section_title: "Clause 14: Indemnification for Third Party Claims",
            diff_type: "added",
            text_v1: "",
            text_v2: "Lessee agrees to fully indemnify and hold harmless the Lessor from any municipal, tax, or society penalties arising during the tenancy period.",
            explanation: "Shifts statutory property tax liabilities that belong to the property owner onto the tenant.",
            risk_level: "medium",
          },
          {
            section_title: "Clause 18: Mutual Arbitration Clause",
            diff_type: "removed",
            text_v1: "Any dispute shall be referred to a mutually appointed sole arbitrator in accordance with the Arbitration and Conciliation Act, 1996.",
            text_v2: "",
            explanation: "Removing the arbitration clause leaves parties with prolonged court litigation rather than expedited conciliation.",
            risk_level: "low",
          },
        ],
      });
      toast.success("Displaying sample contract redline preview!");
    } finally {
      setComparing(false);
    }
  };

  const filteredDiffs = result?.differences.filter((d) => {
    if (filterType === "all") return true;
    if (filterType === "high-risk") return d.risk_level === "high";
    return d.diff_type === filterType;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#706E6B] mb-2">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span className="text-[#1A2B49] font-medium">Contract Comparison & Redline</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#1A2B49] tracking-tight flex items-center gap-2.5">
                <GitCompare className="w-8 h-8 text-[#8C6D23]" />
                Contract Redline & Comparison Engine
              </h1>
              <p className="text-sm text-[#55524E] mt-1 max-w-2xl">
                Compare original agreements against proposed amendments, counterparty markups, or renewal notices. Detect hidden clause modifications and unilateral risk shifts.
              </p>
            </div>
            <button
              onClick={handleLoadSample}
              disabled={comparing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5CCBE] bg-[#F3EDE3] hover:bg-[#EAE2D5] text-[#1A2B49] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#8C6D23]" />
              Load Sample Comparison
            </button>
          </div>
        </div>

        {/* Selection Box */}
        <div className="bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] p-6 shadow-xs">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#706E6B] mb-4">
            Select Two Document Versions to Compare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document A */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1A2B49]">
                Original / Version 1 (Baseline)
              </label>
              <select
                value={doc1Id}
                onChange={(e) => setDoc1Id(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFBF7] text-sm text-[#1A2B49] focus:outline-hidden focus:ring-2 focus:ring-[#8C6D23]/30"
              >
                <option value="">-- Select Baseline Document --</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.file_type.toUpperCase()})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#706E6B]">
                The original signed agreement or your drafted baseline.
              </p>
            </div>

            {/* Document B */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1A2B49]">
                Revised / Version 2 (Counterparty or Amended)
              </label>
              <select
                value={doc2Id}
                onChange={(e) => setDoc2Id(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFBF7] text-sm text-[#1A2B49] focus:outline-hidden focus:ring-2 focus:ring-[#8C6D23]/30"
              >
                <option value="">-- Select Revised Document --</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.file_type.toUpperCase()})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#706E6B]">
                The new draft, renewed contract, or counterparty redline.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#EAE2D5]">
            <Link
              href="/upload"
              className="text-xs text-[#8C6D23] hover:underline flex items-center gap-1 mr-auto font-medium"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Upload new document for comparison
            </Link>

            <button
              onClick={handleCompare}
              disabled={comparing || !doc1Id || !doc2Id}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A2B49] hover:bg-[#111C30] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {comparing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E6C687]" />
                  Analyzing Clauses & Redlines...
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4 text-[#E6C687]" />
                  Compare & Generate Redline
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comparison Result Display */}
        {result && (
          <div className="space-y-6">
            {/* Risk Warning Alert */}
            {result.risk_warning && (
              <div className="bg-[#FFF8E6] border border-[#F0D597] rounded-2xl p-5 shadow-xs flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#8C6D23]/15 text-[#8C6D23] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#634907]">Legal Risk Assessment</h3>
                  <p className="text-xs text-[#70530A] leading-relaxed">
                    {result.risk_warning}
                  </p>
                </div>
              </div>
            )}

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#F7F2E8] border border-[#E6DFD5] rounded-xl p-4">
                <span className="text-xs text-[#706E6B]">Total Modifications</span>
                <p className="text-2xl font-bold font-serif text-[#1A2B49] mt-1">{result.total_modifications}</p>
              </div>
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4">
                <span className="text-xs text-[#166534]">Clauses Added (+)</span>
                <p className="text-2xl font-bold font-serif text-[#15803D] mt-1">{result.added_clauses}</p>
              </div>
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
                <span className="text-xs text-[#991B1B]">Clauses Removed (-)</span>
                <p className="text-2xl font-bold font-serif text-[#B91C1C] mt-1">{result.removed_clauses}</p>
              </div>
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4">
                <span className="text-xs text-[#92400E]">Clauses Modified (~)</span>
                <p className="text-2xl font-bold font-serif text-[#B45309] mt-1">{result.modified_clauses}</p>
              </div>
            </div>

            {/* Document Comparison Details & Filters */}
            <div className="bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2D5]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A2B49]">
                    Clause-by-Clause Redline Breakdown
                  </h3>
                  <p className="text-xs text-[#706E6B]">
                    Comparing <span className="font-semibold text-[#1A2B49]">{result.doc_1_title}</span> vs <span className="font-semibold text-[#1A2B49]">{result.doc_2_title}</span>
                  </p>
                </div>

                {/* Filter Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "all", label: "All Changes" },
                    { id: "high-risk", label: "High Risk Only" },
                    { id: "added", label: "Added (+)" },
                    { id: "removed", label: "Removed (-)" },
                    { id: "modified", label: "Modified (~)" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterType(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        filterType === f.id
                          ? "bg-[#1A2B49] text-white"
                          : "bg-[#F3EDE3] text-[#55524E] hover:bg-[#EAE2D5]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clause Diff Items */}
              <div className="space-y-4">
                {filteredDiffs && filteredDiffs.length > 0 ? (
                  filteredDiffs.map((diff, idx) => (
                    <div
                      key={idx}
                      className="border border-[#E6DFD5] rounded-xl bg-[#FDFBF7] p-5 space-y-4 shadow-2xs"
                    >
                      {/* Diff Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {diff.diff_type === "added" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D]">
                              <PlusCircle className="w-3 h-3" /> Added Clause
                            </span>
                          )}
                          {diff.diff_type === "removed" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#B91C1C]">
                              <MinusCircle className="w-3 h-3" /> Removed Clause
                            </span>
                          )}
                          {diff.diff_type === "modified" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309]">
                              <Edit3 className="w-3 h-3" /> Modified Text
                            </span>
                          )}

                          <span className="font-semibold text-sm text-[#1A2B49]">
                            {diff.section_title}
                          </span>
                        </div>

                        {/* Risk Indicator */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              diff.risk_level === "high"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : diff.risk_level === "medium"
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {diff.risk_level} Risk
                          </span>
                        </div>
                      </div>

                      {/* Plain-Language Citizen Explanation */}
                      <div className="bg-[#F7F2E8] border border-[#EAE2D5] rounded-lg p-3 text-xs text-[#55524E] flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-[#8C6D23] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#1A2B49] block font-medium">Why this matters:</strong>
                          <p className="mt-0.5 leading-relaxed">{diff.explanation}</p>
                        </div>
                      </div>

                      {/* Side-by-side or Stacked Text View */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        {/* Prior Text */}
                        <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E6DFD5] space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#706E6B] tracking-wider block font-sans">
                            Prior Draft (V1)
                          </span>
                          <p className="text-[#706E6B] leading-relaxed whitespace-pre-wrap">
                            {diff.text_v1 ? diff.text_v1 : <em className="text-[#A8A29E] font-sans">Clause not present in original draft</em>}
                          </p>
                        </div>

                        {/* Amended Text */}
                        <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#1E293B] tracking-wider block font-sans">
                            Amended Draft (V2)
                          </span>
                          <p className="text-[#0F172A] leading-relaxed whitespace-pre-wrap font-medium">
                            {diff.text_v2 ? diff.text_v2 : <em className="text-[#A8A29E] font-sans">Clause deleted from revised draft</em>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-[#706E6B]">
                    No changes found matching the selected filter.
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps Recommendation */}
            <div className="bg-[#1A2B49] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#FAF7F2]">
                  Unsure if you should sign the amended agreement?
                </h4>
                <p className="text-xs text-[#D5CCBE]">
                  Get a verified Bar Council advocate to review high-risk clause shifts before signing.
                </p>
              </div>
              <Link
                href="/lawyers"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E6C687] hover:bg-[#D9B56F] text-[#1A2B49] text-xs font-bold transition-colors shadow-xs"
              >
                <Scale className="w-4 h-4" />
                Consult an Advocate
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
