"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageSquareText,
  FilePlus2,
  Paperclip,
  Mic,
  ArrowRight,
  ShieldCheck,
  Languages,
  Users2,
  Scale,
  Sparkles,
  ChevronRight,
  Clock,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { VoiceFirstModal } from "@/components/VoiceFirstModal";

const SAMPLE_QUESTIONS = [
  "My landlord isn't returning my security deposit after moving out",
  "Received a cheque bounce notice under Section 138",
  "Employer terminated employment without paying notice period salary",
  "Need to draft a residential rental agreement with 11-month clause",
];

const TRUST_PILLARS = [
  {
    icon: Scale,
    title: "Source-Backed Answers",
    description: "Every explanation cites statutory provisions like the Indian Contract Act or Tenancy Acts with relevant judgment references.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-First Architecture",
    description: "Built strictly aligned with the DPDP Act 2023. Documents are private to your account and never used to train foundational models.",
  },
  {
    icon: Languages,
    title: "Multilingual Indian Context",
    description: "Read documents and explanations in Hindi, Bengali, Marathi, Tamil, Telugu, Kannada, Gujarati, and other Indian languages.",
  },
  {
    icon: Users2,
    title: "Human Legal Help When Needed",
    description: "Direct bridge to verified legal advocates and District Legal Services Authorities (DLSA) when court representation is necessary.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [problemText, setProblemText] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(problemText.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 overflow-hidden border-b border-[var(--border)]">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Tagline Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Indian Legal Intelligence & Access Platform
              </span>
            </div>
          </div>

          {/* Main Headline (Section 14) */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.15]">
              Understand the law. <br />
              <span className="text-indigo-600 dark:text-indigo-400">Know what to do next.</span>
            </h1>

            {/* Supporting Copy (Section 14) */}
            <p className="mt-5 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Upload a legal document, describe your situation, or ask a question. Get a clear explanation, relevant sources, and practical next steps.
            </p>

            {/* Primary Action Buttons (Section 14) */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/upload"
                className="px-5 py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-200" />
                Understand a Document
              </Link>
              <Link
                href="/chat"
                className="px-5 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-semibold hover:bg-[var(--surface-secondary)] transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <MessageSquareText className="w-4 h-4 text-[var(--text-muted)]" />
                Describe My Problem
              </Link>
              <Link
                href="/create"
                className="px-5 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-semibold hover:bg-[var(--surface-secondary)] transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <FilePlus2 className="w-4 h-4 text-[var(--text-muted)]" />
                Create a Legal Document
              </Link>
            </div>
          </div>

          {/* ─── INTERACTIVE HERO CARD (Section 15) ─── */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl p-4 sm:p-5 transition-all">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)]">
                <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> What happened?
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">Natural Language Legal Copilot</span>
              </div>

              <form onSubmit={handleSubmitQuestion}>
                <textarea
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="&quot;My landlord isn't returning my deposit after 30 days notice...&quot; or paste a legal clause"
                  rows={3}
                  className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-hidden"
                />

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/upload"
                      className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors flex items-center gap-1.5 text-xs font-medium"
                      title="Upload PDF, DOCX or image"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span className="hidden sm:inline">Upload</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setVoiceOpen(true)}
                      className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                      title="Speak in Hindi, English, Tamil, etc."
                    >
                      <Mic className="w-4 h-4 text-indigo-500" />
                      <span className="hidden sm:inline">Voice</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!problemText.trim()}
                    className="px-4 py-2 rounded-xl bg-[var(--primary)] disabled:opacity-40 text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Analyze Situation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
              <span className="text-[11px] text-[var(--text-muted)] self-center mr-1">Common issues:</span>
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => setProblemText(q)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)] transition-colors text-left truncate max-w-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 16: TRUST SECTION (NO FAKE METRICS) ─── */}
      <section className="py-16 md:py-20 bg-[var(--surface-secondary)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Designed for Trust, Restraint & Legal Accuracy
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Legal technology requires absolute clarity. We ground every finding in official Indian statutes, not speculative AI text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col justify-between hover:border-[var(--border-strong)] transition-all"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">{pillar.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── PRODUCT CAPABILITY PREVIEW ─── */}
      <section className="py-20 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              Workflow Demonstration
            </span>
            <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] mt-1">
              How LegalSaathi Demystifies Documents
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              A side-by-side view of complex legal drafting converted into structured, actionable understanding.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
            {/* Left: Original Contract Clause */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--surface-secondary)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">ORIGINAL CLAUSE 14.2</span>
                  <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                    Worth Reviewing
                  </span>
                </div>
                <p className="font-serif text-xs text-[var(--text-secondary)] leading-relaxed italic">
                  &quot;The Lessor reserves the unconditional right to forfeit the entire security deposit amounting to ₹45,000/- forthwith in the event of early determination of the lease prior to the expiration of the lock-in period, notwithstanding any tender of 30-day notice.&quot;
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Bangalore Residential Lease • Page 4</span>
                <span className="text-slate-400">Section 74 review</span>
              </div>
            </div>

            {/* Right: LegalSaathi Plain Explanation */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Plain Meaning
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Simple Mode</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="block text-[var(--text-primary)] font-semibold mb-0.5">What this means:</strong>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      If you move out before the agreed lock-in date, the landlord wants to keep all ₹45,000 of your deposit, even if you give advance notice.
                    </p>
                  </div>

                  <div>
                    <strong className="block text-[var(--text-primary)] font-semibold mb-0.5">Indian Law Context:</strong>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      Under Section 74 of the Indian Contract Act, 1872, a landlord cannot penalize beyond actual reasonable loss. An automatic total forfeiture may be challenged.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <Link
                  href="/upload"
                  className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  Analyze your own document <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RESPONSIBLE LEGAL UX NOTICE ─── */}
      <section className="py-12 bg-[var(--surface-secondary)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 p-3 px-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
            <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
            <p className="text-xs text-[var(--text-secondary)] text-left">
              <strong>Transparent Legal Standard:</strong> LegalSaathi synthesizes statutory texts and case judgments for legal awareness. It is not an alternative to formal representation by an advocate enrolled with the Bar Council of India.
            </p>
          </div>
        </div>
      </section>

      <VoiceFirstModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </div>
  );
}
