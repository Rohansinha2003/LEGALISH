"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  Search,
  BookOpen,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  v4Api,
  JudgmentItem,
  JudgmentSummaryItem,
  JudgmentCompareResult,
  CitationVerifyResult,
  TemporalLawResult,
} from "@/lib/api";

export default function CaseLawPage() {
  const [activeTab, setActiveTab] = useState<"search" | "compare" | "citation" | "temporal">("search");

  // Search & Summary State
  const [searchQuery, setSearchQuery] = useState("deposit");
  const [courtFilter, setCourtFilter] = useState("");
  const [searchResults, setSearchResults] = useState<JudgmentItem[]>([]);
  const [selectedJudgment, setSelectedJudgment] = useState<JudgmentItem | null>(null);
  const [summary, setSummary] = useState<JudgmentSummaryItem | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Compare State
  const [compareIdA, setCompareIdA] = useState("");
  const [compareIdB, setCompareIdB] = useState("");
  const [compareIssue, setCompareIssue] = useState("Compounding vs Strict Liability under Section 138 NI Act");
  const [compareResult, setCompareResult] = useState<JudgmentCompareResult | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Citation Verification State
  const [citationInput, setCitationInput] = useState("(2001) 4 SCC 321");
  const [citationResult, setCitationResult] = useState<CitationVerifyResult | null>(null);
  const [loadingCitation, setLoadingCitation] = useState(false);

  // Temporal Law State
  const [statuteId, setStatuteId] = useState("ACT_TPA_1882");
  const [targetDate, setTargetDate] = useState("2000-04-15");
  const [temporalResult, setTemporalResult] = useState<TemporalLawResult | null>(null);
  const [loadingTemporal, setLoadingTemporal] = useState(false);

  // Load initial search on mount
  useEffect(() => {
    handleSearch();
  }, []);

  async function handleSearch() {
    setLoadingSearch(true);
    try {
      const results = await v4Api.searchJudgments(searchQuery, courtFilter || undefined);
      setSearchResults(results || []);
      if (results && results.length > 0 && !selectedJudgment) {
        handleSelectJudgment(results[0]);
      }
    } catch (err) {
      console.error("Failed to search judgments", err);
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleSelectJudgment(judgment: JudgmentItem) {
    setSelectedJudgment(judgment);
    setLoadingSummary(true);
    try {
      const sum = await v4Api.getJudgmentSummary(judgment.id);
      setSummary(sum);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    } finally {
      setLoadingSummary(false);
    }
  }

  async function handleCompare() {
    if (!compareIdA || !compareIdB) {
      if (searchResults.length >= 2) {
        setCompareIdA(searchResults[0].id);
        setCompareIdB(searchResults[1].id);
      } else {
        return;
      }
    }
    setLoadingCompare(true);
    try {
      const res = await v4Api.compareJudgments(
        compareIdA || (searchResults[0]?.id ?? ""),
        compareIdB || (searchResults[1]?.id ?? ""),
        compareIssue
      );
      setCompareResult(res);
    } catch (err) {
      console.error("Failed to compare precedents", err);
    } finally {
      setLoadingCompare(false);
    }
  }

  async function handleVerifyCitation() {
    if (!citationInput.trim()) return;
    setLoadingCitation(true);
    try {
      const res = await v4Api.verifyCitation(citationInput);
      setCitationResult(res);
    } catch (err) {
      console.error("Failed to verify citation", err);
    } finally {
      setLoadingCitation(false);
    }
  }

  async function handleResolveTemporal() {
    setLoadingTemporal(true);
    try {
      const res = await v4Api.resolveTemporalLaw(statuteId, targetDate, "106");
      setTemporalResult(res);
    } catch (err) {
      console.error("Failed to resolve temporal law", err);
    } finally {
      setLoadingTemporal(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      {/* Header */}
      <section className="bg-[#1A2B49] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E6DFD5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6C687]/20 text-[#E6C687] border border-[#E6C687]/40 uppercase tracking-wider">
                  V4 Legal Intelligence
                </span>
                <span className="text-xs text-[#C5BCAD]">Precedent Research & Citation Engine</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                Case-Law Intelligence & Precedents
              </h1>
              <p className="mt-2 text-sm text-[#E2DACB] max-w-2xl">
                Explore authoritative Indian judicial precedents, 10-point structured ratios,
                temporal law evolution, and verified legal citations without hallucinations.
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 border border-white/15">
              <div className="w-10 h-10 rounded-lg bg-[#E6C687]/20 flex items-center justify-center text-[#E6C687]">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#C5BCAD]">Verification Level</p>
                <p className="text-sm font-bold text-white">Supreme Court & HCs</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 border-b border-white/15 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                activeTab === "search"
                  ? "bg-[#FAF7F2] text-[#1A2B49] border-t-2 border-t-[#C29B38]"
                  : "text-[#E2DACB] hover:text-white hover:bg-white/5"
              }`}
            >
              <Search className="w-4 h-4" />
              Precedents & 10-Point Summarizer
            </button>
            <button
              onClick={() => {
                setActiveTab("compare");
                if (!compareResult && searchResults.length >= 2) {
                  handleCompare();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                activeTab === "compare"
                  ? "bg-[#FAF7F2] text-[#1A2B49] border-t-2 border-t-[#C29B38]"
                  : "text-[#E2DACB] hover:text-white hover:bg-white/5"
              }`}
            >
              <GitCompare className="w-4 h-4" />
              Precedent Comparator
            </button>
            <button
              onClick={() => setActiveTab("citation")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                activeTab === "citation"
                  ? "bg-[#FAF7F2] text-[#1A2B49] border-t-2 border-t-[#C29B38]"
                  : "text-[#E2DACB] hover:text-white hover:bg-white/5"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Citation Verifier
            </button>
            <button
              onClick={() => {
                setActiveTab("temporal");
                if (!temporalResult) handleResolveTemporal();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                activeTab === "temporal"
                  ? "bg-[#FAF7F2] text-[#1A2B49] border-t-2 border-t-[#C29B38]"
                  : "text-[#E2DACB] hover:text-white hover:bg-white/5"
              }`}
            >
              <History className="w-4 h-4" />
              Temporal Law Evolution
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: PRECEDENTS & 10-POINT SUMMARY */}
        {activeTab === "search" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Search Column (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-[#E6DFD5] shadow-xs">
                <h3 className="font-serif font-bold text-[#1A2B49] text-base mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#8C6D23]" />
                  Search Decisions
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#706E6B] mb-1">Keywords or Legal Issue</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g. deposit, cheque bounce, section 138"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#706E6B] mb-1">Court Jurisdiction</label>
                    <select
                      value={courtFilter}
                      onChange={(e) => setCourtFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                    >
                      <option value="">All Courts (Supreme Court & High Courts)</option>
                      <option value="Supreme Court of India">Supreme Court of India</option>
                      <option value="High Court of Delhi">High Court of Delhi</option>
                      <option value="High Court of Bombay">High Court of Bombay</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSearch}
                    disabled={loadingSearch}
                    className="w-full py-2.5 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loadingSearch ? "Searching Records..." : "Search Precedents"}
                  </button>
                </div>
              </div>

              {/* Search Results List */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-[#706E6B] uppercase tracking-wider px-1">
                  Verified Decisions ({searchResults.length})
                </p>

                {searchResults.map((j) => {
                  const isSelected = selectedJudgment?.id === j.id;
                  return (
                    <div
                      key={j.id}
                      onClick={() => handleSelectJudgment(j)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#C29B38] shadow-sm ring-1 ring-[#C29B38]"
                          : "bg-white/80 hover:bg-white border-[#E6DFD5] hover:border-[#C5BCAD]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif font-bold text-[#1A2B49] text-sm leading-tight">
                          {j.case_name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E6C687]/30 text-[#8C6D23] shrink-0">
                          {j.neutral_citation}
                        </span>
                      </div>
                      <p className="text-xs text-[#706E6B] mt-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#8C7A63]" />
                        {j.court_name} • {j.decision_date}
                      </p>
                      <p className="text-xs text-[#55524E] mt-2 line-clamp-2 leading-relaxed">
                        {j.headnote || j.outcome}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 10-Point Structured Summary Column (8 cols) */}
            <div className="lg:col-span-8">
              {loadingSummary ? (
                <div className="bg-white rounded-2xl p-12 border border-[#E6DFD5] text-center">
                  <div className="w-10 h-10 border-3 border-[#1A2B49] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-serif font-bold text-[#1A2B49] text-base">Extracting 10-Point Judicial Summary...</p>
                  <p className="text-xs text-[#706E6B] mt-1">Grounding questions of law, arguments, ratio decidendi and operative outcome</p>
                </div>
              ) : summary && selectedJudgment ? (
                <div className="bg-white rounded-2xl border border-[#E6DFD5] shadow-xs overflow-hidden">
                  {/* Case Banner */}
                  <div className="bg-[#FAF7F2] p-6 border-b border-[#E6DFD5]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-[#8C6D23] uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#8C6D23]" />
                          10-Point Authoritative Summary
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-[#1A2B49] mt-1">
                          {selectedJudgment.case_name}
                        </h2>
                        <p className="text-xs text-[#706E6B] mt-1 flex items-center gap-2">
                          <span>{selectedJudgment.neutral_citation}</span>
                          <span>•</span>
                          <span>{selectedJudgment.court_name}</span>
                          <span>•</span>
                          <span>{selectedJudgment.bench}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {selectedJudgment.outcome || "Relief Granted"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 10 Sections */}
                  <div className="p-6 space-y-6">
                    {/* 1. Overview */}
                    <div>
                      <h4 className="text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#1A2B49] text-white flex items-center justify-center text-[10px]">1</span>
                        Case Overview
                      </h4>
                      <p className="text-xs text-[#2A2826] leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DD]">
                        {summary.case_overview}
                      </p>
                    </div>

                    {/* 2. Factual Matrix */}
                    <div>
                      <h4 className="text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#1A2B49] text-white flex items-center justify-center text-[10px]">2</span>
                        Factual Matrix
                      </h4>
                      <p className="text-xs text-[#2A2826] leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DD]">
                        {summary.factual_matrix}
                      </p>
                    </div>

                    {/* 3. Questions of Law */}
                    <div>
                      <h4 className="text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#1A2B49] text-white flex items-center justify-center text-[10px]">3</span>
                        Questions of Law Framed
                      </h4>
                      <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DD]">
                        {summary.questions_of_law.map((q, idx) => (
                          <p key={idx} className="text-xs text-[#2A2826] flex items-start gap-2">
                            <span className="text-[#8C6D23] font-bold font-mono">Q{idx + 1}.</span>
                            <span>{q}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* 4 & 5. Arguments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                        <h4 className="text-xs font-bold text-[#8C6D23] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#8C6D23] text-white flex items-center justify-center text-[10px]">4</span>
                          Appellant Arguments
                        </h4>
                        <p className="text-xs text-[#3D3A37] leading-relaxed">{summary.appellant_arguments}</p>
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <h4 className="text-xs font-bold text-[#1A2B49] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#1A2B49] text-white flex items-center justify-center text-[10px]">5</span>
                          Respondent Arguments
                        </h4>
                        <p className="text-xs text-[#3D3A37] leading-relaxed">{summary.respondent_arguments}</p>
                      </div>
                    </div>

                    {/* 6. Ratio Decidendi */}
                    <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                      <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">6</span>
                        Ratio Decidendi (Binding Legal Rule)
                      </h4>
                      <p className="text-xs font-medium text-emerald-950 leading-relaxed font-serif text-sm">
                        "{summary.ratio_decidendi}"
                      </p>
                    </div>

                    {/* 7. Precedents Applied */}
                    <div>
                      <h4 className="text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#1A2B49] text-white flex items-center justify-center text-[10px]">7</span>
                        Precedents Applied & Distinguished
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {summary.precedents_applied.map((p, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg border border-[#E6DFD5] bg-[#FAF7F2] flex items-center justify-between text-xs">
                            <span className="font-serif font-semibold text-[#1A2B49] truncate">{p.precedent}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              p.relationship === "Followed" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                            }`}>
                              {p.relationship}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 8, 9, 10. Operative, Principles & Limitations */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-3.5 rounded-xl border border-[#E6DFD5] bg-[#FAF7F2]">
                        <h4 className="text-[11px] font-bold text-[#706E6B] uppercase tracking-wider mb-1">
                          8. Operative Decision
                        </h4>
                        <p className="text-xs text-[#2A2826]">{summary.operative_decision}</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[#E6DFD5] bg-[#FAF7F2]">
                        <h4 className="text-[11px] font-bold text-[#706E6B] uppercase tracking-wider mb-1">
                          9. Core Principles
                        </h4>
                        <p className="text-xs text-[#2A2826]">{summary.legal_principles?.join(", ") || "Strict burden of proof, non-arbitrariness"}</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[#E6DFD5] bg-[#FAF7F2]">
                        <h4 className="text-[11px] font-bold text-[#706E6B] uppercase tracking-wider mb-1">
                          10. Exceptions / Scope
                        </h4>
                        <p className="text-xs text-[#2A2826]">{summary.limitations || "Subject to specific contract stipulations not offending Section 23 ICA"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* TAB 2: PRECEDENT COMPARATOR */}
        {activeTab === "compare" && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6DFD5] shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD5] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A2B49]">Side-by-Side Precedent Comparator</h3>
                <p className="text-xs text-[#706E6B] mt-0.5">
                  Analyze two contrasting judicial authorities on a specific statutory or procedural issue.
                </p>
              </div>

              <button
                onClick={handleCompare}
                disabled={loadingCompare}
                className="px-4 py-2 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] transition-colors flex items-center gap-2 cursor-pointer"
              >
                {loadingCompare ? "Analyzing Precedents..." : "Compare Authorities"}
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#706E6B] mb-1">Precedent Authority A</label>
                <select
                  value={compareIdA}
                  onChange={(e) => setCompareIdA(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2]"
                >
                  {searchResults.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.case_name} ({j.neutral_citation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#706E6B] mb-1">Precedent Authority B</label>
                <select
                  value={compareIdB}
                  onChange={(e) => setCompareIdB(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2]"
                >
                  {searchResults.slice().reverse().map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.case_name} ({j.neutral_citation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#706E6B] mb-1">Issue Under Analysis</label>
                <input
                  type="text"
                  value={compareIssue}
                  onChange={(e) => setCompareIssue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2]"
                />
              </div>
            </div>

            {/* Comparison Display */}
            {compareResult && (
              <div className="space-y-6 pt-4">
                {/* Controlling Authority Box */}
                <div className="bg-[#1A2B49] text-white p-5 rounded-xl border border-[#E6DFD5]">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E6C687]/30 text-[#E6C687] uppercase tracking-wider">
                    Controlling Precedent Rule
                  </span>
                  <h4 className="font-serif text-base font-bold text-white mt-1.5">
                    {compareResult.controlling_authority_note}
                  </h4>
                  <p className="text-xs text-[#E2DACB] mt-1">
                    {compareResult.jurisdictional_distinction}
                  </p>
                </div>

                {/* Side-by-Side Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Case A */}
                  <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E6DFD5] space-y-3">
                    <span className="text-xs font-bold text-[#8C6D23] uppercase tracking-wider">Authority A</span>
                    <h4 className="font-serif text-lg font-bold text-[#1A2B49]">
                      {compareResult.judgment_a.name}
                    </h4>
                    <p className="text-xs text-[#706E6B]">{compareResult.judgment_a.citation}</p>
                    <div className="p-3 bg-white rounded-lg border border-[#EFE8DD] text-xs text-[#2A2826]">
                      <span className="font-bold text-[#1A2B49] block mb-1">Core Legal Holding:</span>
                      {compareResult.judgment_a.ratio}
                    </div>
                  </div>

                  {/* Case B */}
                  <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E6DFD5] space-y-3">
                    <span className="text-xs font-bold text-[#8C6D23] uppercase tracking-wider">Authority B</span>
                    <h4 className="font-serif text-lg font-bold text-[#1A2B49]">
                      {compareResult.judgment_b.name}
                    </h4>
                    <p className="text-xs text-[#706E6B]">{compareResult.judgment_b.citation}</p>
                    <div className="p-3 bg-white rounded-lg border border-[#EFE8DD] text-xs text-[#2A2826]">
                      <span className="font-bold text-[#1A2B49] block mb-1">Core Legal Holding:</span>
                      {compareResult.judgment_b.ratio}
                    </div>
                  </div>
                </div>

                {/* Divergence & Similarities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Harmonious Principles
                    </h5>
                    <ul className="space-y-1.5 text-xs text-emerald-950">
                      {compareResult.core_similarities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                    <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      Points of Distinction & Divergence
                    </h5>
                    <ul className="space-y-1.5 text-xs text-amber-950">
                      {compareResult.divergence_in_reasoning.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CITATION VERIFIER */}
        {activeTab === "citation" && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6DFD5] shadow-xs space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-[#E6DFD5] pb-4">
              <span className="text-xs font-bold text-[#8C6D23] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#8C6D23]" />
                Zero Hallucination Shield
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1A2B49]">Independent Citation Verifier</h3>
              <p className="text-xs text-[#706E6B] mt-0.5">
                Verify statutory provisions and judicial citations against authoritative Indian law catalogs before citing in pleadings.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-[#706E6B]">
                Enter Legal Citation (SCC, AIR, Section & Act)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={citationInput}
                  onChange={(e) => setCitationInput(e.target.value)}
                  placeholder="e.g. (2001) 4 SCC 321 or Section 108 Transfer of Property Act"
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                />
                <button
                  onClick={handleVerifyCitation}
                  disabled={loadingCitation}
                  className="px-5 py-2.5 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] transition-colors cursor-pointer shrink-0"
                >
                  {loadingCitation ? "Verifying..." : "Verify Citation"}
                </button>
              </div>

              {/* Sample citations chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-[#706E6B]">Try samples:</span>
                {[
                  "(2001) 4 SCC 321",
                  "Section 138 Negotiable Instruments Act, 1881",
                  "(2010) 5 SCC 663",
                  "(2099) 999 SCC 99999",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCitationInput(c);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md border border-[#E6DFD5] bg-[#FAF7F2] hover:bg-[#EFE8DD] text-[#55524E] cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Citation Result Display */}
            {citationResult && (
              <div className={`p-5 rounded-xl border ${
                citationResult.is_verified ? "bg-emerald-50/70 border-emerald-200" : "bg-red-50/70 border-red-200"
              }`}>
                <div className="flex items-start gap-3">
                  {citationResult.is_verified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm text-[#1A2B49]">
                        {citationResult.citation_text}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        citationResult.is_verified ? "bg-emerald-200/60 text-emerald-800" : "bg-red-200/60 text-red-800"
                      }`}>
                        {citationResult.verification_status}
                      </span>
                    </div>

                    {citationResult.source_title && (
                      <p className="text-xs font-semibold text-[#1A2B49]">
                        Source: {citationResult.source_title}
                      </p>
                    )}

                    <p className="text-xs text-[#55524E] leading-relaxed">
                      {citationResult.verification_details}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TEMPORAL LAW EVOLUTION */}
        {activeTab === "temporal" && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6DFD5] shadow-xs space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-[#E6DFD5] pb-4">
              <span className="text-xs font-bold text-[#8C6D23] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <History className="w-4 h-4 text-[#8C6D23]" />
                Article 20(1) Constitutional Protection Engine
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1A2B49]">Temporal Law Reasoning (T_event vs T_now)</h3>
              <p className="text-xs text-[#706E6B] mt-0.5">
                Indian jurisprudence strictly enforces non-retroactivity for substantive and penal liabilities.
                Resolve the exact statutory regime in effect on the date of your incident.
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#706E6B] mb-1">Statute</label>
                <select
                  value={statuteId}
                  onChange={(e) => setStatuteId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2]"
                >
                  <option value="ACT_TPA_1882">Transfer of Property Act, 1882 (§ 106)</option>
                  <option value="ACT_NI_1881">Negotiable Instruments Act, 1881 (§ 138/142)</option>
                  <option value="ACT_CPA_2019">Consumer Protection Act, 2019</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#706E6B] mb-1">Date of Incident / Cause of Action</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-[#FAF7F2]"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleResolveTemporal}
                  disabled={loadingTemporal}
                  className="w-full py-2.5 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30] transition-colors cursor-pointer"
                >
                  {loadingTemporal ? "Resolving Timeline..." : "Check Governing Law"}
                </button>
              </div>
            </div>

            {/* Temporal Result Display */}
            {temporalResult && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl border border-[#E6DFD5] bg-[#FAF7F2]">
                  <p className="text-xs text-[#706E6B] leading-relaxed">
                    <span className="font-bold text-[#1A2B49]">Constitutional Safeguard: </span>
                    {temporalResult.substantive_vs_procedural_note}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Law in force at event */}
                  <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 uppercase tracking-wider">
                      Law at Date of Incident ({temporalResult.target_date})
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#1A2B49]">
                      {temporalResult.applicable_version.version_label}
                    </h4>
                    <p className="text-xs text-[#55524E]">
                      Enacted: {temporalResult.applicable_version.amendment_act || "Principal Act"}
                    </p>
                    <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs text-[#2A2826] leading-relaxed">
                      {temporalResult.applicable_version.full_text}
                    </div>
                  </div>

                  {/* Current Law */}
                  <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200/60 text-blue-900 uppercase tracking-wider">
                      Current Law Today (In Force)
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#1A2B49]">
                      {temporalResult.current_version.version_label}
                    </h4>
                    <p className="text-xs text-[#55524E]">
                      Amendment: {temporalResult.current_version.amendment_act || "Current Regime"}
                    </p>
                    <div className="p-3 bg-white rounded-lg border border-blue-200 text-xs text-[#2A2826] leading-relaxed">
                      {temporalResult.current_version.full_text}
                    </div>
                  </div>
                </div>

                {temporalResult.differences_summary && (
                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
                    <span className="text-xs font-bold text-purple-900 block mb-1">
                      Material Historical Divergence:
                    </span>
                    <p className="text-xs text-purple-950 leading-relaxed">
                      {temporalResult.differences_summary}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
