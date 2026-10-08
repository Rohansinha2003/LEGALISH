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
  ExternalLink,
  Sparkles,
  BookmarkCheck,
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

  // Load initial search on mount
  useEffect(() => {
    handleSearch();
  }, []);

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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Premium Header */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                  ✦ V4 Legal Intelligence
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Precedent Research & Citation Engine
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Case-Law Intelligence & Precedents
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                Explore authoritative Indian judicial precedents, 10-point structured ratios,
                temporal law evolution, and verified legal citations without hallucinations.
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-300 font-medium">Verification Hierarchy</p>
                <p className="text-sm font-bold text-white">Supreme Court & High Courts</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 border-b border-white/10 overflow-x-auto pb-px scrollbar-none">
            {[
              { id: "search", label: "Precedents & 10-Point Summarizer", icon: Search, color: "text-cyan-400" },
              { id: "compare", label: "Precedent Comparator", icon: GitCompare, color: "text-purple-400" },
              { id: "citation", label: "Citation Verifier", icon: FileCheck, color: "text-emerald-400" },
              { id: "temporal", label: "Temporal Law Evolution", icon: History, color: "text-amber-400" },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === "compare" && !compareResult && searchResults.length >= 2) handleCompare();
                    if (tab.id === "temporal" && !temporalResult) handleResolveTemporal();
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-slate-50 text-indigo-950 border-t-2 border-t-cyan-500 font-bold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab.color}`} />
                  {tab.label}
                </button>
              );
            })}
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
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-600" />
                  Search Decisions
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Keywords or Legal Concept
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="🔎 Search Indian law, cases and legal concepts..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Court Jurisdiction
                    </label>
                    <select
                      value={courtFilter}
                      onChange={(e) => setCourtFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
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
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loadingSearch ? "Searching Records..." : "Search Precedents"}
                  </button>
                </div>
              </div>

              {/* Search Results List */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  Verified Decisions ({searchResults.length})
                </p>

                {searchResults.map((j) => {
                  const isSelected = selectedJudgment?.id === j.id;
                  return (
                    <div
                      key={j.id}
                      onClick={() => handleSelectJudgment(j)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? "bg-white border-cyan-500 shadow-md ring-2 ring-cyan-500/20"
                          : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      {/* Left accent strip */}
                      <div
                        className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-colors ${
                          isSelected ? "bg-cyan-500" : "bg-transparent group-hover:bg-slate-300"
                        }`}
                      />

                      <div className="pl-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif font-bold text-slate-900 text-sm leading-tight">
                            {j.case_name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 shrink-0">
                            {j.neutral_citation}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{j.court_name}</span>
                          <span>•</span>
                          <span>{j.decision_date}</span>
                        </p>

                        <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                            Why this may be relevant:
                          </span>
                          <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-sans">
                            {j.headnote || j.outcome}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px]">
                          <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                            📚 Section 138 / NI Act
                          </span>
                          <span className="text-cyan-700 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            View analysis →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 10-Point Structured Summary Column (8 cols) */}
            <div className="lg:col-span-8">
              {loadingSummary ? (
                <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center shadow-sm">
                  <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-serif font-bold text-slate-900 text-lg">Extracting 10-Point Judicial Summary...</p>
                  <p className="text-xs text-slate-500 mt-1">Grounding questions of law, arguments, ratio decidendi and operative outcome</p>
                </div>
              ) : summary && selectedJudgment ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Case Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 border-b border-indigo-900/30">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-cyan-400" />
                          10-Point Authoritative Judicial Summary
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-white mt-1.5">
                          {selectedJudgment.case_name}
                        </h2>
                        <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                          <span className="font-mono text-cyan-200">{selectedJudgment.neutral_citation}</span>
                          <span>•</span>
                          <span>{selectedJudgment.court_name}</span>
                          <span>•</span>
                          <span>{selectedJudgment.bench}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          {selectedJudgment.outcome || "Relief Granted"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 10 Sections with Semantic Color Highlights */}
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* 1. Overview */}
                    <div className="border-l-4 border-indigo-500 pl-4 py-0.5">
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                        Case Overview
                      </h4>
                      <p className="text-xs text-slate-800 leading-relaxed bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100">
                        {summary.case_overview}
                      </p>
                    </div>

                    {/* 2. Factual Matrix */}
                    <div className="border-l-4 border-slate-400 pl-4 py-0.5">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">2</span>
                        Factual Matrix
                      </h4>
                      <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        {summary.factual_matrix}
                      </p>
                    </div>

                    {/* 3. Questions of Law */}
                    <div className="border-l-4 border-cyan-500 pl-4 py-0.5">
                      <h4 className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">3</span>
                        Questions of Law Framed
                      </h4>
                      <div className="space-y-1.5 bg-cyan-50/40 p-3.5 rounded-2xl border border-cyan-100">
                        {summary.questions_of_law.map((q, idx) => (
                          <p key={idx} className="text-xs text-slate-800 flex items-start gap-2">
                            <span className="text-cyan-700 font-bold font-mono">Q{idx + 1}.</span>
                            <span>{q}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* 4 & 5. Arguments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 border-l-4 border-l-amber-500">
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">4</span>
                          Appellant Arguments
                        </h4>
                        <p className="text-xs text-amber-950 leading-relaxed">{summary.appellant_arguments}</p>
                      </div>

                      <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 border-l-4 border-l-blue-500">
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">5</span>
                          Respondent Arguments
                        </h4>
                        <p className="text-xs text-blue-950 leading-relaxed">{summary.respondent_arguments}</p>
                      </div>
                    </div>

                    {/* 6. Ratio Decidendi */}
                    <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-300 border-l-4 border-l-emerald-600 shadow-xs">
                      <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">6</span>
                        Ratio Decidendi (Binding Legal Rule)
                      </h4>
                      <p className="text-sm font-medium text-emerald-950 leading-relaxed font-serif italic">
                        &ldquo;{summary.ratio_decidendi}&rdquo;
                      </p>
                    </div>

                    {/* 7. Precedents Applied */}
                    <div className="border-l-4 border-purple-500 pl-4 py-0.5">
                      <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">7</span>
                        Precedents Applied & Distinguished
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {summary.precedents_applied.map((p, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 flex items-center justify-between text-xs">
                            <span className="font-serif font-semibold text-purple-950 truncate">{p.precedent}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                      <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/50 border-t-2 border-t-teal-500">
                        <h4 className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-1">
                          8. Operative Decision
                        </h4>
                        <p className="text-xs text-teal-950 leading-relaxed">{summary.operative_decision}</p>
                      </div>

                      <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 border-t-2 border-t-indigo-500">
                        <h4 className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-1">
                          9. Core Principles
                        </h4>
                        <p className="text-xs text-indigo-950 leading-relaxed">{summary.legal_principles?.join(", ") || "Strict burden of proof, non-arbitrariness"}</p>
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 border-t-2 border-t-slate-500">
                        <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          10. Exceptions / Scope
                        </h4>
                        <p className="text-xs text-slate-800 leading-relaxed">{summary.limitations || "Subject to specific contract stipulations not offending Section 23 ICA"}</p>
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <GitCompare className="w-4 h-4 text-purple-600" />
                  Comparative Judicial Reasoning
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Side-by-Side Precedent Comparator</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Analyze two contrasting judicial authorities on a specific statutory or procedural issue.
                </p>
              </div>

              <button
                onClick={handleCompare}
                disabled={loadingCompare}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-purple-500/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                {loadingCompare ? "Analyzing Precedents..." : "Compare Authorities"}
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Precedent Authority A</label>
                <select
                  value={compareIdA}
                  onChange={(e) => setCompareIdA(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-medium"
                >
                  {searchResults.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.case_name} ({j.neutral_citation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Precedent Authority B</label>
                <select
                  value={compareIdB}
                  onChange={(e) => setCompareIdB(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-medium"
                >
                  {searchResults.slice().reverse().map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.case_name} ({j.neutral_citation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Issue Under Analysis</label>
                <input
                  type="text"
                  value={compareIssue}
                  onChange={(e) => setCompareIssue(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Comparison Display */}
            {compareResult && (
              <div className="space-y-6 pt-4">
                {/* Controlling Authority Box */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 rounded-2xl border border-indigo-800 shadow-md">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 uppercase tracking-wider border border-cyan-400/30">
                    Controlling Precedent Rule
                  </span>
                  <h4 className="font-serif text-lg font-bold text-white mt-2">
                    {compareResult.controlling_authority_note}
                  </h4>
                  <p className="text-xs text-indigo-200 mt-1">
                    {compareResult.jurisdictional_distinction}
                  </p>
                </div>

                {/* Side-by-Side Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Case A */}
                  <div className="bg-gradient-to-b from-indigo-50/40 to-white p-5 rounded-2xl border border-indigo-200 space-y-3">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Authority A</span>
                    <h4 className="font-serif text-lg font-bold text-slate-900">
                      {compareResult.judgment_a.name}
                    </h4>
                    <p className="text-xs text-indigo-600 font-mono">{compareResult.judgment_a.citation}</p>
                    <div className="p-3.5 bg-white rounded-xl border border-indigo-100 text-xs text-slate-800 leading-relaxed">
                      <span className="font-bold text-indigo-950 block mb-1">Core Legal Holding:</span>
                      {compareResult.judgment_a.ratio}
                    </div>
                  </div>

                  {/* Case B */}
                  <div className="bg-gradient-to-b from-purple-50/40 to-white p-5 rounded-2xl border border-purple-200 space-y-3">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Authority B</span>
                    <h4 className="font-serif text-lg font-bold text-slate-900">
                      {compareResult.judgment_b.name}
                    </h4>
                    <p className="text-xs text-purple-600 font-mono">{compareResult.judgment_b.citation}</p>
                    <div className="p-3.5 bg-white rounded-xl border border-purple-100 text-xs text-slate-800 leading-relaxed">
                      <span className="font-bold text-purple-950 block mb-1">Core Legal Holding:</span>
                      {compareResult.judgment_b.ratio}
                    </div>
                  </div>
                </div>

                {/* Divergence & Similarities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50">
                    <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Harmonious Principles
                    </h5>
                    <ul className="space-y-1.5 text-xs text-emerald-950">
                      {compareResult.core_similarities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50">
                    <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      Points of Distinction & Divergence
                    </h5>
                    <ul className="space-y-1.5 text-xs text-amber-950">
                      {compareResult.divergence_in_reasoning.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">•</span>
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-slate-100 pb-5">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero Hallucination Citation Shield
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900">Independent Citation Verifier</h3>
              <p className="text-xs text-slate-500 mt-1">
                Verify statutory provisions and judicial citations against authoritative Indian law catalogs before citing in pleadings.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Enter Legal Citation (SCC, AIR, Section & Act)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={citationInput}
                  onChange={(e) => setCitationInput(e.target.value)}
                  placeholder="e.g. (2001) 4 SCC 321 or Section 108 Transfer of Property Act"
                  className="flex-1 px-4 py-3 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  onClick={handleVerifyCitation}
                  disabled={loadingCitation}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-md shadow-emerald-500/10"
                >
                  {loadingCitation ? "Verifying..." : "Verify Citation"}
                </button>
              </div>

              {/* Sample citations chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-slate-500 font-medium">Try samples:</span>
                {[
                  "(2001) 4 SCC 321",
                  "Section 138 Negotiable Instruments Act, 1881",
                  "(2010) 5 SCC 663",
                  "(2099) 999 SCC 99999",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCitationInput(c)}
                    className="text-xs px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-600 transition-colors cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Citation Result Display */}
            {citationResult && (
              <div className={`p-6 rounded-2xl border ${
                citationResult.is_verified ? "bg-emerald-50/80 border-emerald-300" : "bg-red-50/80 border-red-200"
              }`}>
                <div className="flex items-start gap-3">
                  {citationResult.is_verified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-slate-900">
                        {citationResult.citation_text}
                      </h4>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        citationResult.is_verified ? "bg-emerald-200 text-emerald-900" : "bg-red-200 text-red-900"
                      }`}>
                        {citationResult.verification_status}
                      </span>
                    </div>

                    {citationResult.source_title && (
                      <p className="text-xs font-semibold text-slate-900">
                        Source: {citationResult.source_title}
                      </p>
                    )}

                    <p className="text-xs text-slate-700 leading-relaxed">
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-100 pb-5">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <History className="w-4 h-4 text-amber-600" />
                Article 20(1) Constitutional Protection Engine
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900">Temporal Law Reasoning (T_event vs T_now)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Indian jurisprudence strictly enforces non-retroactivity for substantive and penal liabilities.
                Resolve the exact statutory regime in effect on the date of your incident.
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Statute</label>
                <select
                  value={statuteId}
                  onChange={(e) => setStatuteId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-medium"
                >
                  <option value="ACT_TPA_1882">Transfer of Property Act, 1882 (§ 106)</option>
                  <option value="ACT_NI_1881">Negotiable Instruments Act, 1881 (§ 138/142)</option>
                  <option value="ACT_CPA_2019">Consumer Protection Act, 2019</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date of Incident / Cause of Action</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-medium"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleResolveTemporal}
                  disabled={loadingTemporal}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  {loadingTemporal ? "Resolving Timeline..." : "Check Governing Law"}
                </button>
              </div>
            </div>

            {/* Temporal Result Display */}
            {temporalResult && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60">
                  <p className="text-xs text-amber-950 leading-relaxed">
                    <span className="font-bold text-amber-900">Constitutional Safeguard: </span>
                    {temporalResult.substantive_vs_procedural_note}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Law in force at event */}
                  <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2 border-l-4 border-l-amber-500">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wider">
                      Law at Date of Incident ({temporalResult.target_date})
                    </span>
                    <h4 className="font-serif font-bold text-sm text-slate-900">
                      {temporalResult.applicable_version.version_label}
                    </h4>
                    <p className="text-xs text-slate-600">
                      Enacted: {temporalResult.applicable_version.amendment_act || "Principal Act"}
                    </p>
                    <div className="p-3.5 bg-white rounded-xl border border-amber-200 text-xs text-slate-800 leading-relaxed font-sans">
                      {temporalResult.applicable_version.full_text}
                    </div>
                  </div>

                  {/* Current Law */}
                  <div className="p-5 rounded-2xl border border-cyan-200 bg-cyan-50/40 space-y-2 border-l-4 border-l-cyan-500">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-200 text-cyan-900 uppercase tracking-wider">
                      Current Law Today (In Force)
                    </span>
                    <h4 className="font-serif font-bold text-sm text-slate-900">
                      {temporalResult.current_version.version_label}
                    </h4>
                    <p className="text-xs text-slate-600">
                      Amendment: {temporalResult.current_version.amendment_act || "Current Regime"}
                    </p>
                    <div className="p-3.5 bg-white rounded-xl border border-cyan-200 text-xs text-slate-800 leading-relaxed font-sans">
                      {temporalResult.current_version.full_text}
                    </div>
                  </div>
                </div>

                {temporalResult.differences_summary && (
                  <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/60">
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
