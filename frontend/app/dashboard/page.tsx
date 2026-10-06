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
} from "lucide-react";
import { casesApi, documentsApi, CaseSummary, DocumentSummary } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState("");

  // Time-based greeting (Section 16)
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

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(quickQuery.trim())}`);
  };

  // Section 17 & 50 Feature Color Identities
  const PRIMARY_ACTIONS = [
    {
      href: "/upload",
      title: "Explain a document",
      desc: "Upload a lease, contract or notice for a plain-language summary & risk review.",
      icon: FileText,
      badge: "PDF / DOCX",
      gradient: "from-sky-500/15 via-blue-500/5 to-transparent text-sky-600 dark:text-sky-400 border-sky-500/25 hover:border-sky-500/60",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      href: "/chat",
      title: "Ask a legal question",
      desc: "Chat with AI grounded in Indian law, bare acts, and High Court judgments.",
      icon: MessageSquareText,
      badge: "Instant AI",
      gradient: "from-purple-500/15 via-indigo-500/5 to-transparent text-purple-600 dark:text-purple-400 border-purple-500/25 hover:border-purple-500/60",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      href: "/create",
      title: "Create a document",
      desc: "Generate custom legal notices, rental agreements, or affidavits in 8 steps.",
      icon: FilePlus2,
      badge: "Guided Wizard",
      gradient: "from-amber-500/15 via-orange-500/5 to-transparent text-amber-600 dark:text-amber-400 border-amber-500/25 hover:border-amber-500/60",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      href: "/translate",
      title: "Translate",
      desc: "Convert legal texts between English and Hindi, Tamil, Bengali & other languages.",
      icon: Languages,
      badge: "14 Languages",
      gradient: "from-teal-500/15 via-cyan-500/5 to-transparent text-teal-600 dark:text-teal-400 border-teal-500/25 hover:border-teal-500/60",
      iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    },
    {
      href: "/easy-help",
      title: "Find legal help",
      desc: "Connect with verified legal advocates or District Legal Services Authorities.",
      icon: HeartHandshake,
      badge: "NALSA / DLSA",
      gradient: "from-emerald-500/15 via-green-500/5 to-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:border-emerald-500/60",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            🔴 Critical
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            🟠 High Priority
          </span>
        );
      case "moderate":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            🔵 Moderate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            🟢 Normal
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-10">
      {/* ─── SECTION 16: TOP GREETING & WHAT DO YOU NEED HELP WITH? ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            {greeting} 👋
          </h1>
          <h2 className="text-base sm:text-lg text-[var(--text-secondary)] font-medium mt-1">
            What do you need help with today?
          </h2>
        </div>

        <Link
          href="/cases/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md hover:shadow-indigo-500/25 shadow-xs transition-all text-xs font-semibold w-fit cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-indigo-100" />
          <span>Start New Case</span>
        </Link>
      </div>

      {/* ─── SECTION 16: HERO ASK LEGAL AI PROMPT CARD ─── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/25 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center text-xs shadow-xs">
            ✨
          </span>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Ask Legal AI Copilot</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            Instant Guidance
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Describe your legal problem, agreement question, or tenant dispute in plain words:
        </p>

        <form onSubmit={handleQuickAsk} className="flex gap-2">
          <input
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="&quot;Landlord refusing to return ₹45,000 security deposit after handover...&quot;"
            className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!quickQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-40 text-white text-xs font-semibold hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* ─── SECTION 16 & 17: WORKSPACE COLORFUL STATS SUMMARY ─── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Your Legal Workspace
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Cases: Indigo */}
          <Link
            href="/cases"
            className="p-4 rounded-2xl bg-[var(--surface)] border border-indigo-500/20 hover:border-indigo-500/60 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                Active Cases
              </span>
              <span className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                {cases.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
          </Link>

          {/* Documents: Blue */}
          <Link
            href="/upload"
            className="p-4 rounded-2xl bg-[var(--surface)] border border-sky-500/20 hover:border-sky-500/60 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 block">
                Documents
              </span>
              <span className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                {documents.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </Link>

          {/* Deadlines: Amber */}
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                Upcoming Deadlines
              </span>
              <span className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                1
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Research: Cyan */}
          <Link
            href="/caselaw"
            className="p-4 rounded-2xl bg-[var(--surface)] border border-cyan-500/20 hover:border-cyan-500/60 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 block">
                Saved Precedents
              </span>
              <span className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                4
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <BookmarkCheck className="w-4.5 h-4.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* ─── UPCOMING DEADLINE BANNER ─── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Statutory Limitation Alert
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
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
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <span>View Notice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ─── 5 COLORFUL PRIMARY ACTION CARDS ─── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Primary Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {PRIMARY_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`group p-4 rounded-2xl bg-gradient-to-br ${action.gradient} border transition-all hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${action.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {action.badge}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-[var(--text-primary)] group-hover:underline">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                    {action.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border)]/50 flex items-center justify-between text-[11px] font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── RECENT CASES (Section 18 Rich Cards) ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">Active Case Workspaces</h2>
            <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900">
              {cases.length}
            </span>
          </div>
          <Link
            href="/cases"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            All Cases ({cases.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Empty State */}
        {cases.length === 0 && !loading && (
          <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">No active cases yet</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Your legal workspace starts here. Start a case to organize your documents, receipts, timeline, and questions.
            </p>
            <div className="pt-2">
              <Link
                href="/cases/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:shadow-md transition-all shadow-xs"
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
              className="group p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-sm font-bold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                  {getUrgencyBadge(c.urgency)}
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {c.ai_summary || c.description || "Case initiated."}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                  {c.issue_type}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : "Recently"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── RECENT DOCUMENTS & SAVED PRECEDENTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left 2 Cols: Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-serif text-base font-bold text-[var(--text-primary)]">Recent Documents</h2>
              <span className="text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-900">
                {documents.length}
              </span>
            </div>
            <Link
              href="/upload"
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
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
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-[11px]">
                      {doc.file_type.toUpperCase()}
                    </div>
                    <div>
                      <Link
                        href={`/analyze/${doc.id}`}
                        className="text-xs font-bold text-[var(--text-primary)] hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
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
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
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

        {/* Right Col: Saved Research & Statutory Precedents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <BookmarkCheck className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-serif text-base font-bold text-[var(--text-primary)]">Legal Research</h2>
            </div>
            <Link
              href="/caselaw"
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Browse Acts →
            </Link>
          </div>

          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 space-y-3">
            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">
                Statutory Reference
              </span>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Transfer of Property Act, 1882</h4>
              <p className="text-[11px] text-[var(--text-secondary)]">Section 106: Duration of certain leases in absence of written contract.</p>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                Supreme Court Precedent
              </span>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Kailash Nath Associates v. DDA</h4>
              <p className="text-[11px] text-[var(--text-secondary)]">Section 74 Contract Act: Compensation is only payable for actual loss proved.</p>
            </div>

            <Link
              href="/caselaw"
              className="block text-center py-2.5 rounded-xl border border-cyan-500/30 hover:bg-cyan-500/10 text-xs font-bold text-cyan-700 dark:text-cyan-300 transition-colors"
            >
              Open Indian Case Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
