"use client";

import Link from "next/link";
import {
  Scale,
  FileText,
  MessageSquare,
  Languages,
  Shield,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Star,
  Upload,
  Zap,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const FEATURES = [
  {
    icon: FileText,
    title: "Understand Documents",
    description:
      "Upload any legal document — rental agreement, employment contract, legal notice — and get a plain-language explanation anyone can understand.",
    color: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: MessageSquare,
    title: "Ask Questions",
    description:
      'Ask questions about your document in plain language. Get answers grounded in what the document actually says — with page citations.',
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Languages,
    title: "Translate to Hindi",
    description:
      "Translate your document or its explanation between English and Hindi. Choose between legal precision or simple language.",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Scale,
    title: "Create Legal Drafts",
    description:
      "Describe your situation and generate a draft legal response, demand letter, or agreement — guided step by step.",
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Upload your document", desc: "PDF, Word document, or photo of a document" },
  { step: "02", title: "We analyze it", desc: "AI extracts key information, dates, obligations, and risks" },
  { step: "03", title: "Read in plain language", desc: "See what it means, who is involved, and what you need to do" },
  { step: "04", title: "Ask questions", desc: "Get grounded answers with citations to the original document" },
];

const TRUST_SIGNALS = [
  { icon: Lock, text: "Your documents are private and secure" },
  { icon: Shield, text: "We never use your documents to train AI" },
  { icon: CheckCircle, text: "Answers grounded in your actual document" },
  { icon: Zap, text: "Fast — results in seconds" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="content-container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">LegalSaathi</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="btn-ghost">Features</Link>
            <Link href="#how-it-works" className="btn-ghost">How it works</Link>
            <Link href="/dashboard" className="btn-secondary text-sm py-2 px-5">
              Go to App
            </Link>
          </div>
          <Link href="/dashboard" className="md:hidden btn-secondary text-sm py-2 px-4">
            Open App
          </Link>
        </div>
      </div>
    </nav>
  );
}

function DisclaimerBanner() {
  return (
    <div className="disclaimer-box mx-4 mt-20 mb-0 max-w-4xl mx-auto">
      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <p>
        <strong className="text-amber-400">Important:</strong> LegalSaathi provides AI-generated legal information and document assistance for informational purposes only. It is not a substitute for advice from a qualified lawyer. For urgent or high-stakes matters, consult a qualified advocate or appropriate legal-aid service.
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="page-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-bg pt-24 pb-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/2 w-64 h-64 bg-emerald-600/8 rounded-full blur-3xl" />
        </div>

        <div className="content-container relative">
          <DisclaimerBanner />

          <div className="text-center mt-12 mb-16 fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 border border-violet-500/20">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-sm text-slate-300 font-medium">AI-Powered Legal Assistance for India</span>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Understand Your{" "}
              <span className="gradient-text">Legal Documents.</span>
              <br className="hidden md:block" />
              <span className="text-slate-200"> In Simple Language.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Upload a legal document, understand what it means, ask questions, translate it, and create useful legal drafts —
              without needing to understand complicated legal language.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/dashboard?action=upload" className="btn-primary text-base px-8 py-3.5">
                <Upload className="w-5 h-5" />
                Understand a Document
              </Link>
              <Link href="/dashboard?action=create" className="btn-secondary text-base px-8 py-3.5">
                <FileText className="w-5 h-5" />
                Create a Legal Document
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 justify-center mt-8">
              <Link href="/dashboard?action=translate" className="btn-ghost text-sm">
                <Languages className="w-4 h-4" />
                Translate
              </Link>
              <Link href="/dashboard?action=ask" className="btn-ghost text-sm">
                <MessageSquare className="w-4 h-4" />
                Ask a Legal Question
              </Link>
            </div>
          </div>

          {/* Hero Card Preview */}
          <div className="max-w-4xl mx-auto fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="glass-strong p-6 glow-violet">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 h-7 glass rounded-lg flex items-center px-3">
                  <span className="text-xs text-slate-500">legalsaathi.in/analyze</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-semibold text-white">Rental Agreement.pdf</span>
                    <span className="badge badge-ready ml-auto">Ready</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    This is a rental agreement between Rahul Sharma (landlord) and Amit Verma (tenant) for a residential property in Bangalore from January to December 2027.
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Monthly Rent", value: "₹15,000 (due 5th)", icon: "💰" },
                    { label: "Security Deposit", value: "₹45,000", icon: "🏠" },
                    { label: "Notice Period", value: "30 days", icon: "📅" },
                    { label: "Risk Flag", value: "Termination Clause", icon: "⚠️" },
                  ].map((item) => (
                    <div key={item.label} className="glass rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{item.icon} {item.label}</span>
                      <span className="text-xs font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-12 border-y border-white/5">
        <div className="content-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_SIGNALS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-slate-400">
                <Icon className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="content-container">
          <div className="text-center mb-16">
            <p className="section-label mb-3">What you can do</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to understand your legal situation
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Four powerful tools to help you navigate legal documents without a law degree.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color, border, iconColor }) => (
              <div
                key={title}
                className={`glass card-hover p-6 border ${border} bg-gradient-to-br ${color}`}
              >
                <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center mb-4 ${iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{description}</p>
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-violet-400 mt-4 hover:text-violet-300 transition-colors">
                  Try it <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 border-t border-white/5">
        <div className="content-container">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Simple process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              From confusing document to clear understanding
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-violet-500/30 to-transparent z-0" />
                )}
                <div className="text-6xl font-black gradient-text opacity-30 mb-4">{step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5">
        <div className="content-container text-center">
          <div className="glass-strong max-w-3xl mx-auto p-12 glow-violet">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Don&apos;t let complicated language confuse you
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Start understanding your documents in minutes. No legal background required.
            </p>
            <Link href="/dashboard" className="btn-primary text-base px-10 py-4">
              Get started — it&apos;s free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="content-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">LegalSaathi</span>
            </div>
            <p className="text-sm text-slate-500 text-center max-w-xl">
              This platform provides AI-generated legal information for informational purposes only. It is not a substitute for advice from a qualified lawyer. Laws and procedures can vary by jurisdiction and circumstances.
            </p>
            <p className="text-sm text-slate-600">© 2027 LegalSaathi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
