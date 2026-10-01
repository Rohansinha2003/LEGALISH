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
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  MessageSquare,
  Languages,
  Loader2,
  BookOpen,
  Shield,
  ListChecks,
  ExternalLink,
} from "lucide-react";
import { analysisApi, AnalysisResult, AnalysisData } from "@/lib/api";

function RiskBadge({ level }: { level: "high" | "medium" | "low" }) {
  const styles = {
    high: "badge-error",
    medium: "badge-warning",
    low: "badge-ready",
  };
  return <span className={`badge ${styles[level]}`}>{level}</span>;
}

function Section({
  title,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl border border-white/5">
      <div className="flex items-center gap-3 p-5 border-b border-white/5">
        <div className={`w-8 h-8 rounded-lg glass flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-bold text-white text-base">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function CitationLink({ page, section }: { page?: number; section?: string }) {
  return (
    <span className="citation-link">
      <ExternalLink className="w-3 h-3" />
      {section ? section : `Page ${page}`}
    </span>
  );
}

function HighRiskAlert({ recommendation }: { recommendation: string }) {
  return (
    <div className="high-risk-alert mb-6">
      <Shield className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-rose-300 mb-1">Important Note</p>
        <p className="text-sm leading-relaxed">{recommendation}</p>
      </div>
    </div>
  );
}

function AnalysisView({ analysis, docName, docId }: { analysis: AnalysisData; docName: string; docId: string }) {
  return (
    <div className="space-y-4">
      {/* High risk */}
      {analysis.is_high_risk && analysis.high_risk_recommendation && (
        <HighRiskAlert recommendation={analysis.high_risk_recommendation} />
      )}

      {/* Summary */}
      <div className="glass-strong rounded-xl p-6 border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-purple-700/5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-violet-400" />
          <h2 className="font-bold text-white">Simple Summary</h2>
          <span className="badge badge-ready ml-auto">
            <CheckCircle className="w-3 h-3" />
            {analysis.document_type}
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[15px]">{analysis.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Parties */}
        {analysis.parties?.length > 0 && (
          <Section title="People Involved" icon={Users} iconColor="text-blue-400">
            <div className="space-y-3">
              {analysis.parties.map((party, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white text-sm">{party.name}</p>
                    {party.address && <p className="text-xs text-slate-500">{party.address}</p>}
                  </div>
                  <span className="badge badge-processing flex-shrink-0">{party.role}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Important Dates */}
        {analysis.important_dates?.length > 0 && (
          <Section title="Important Dates" icon={Calendar} iconColor="text-emerald-400">
            <div className="space-y-2">
              {analysis.important_dates.map((date, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{date.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{date.date}</span>
                    {date.page && <CitationLink page={date.page} />}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Money */}
        {analysis.financial_terms?.length > 0 && (
          <Section title="Money Involved" icon={DollarSign} iconColor="text-amber-400">
            <div className="space-y-3">
              {analysis.financial_terms.map((term, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-slate-400">{term.label}</p>
                    {term.due_date && <p className="text-xs text-slate-500">Due: {term.due_date}</p>}
                    {term.notes && <p className="text-xs text-slate-500">{term.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-amber-300">{term.amount}</span>
                    {term.page && <CitationLink page={term.page} />}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Your Obligations */}
        {analysis.obligations?.your_obligations?.length > 0 && (
          <Section title="Your Responsibilities" icon={ListChecks} iconColor="text-violet-400">
            <ul className="space-y-2">
              {analysis.obligations.your_obligations.map((ob, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 flex-1">{ob.text}</span>
                  {ob.page && <CitationLink page={ob.page} />}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Important Clauses */}
      {analysis.important_clauses?.length > 0 && (
        <Section title="Important Clauses" icon={FileText} iconColor="text-slate-400">
          <div className="space-y-3">
            {analysis.important_clauses.map((clause, i) => (
              <div key={i} className="glass rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-white text-sm">{clause.title}</p>
                  <div className="flex items-center gap-2">
                    <RiskBadge level={clause.risk_level} />
                    {clause.page && <CitationLink page={clause.page} />}
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{clause.summary}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Potential Concerns */}
      {analysis.potential_concerns?.length > 0 && (
        <Section title="Clauses to Pay Attention To" icon={AlertTriangle} iconColor="text-amber-400">
          <div className="space-y-3">
            {analysis.potential_concerns.map((concern, i) => (
              <div key={i} className="flex items-start gap-3 p-3 glass rounded-lg border border-amber-500/10">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-300 leading-relaxed">{concern.text}</p>
                </div>
                {concern.page && <CitationLink page={concern.page} />}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Next Steps */}
      {analysis.next_steps?.length > 0 && (
        <Section title="Suggested Next Steps" icon={CheckCircle} iconColor="text-emerald-400">
          <ol className="space-y-2">
            {analysis.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/chat?documentId=${docId}`}
          className="glass card-hover p-5 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-transparent flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-white">Ask a question</p>
            <p className="text-sm text-slate-400">Chat with AI about this document</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 ml-auto transition-colors" />
        </Link>

        <Link
          href={`/translate?documentId=${docId}`}
          className="glass card-hover p-5 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-transparent flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-white">Translate to Hindi</p>
            <p className="text-sm text-slate-400">Get this in हिंदी</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 ml-auto transition-colors" />
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-box">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p>
          This analysis is AI-generated from your uploaded document. It is for informational purposes only and not a substitute for advice from a qualified lawyer. For urgent or high-stakes matters, consult a qualified advocate.
        </p>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const params = useParams();
  const documentId = params.id as string;
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;
    analysisApi
      .get(documentId)
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [documentId]);

  return (
    <div className="page-container min-h-screen">
      <div className="border-b border-white/5">
        <div className="content-container">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">LegalSaathi</span>
            </Link>
            <Link href="/dashboard" className="btn-ghost text-sm">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="content-container py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
            <p className="text-slate-400">Loading analysis...</p>
          </div>
        ) : error ? (
          <div className="high-risk-alert max-w-xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p>{error}</p>
          </div>
        ) : result?.analysis ? (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-violet-400" />
                <h1 className="text-2xl font-bold text-white">{result.document_name}</h1>
              </div>
              <p className="text-slate-400 text-sm">
                Confidence: <span className={`font-semibold ${result.confidence === "high" ? "text-emerald-400" : "text-amber-400"}`}>{result.confidence}</span>
              </p>
            </div>
            <AnalysisView analysis={result.analysis} docName={result.document_name} docId={documentId} />
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-slate-400">Analysis not available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
