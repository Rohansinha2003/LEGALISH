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
  BookOpen,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { VoiceFirstModal } from "@/components/VoiceFirstModal";

const SAMPLE_QUESTIONS = [
  "My landlord isn't returning my deposit after 30 days notice",
  "Received a notice under Section 138 Negotiable Instruments Act",
  "Employer terminated without paying notice period salary",
  "Draft an 11-month residential rental agreement with deposit clause",
];

// Section 7: 4 Quick Actions with distinct colorful accents
const QUICK_ACTIONS = [
  {
    href: "/upload",
    icon: FileText,
    title: "Explain document",
    desc: "Break down rental agreements, notices, or employment contracts.",
    badge: "PDF • DOCX",
    color: "from-sky-500/15 to-blue-500/5 text-sky-600 dark:text-sky-400 border-sky-500/20 hover:border-sky-500/50",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    href: "/chat",
    icon: Sparkles,
    title: "Ask Legal AI",
    desc: "Chat with AI grounded in Indian Bare Acts & High Court precedents.",
    badge: "Instant",
    color: "from-purple-500/15 to-indigo-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:border-purple-500/50",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    href: "/create",
    icon: FilePlus2,
    title: "Create document",
    desc: "Draft compliant legal notices, affidavits, or agreements.",
    badge: "Guided Wizard",
    color: "from-amber-500/15 to-orange-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/50",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    href: "/translate",
    icon: Languages,
    title: "Translate",
    desc: "Convert legal texts between English and 14 Indian languages.",
    badge: "14 Languages",
    color: "from-teal-500/15 to-cyan-500/5 text-teal-600 dark:text-teal-400 border-teal-500/20 hover:border-teal-500/50",
    iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
];

const TRUST_PILLARS = [
  {
    icon: Scale,
    title: "Source-Backed Answers",
    desc: "Grounded directly in Indian Bare Acts, High Court & Supreme Court precedents.",
    badge: "Official Statutes",
    badgeColor: "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300",
  },
  {
    icon: Lock,
    title: "Privacy-First Architecture",
    desc: "DPDP Act 2023 compliant. Your documents are never used to train public foundation models.",
    badge: "DPDP 2023",
    badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
  },
  {
    icon: Languages,
    title: "14+ Indian Languages",
    desc: "Read explanations in Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati & more.",
    badge: "Multilingual",
    badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
  },
  {
    icon: Users2,
    title: "Human Legal Help Link",
    desc: "Seamless bridge to Bar Council verified advocates and District Legal Aid Clinics (DLSA).",
    badge: "NALSA / DLSA",
    badgeColor: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] relative overflow-hidden">
      {/* ─── AMBIENT COLORFUL GLOW BLOBS (Section 5) ─── */}
      <div className="glow-orb -top-24 left-1/4 w-96 h-96 bg-indigo-500" />
      <div className="glow-orb top-32 right-1/4 w-[28rem] h-[28rem] bg-purple-500" />
      <div className="glow-orb top-96 left-1/3 w-80 h-80 bg-cyan-400" />

      {/* ─── HERO SECTION (Section 4, 5, 6) ─── */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Tagline Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                ✦ LegalSaathi V4 • AI Legal Intelligence & Access Platform
              </span>
            </div>
          </div>

          {/* Main Headline with Gradient Word Highlights (Section 4) */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.14]">
              Understand the <span className="gradient-text-ai">law</span>. <br />
              Know what to do <span className="gradient-text-hero">next</span>.
            </h1>

            {/* Supporting Copy */}
            <p className="mt-5 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Upload a legal document, describe your situation, or ask a question. Get a clear explanation, relevant sources, and practical next steps.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/upload"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <FileText className="w-4 h-4 text-indigo-100" />
                <span>Understand a Document</span>
              </Link>
              <Link
                href="/chat"
                className="px-5 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-semibold hover:bg-[var(--surface-secondary)] hover:border-purple-500/40 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Describe My Problem</span>
              </Link>
              <Link
                href="/create"
                className="px-5 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-semibold hover:bg-[var(--surface-secondary)] hover:border-amber-500/40 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <FilePlus2 className="w-4 h-4 text-amber-500" />
                <span>Create a Legal Document</span>
              </Link>
            </div>
          </div>

          {/* ─── INTERACTIVE HERO AI INPUT (Section 6) ─── */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="animated-gradient-border shadow-xl">
              <div className="p-4 sm:p-5 bg-[var(--surface)] rounded-[1.25rem]">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)]">
                  <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-[10px]">
                      ✨
                    </span>
                    <span>What legal problem can we help you understand?</span>
                  </span>
                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                    ✦ Legal Copilot
                  </span>
                </div>

                <form onSubmit={handleSubmitQuestion}>
                  <textarea
                    value={problemText}
                    onChange={(e) => setProblemText(e.target.value)}
                    placeholder="&quot;My landlord isn't returning my deposit after 30 days notice...&quot; or paste a clause"
                    rows={3}
                    className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-hidden"
                  />

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <Link
                        href="/upload"
                        className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors flex items-center gap-1.5 text-xs font-medium"
                        title="Upload PDF, DOCX or image"
                      >
                        <Paperclip className="w-4 h-4 text-sky-500" />
                        <span className="hidden sm:inline">Upload</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setVoiceOpen(true)}
                        className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                        title="Speak in Hindi, English, Tamil, etc."
                      >
                        <Mic className="w-4 h-4 text-purple-500" />
                        <span className="hidden sm:inline">Speak</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!problemText.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 disabled:opacity-40 text-white text-xs font-semibold hover:shadow-md hover:shadow-purple-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
              <span className="text-[11px] text-[var(--text-muted)] self-center mr-1">Common issues:</span>
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => setProblemText(q)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)] transition-colors text-left truncate max-w-xs hover:border-indigo-400"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: QUICK ACTIONS BELOW HERO ─── */}
      <section className="py-12 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`group p-5 rounded-2xl bg-gradient-to-br ${action.color} border transition-all hover:shadow-md flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
                        {action.badge}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] group-hover:underline">
                      {action.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[var(--border)]/40 flex items-center justify-between text-xs font-semibold">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 16: VERIFIED TRUST SECTION (NO FAKE METRICS) ─── */}
      <section className="py-16 md:py-20 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              Credibility & Standards
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
              Built for Trust, Restraint & Legal Accuracy
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Indian law demystified through verified bare acts and High Court judgments, not hallucinated AI text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col justify-between hover:border-[var(--primary)]/40 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--surface-secondary)] text-[var(--primary)] flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pillar.badgeColor}`}>
                        {pillar.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{pillar.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── COLORFUL DOCUMENT COMPARISON WORKSPACE PREVIEW ─── */}
      <section className="py-20 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Interactive Intelligence
            </span>
            <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] mt-1">
              Side-by-Side Clarity
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Watch complex contract provisions transform into plain, actionable human language.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
            {/* Left: Original Contract Clause */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--surface-secondary)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                    ORIGINAL CLAUSE 14.2
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    ⚠ Needs Attention
                  </span>
                </div>
                <p className="font-serif text-xs text-[var(--text-secondary)] leading-relaxed italic">
                  &quot;The Lessor reserves the unconditional right to forfeit the entire security deposit amounting to ₹45,000/- forthwith in the event of early determination of the lease prior to the expiration of the lock-in period, notwithstanding any tender of 30-day notice.&quot;
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Bangalore Lease • Page 4</span>
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">Section 74 Review</span>
              </div>
            </div>

            {/* Right: LegalSaathi Plain Explanation */}
            <div className="p-6 flex flex-col justify-between bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Plain Meaning
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--text-muted)]">Simple Mode</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="block text-[var(--text-primary)] font-semibold mb-0.5">What this means:</strong>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      If you move out before the lock-in date, the landlord wants to keep all ₹45,000 of your deposit, even if you give 30 days notice.
                    </p>
                  </div>

                  <div>
                    <strong className="block text-[var(--text-primary)] font-semibold mb-0.5">Indian Law Context:</strong>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      Under Section 74 of the Indian Contract Act, 1872, a landlord cannot penalize beyond actual reasonable loss proved. Automatic total forfeiture is legally vulnerable.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <Link
                  href="/upload"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Analyze your own document <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Modal */}
      <VoiceFirstModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </div>
  );
}
