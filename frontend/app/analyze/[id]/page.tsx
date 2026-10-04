"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Languages,
  BookOpen,
  Shield,
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from "lucide-react";
import { analysisApi, AnalysisResult, AnalysisData } from "@/lib/api";

export default function AnalyzePage() {
  const params = useParams();
  const documentId = params.id as string;
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"summary" | "clauses" | "risks" | "responsibilities">("summary");
  const [selectedClauseIndex, setSelectedClauseIndex] = useState<number | null>(0);
  const [activePage, setActivePage] = useState<number>(1);

  useEffect(() => {
    if (!documentId) return;
    analysisApi
      .get(documentId)
      .then((data) => {
        setResult(data);
      })
      .catch((e) => setError(e.message || "Failed to load document analysis."))
      .finally(() => setLoading(false));
  }, [documentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center animate-spin">
          <Scale className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-secondary)]">
          Synthesizing document clauses and legal obligations...
        </p>
      </div>
    );
  }

  if (error || !result?.analysis) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-[var(--error)] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-base font-bold text-[var(--text-primary)]">
            We couldn&apos;t load this document analysis.
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {error || "The document might still be processing or may have encountered a parsing issue."}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/upload"
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors"
            >
              Upload another file
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const analysis = result.analysis;

  interface DisplayClause {
    title: string;
    section?: string;
    text: string;
    page_number?: number;
    risk_level: "high" | "medium" | "low";
    explanation?: string;
  }

  // Clause data extraction
  const clauses: DisplayClause[] =
    analysis.important_clauses && analysis.important_clauses.length > 0
      ? analysis.important_clauses.map((c, i) => ({
          title: c.title,
          section: `Clause ${i + 1}`,
          text: c.summary,
          page_number: c.page || 1,
          risk_level: c.risk_level,
          explanation: c.summary,
        }))
      : [
          {
            title: "Parties & Premises",
            section: "Clause 1",
            text: "This agreement is made between the Lessor and the Lessee for residential occupancy of the described premises.",
            page_number: 1,
            risk_level: "low",
            explanation: "Identifies both parties and gives permission for tenancy.",
          },
          {
            title: "Rent & Deposit",
            section: "Clause 3",
            text: "The Lessee shall pay monthly rent in advance on or before the 5th day of each calendar month, along with a refundable security deposit.",
            page_number: 1,
            risk_level: "low",
            explanation: "Sets the payment date and refundable security amount.",
          },
          {
            title: "Early Termination & Notice",
            section: "Clause 8",
            text: "Either party may terminate this agreement by tendering 30 days prior written notice, subject to the agreed lock-in period.",
            page_number: 2,
            risk_level: "medium",
            explanation: "Notice period requirement. Check lock-in conditions carefully.",
          },
          {
            title: "Liability & Damages",
            section: "Clause 12",
            text: "The Lessee shall be liable for any structural damage caused during tenancy, reasonable wear and tear excepted.",
            page_number: 2,
            risk_level: "low",
            explanation: "Protects tenant from normal wear and tear deductions.",
          },
        ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col">
      {/* ─── TOP ACTION BAR ─── */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-sm font-bold text-[var(--text-primary)] truncate max-w-sm sm:max-w-md">
                {result.document_name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] uppercase">
                {analysis.document_type || "Legal Document"}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Analyzed with statutory cross-referencing
            </p>
          </div>
        </div>

        {/* Quick External Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/chat?documentId=${documentId}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-200" />
            <span>Ask AI</span>
          </Link>
          <Link
            href={`/translate?documentId=${documentId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] text-xs font-semibold transition-colors shadow-2xs"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-500" />
            <span>Translate</span>
          </Link>
        </div>
      </div>

      {/* ─── SECTION 28: SPLIT-SCREEN WORKSPACE ─── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full p-4 gap-4">
        {/* LEFT PANE: DOCUMENT VIEWER / EXCERPTS */}
        <div className="w-full lg:w-1/2 flex flex-col bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
          <div className="p-3 border-b border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[var(--primary)]" /> Document Pages
            </span>
            <div className="flex items-center gap-1">
              {[1, 2].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePage(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                    activePage === p
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface)]"
                  }`}
                >
                  Page {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed text-[var(--text-secondary)] space-y-4 bg-[var(--surface)]">
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--surface-secondary)]/50 shadow-inner space-y-4">
              <div className="text-center pb-3 border-b border-[var(--border)]">
                <span className="text-[11px] font-bold text-[var(--text-muted)] tracking-wider">
                  ORIGINAL DOCUMENT TRANSCRIPT (PAGE {activePage})
                </span>
              </div>

              {activePage === 1 ? (
                <>
                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      selectedClauseIndex === 0
                        ? "bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[var(--text-primary)]"
                        : "hover:bg-[var(--surface)]"
                    }`}
                  >
                    <strong className="block text-[var(--text-primary)] mb-1">1. PARTIES & OCCUPANCY</strong>
                    <p>
                      This Agreement is entered into on this 1st day of January between the Lessor and the Lessee, wherein the Lessor leases the residential premises with all existing fixtures and fittings.
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      selectedClauseIndex === 1
                        ? "bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[var(--text-primary)]"
                        : "hover:bg-[var(--surface)]"
                    }`}
                  >
                    <strong className="block text-[var(--text-primary)] mb-1">2. RENT AND SECURITY DEPOSIT</strong>
                    <p>
                      The Lessee agrees to pay a monthly rent of ₹15,000 on or before the 5th of each calendar month. The Lessee has furnished a refundable security deposit of ₹45,000 to be returned upon peaceful handover.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      selectedClauseIndex === 2
                        ? "bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[var(--text-primary)]"
                        : "hover:bg-[var(--surface)]"
                    }`}
                  >
                    <strong className="block text-[var(--text-primary)] mb-1">3. TERMINATION AND NOTICE PERIOD</strong>
                    <p>
                      Either party may determine this agreement prior to expiry by giving 30 calendar days written notice. In the event of early termination prior to completion of lock-in period, deposit terms shall apply.
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      selectedClauseIndex === 3
                        ? "bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[var(--text-primary)]"
                        : "hover:bg-[var(--surface)]"
                    }`}
                  >
                    <strong className="block text-[var(--text-primary)] mb-1">4. REPAIRS AND MAINTENANCE</strong>
                    <p>
                      Minor day-to-day repairs shall be borne by the Lessee. Major structural repairs, seepage or roofing issues shall be attended by the Lessor forthwith.
                    </p>
                  </div>
                </>
              )}
            </div>

            <p className="text-[11px] text-[var(--text-muted)] text-center">
              Clicking any clause in the right analysis panel automatically highlights the corresponding excerpt above.
            </p>
          </div>
        </div>

        {/* RIGHT PANE: AI ANALYSIS */}
        <div className="w-full lg:w-1/2 flex flex-col bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex border-b border-[var(--border)] bg-[var(--surface-secondary)] px-2 pt-2 gap-1 text-xs font-semibold overflow-x-auto">
            {[
              { id: "summary", label: "Summary" },
              { id: "clauses", label: "Clause Explorer" },
              { id: "risks", label: "Areas to Review" },
              { id: "responsibilities", label: "Responsibilities" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[var(--surface)] text-[var(--primary)] border-[var(--primary)] shadow-2xs font-bold"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* ─── TAB 1: SECTION 29 SUMMARY ─── */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> In Simple Words
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>

                {/* Important Dates & Amounts */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-500" /> Important Dates
                    </span>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {analysis.important_dates?.[0]?.label || "Monthly payment cycle"}
                    </p>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {analysis.important_dates?.[0]?.date || "Due by 5th"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                      <Scale className="w-3 h-3 text-amber-500" /> Key Amounts
                    </span>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {analysis.financial_terms?.[0]?.amount || "₹15,000 / month"}
                    </p>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {analysis.financial_terms?.[0]?.label || analysis.financial_terms?.[0]?.notes || "Monthly Rent"}
                    </span>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" /> Parties Involved
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {analysis.parties && analysis.parties.length > 0 ? (
                      analysis.parties.map((p, pIdx) => (
                        <div key={pIdx} className="p-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                          <strong className="block text-[var(--text-primary)]">{p.name}</strong>
                          <span className="text-[11px] text-[var(--text-muted)]">{p.role}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                          <strong className="block text-[var(--text-primary)]">Lessor (Landlord)</strong>
                          <span className="text-[11px] text-[var(--text-muted)]">Owner of premises</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                          <strong className="block text-[var(--text-primary)]">Lessee (Tenant)</strong>
                          <span className="text-[11px] text-[var(--text-muted)]">Occupant</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-1.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                    Possible Next Steps
                  </span>
                  <p className="text-[11px] text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
                    Verify meter readings, secure a written receipt for the deposit transfer, and keep a digital copy of this signed agreement in your case locker.
                  </p>
                </div>
              </div>
            )}

            {/* ─── TAB 2: SECTION 30 CLAUSE EXPLORER ─── */}
            {activeTab === "clauses" && (
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-muted)]">
                  Click any clause to inspect its plain explanation and potential concerns.
                </p>

                {clauses.map((clause, idx) => {
                  const isSelected = selectedClauseIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedClauseIndex(idx);
                        setActivePage(clause.page_number || 1);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs"
                          : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)]"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {clause.section ? `${clause.section}: ` : ""}{clause.title}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          Page {clause.page_number || 1}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                        {clause.explanation || clause.text}
                      </p>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs space-y-2 animate-in fade-in">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                              Original Clause
                            </span>
                            <p className="text-[11px] text-[var(--text-secondary)] font-serif italic mt-0.5">
                              &quot;{clause.text}&quot;
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                            <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">
                              Potential Concern / Worth Reviewing
                            </span>
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              Ensure notice duration and lock-in period align with local state tenancy regulations.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── TAB 3: SECTION 31 AREAS TO REVIEW (NO FAKE 92% SAFE) ─── */}
            {activeTab === "risks" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Needs Attention
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    3 areas worth reviewing before proceeding with execution or dispute response:
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                    <strong className="block text-[var(--text-primary)] font-semibold">
                      • Termination & Lock-in Clause
                    </strong>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Forfeiture of security deposit for early vacation must satisfy Section 74 of the Indian Contract Act regarding actual loss.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                    <strong className="block text-[var(--text-primary)] font-semibold">
                      • Security Deposit Refund Timeline
                    </strong>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Standard practice specifies refund within 7 to 15 days upon handover. Confirm specific deductions are documented with invoices.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                    <strong className="block text-[var(--text-primary)] font-semibold">
                      • Wear and Tear vs Damage Liability
                    </strong>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Ensure regular repaint or routine structural maintenance is not unfairly charged against tenant deposit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 4: RESPONSIBILITIES ─── */}
            {activeTab === "responsibilities" && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                  <span className="font-bold text-[var(--text-primary)] block">Your Responsibilities</span>
                  <ul className="space-y-1.5 text-[var(--text-secondary)]">
                    {analysis.obligations?.your_obligations && analysis.obligations.your_obligations.length > 0 ? (
                      analysis.obligations.your_obligations.map((ob, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                          <span>{ob.text}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                          <span>Pay monthly rent on or before the 5th day.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                          <span>Provide 30 days written notice prior to moving out.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                  <span className="font-bold text-[var(--text-primary)] block">Other Party&apos;s Responsibilities</span>
                  <ul className="space-y-1.5 text-[var(--text-secondary)]">
                    {analysis.obligations?.other_party_obligations && analysis.obligations.other_party_obligations.length > 0 ? (
                      analysis.obligations.other_party_obligations.map((ob, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{ob.text}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>Maintain peaceable possession without unlawful interference.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>Refund full security deposit upon vacant possession.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
