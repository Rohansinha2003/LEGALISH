"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ExternalLink,
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

  // Section 17 Primary Actions
  const PRIMARY_ACTIONS = [
    {
      href: "/upload",
      title: "Explain a document",
      desc: "Upload a lease, contract or notice for a plain-language summary & risk review.",
      icon: FileText,
      badge: "PDF / DOCX",
    },
    {
      href: "/chat",
      title: "Ask a legal question",
      desc: "Chat with AI grounded in Indian law, bare acts, and High Court judgments.",
      icon: MessageSquareText,
      badge: "Instant",
    },
    {
      href: "/create",
      title: "Create a document",
      desc: "Generate custom legal notices, rental agreements, or affidavits in 8 steps.",
      icon: FilePlus2,
      badge: "Guided",
    },
    {
      href: "/translate",
      title: "Translate",
      desc: "Convert legal texts between English and Hindi, Tamil, Bengali & other languages.",
      icon: Languages,
      badge: "Bilingual",
    },
    {
      href: "/easy-help",
      title: "Find legal help",
      desc: "Connect with verified legal advocates or District Legal Services Authorities.",
      icon: HeartHandshake,
      badge: "NALSA / DLSA",
    },
  ];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            Critical
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            High Priority
          </span>
        );
      case "moderate":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            Moderate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-10">
      {/* ─── SECTION 17: DASHBOARD HEADER & PERSONALIZATION ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide uppercase">
            {greeting}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mt-1 tracking-tight">
            What do you need help with today?
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Choose a quick action below or manage your active cases and deadlines.
          </p>
        </div>

        <Link
          href="/cases/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-xs transition-all text-xs font-semibold w-fit cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-indigo-200" />
          <span>Start New Case</span>
        </Link>
      </div>

      {/* ─── SECTION 18: URGENT ACTION & NEXT DEADLINE BANNER ─── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                You have 1 upcoming deadline
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200">
                Due in 3 days
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
              Notice Response: Security deposit refund demand notice under Section 106, Transfer of Property Act.
            </p>
          </div>
        </div>

        <Link
          href="/cases"
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span>View Notice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ─── SECTION 17: 5 PRIMARY ACTIONS GRID ─── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Primary Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {PRIMARY_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-secondary)] text-[var(--primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded">
                      {action.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {action.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-medium text-[var(--primary)]">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── RECENT CASES & WORKSPACE ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">Recent Cases</h2>
            <span className="text-xs font-semibold bg-[var(--surface-secondary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-[var(--border)]">
              {cases.length}
            </span>
          </div>
          <Link
            href="/cases"
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            All Cases ({cases.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Section 55 Empty State */}
        {cases.length === 0 && !loading && (
          <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-secondary)] text-[var(--primary)] flex items-center justify-center mx-auto">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">No cases yet</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Your legal workspace starts here. Start a case to organize your documents, receipts, timeline, and questions.
            </p>
            <div className="pt-2">
              <Link
                href="/cases/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Create your first case
              </Link>
            </div>
          </div>
        )}

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.slice(0, 6).map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="group p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                  {getUrgencyBadge(c.urgency)}
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {c.ai_summary || c.description || "Case initiated."}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="font-medium bg-[var(--surface-secondary)] px-2 py-0.5 rounded text-[var(--text-secondary)]">
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

      {/* ─── RECENT DOCUMENTS & SAVED RESEARCH ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left 2 Cols: Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="font-serif text-base font-bold text-[var(--text-primary)]">Recent Documents</h2>
              <span className="text-xs font-semibold bg-[var(--surface-secondary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                {documents.length}
              </span>
            </div>
            <Link
              href="/upload"
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Upload Document →
            </Link>
          </div>

          {documents.length > 0 ? (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
              {documents.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex items-center justify-between hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-secondary)] text-[var(--primary)] flex items-center justify-center font-bold text-[11px]">
                      {doc.file_type.toUpperCase()}
                    </div>
                    <div>
                      <Link
                        href={`/analyze/${doc.id}`}
                        className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
                      >
                        {doc.name}
                      </Link>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface-secondary)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
                      {doc.status}
                    </span>
                    <Link
                      href={`/analyze/${doc.id}`}
                      className="text-xs font-semibold text-[var(--primary)] hover:underline"
                    >
                      View Analysis
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
              No uploaded documents yet. Upload a lease, notice or contract to begin.
            </div>
          )}
        </div>

        {/* Right Col: Saved Research & Case-law */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="font-serif text-base font-bold text-[var(--text-primary)]">Legal Research</h2>
            </div>
            <Link
              href="/caselaw"
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Browse Acts →
            </Link>
          </div>

          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 space-y-3">
            <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--primary)]">Statutory Reference</span>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Transfer of Property Act, 1882</h4>
              <p className="text-[11px] text-[var(--text-secondary)]">Section 106: Duration of certain leases in absence of written contract.</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--primary)]">Supreme Court Precedent</span>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Kailash Nath Associates v. DDA</h4>
              <p className="text-[11px] text-[var(--text-secondary)]">Section 74 Contract Act: Compensation is only payable for actual loss proved.</p>
            </div>

            <Link
              href="/caselaw"
              className="block text-center py-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
            >
              Open Indian Case Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
