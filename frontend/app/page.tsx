"use client";

import Link from "next/link";
import {
  Scale,
  FileText,
  MessageSquare,
  Languages,
  Upload,
  ChevronRight,
  CheckCircle,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  AlertTriangle,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";

const FEATURES = [
  {
    icon: FileText,
    title: "Understand Documents",
    description: "Upload a rental agreement, employment contract, or legal notice and receive a plain-language explanation of every clause.",
    iconBg: "bg-[#EFF4FF]",
    iconColor: "text-[#1E3A5F]",
    border: "border-[#C7D7F5]",
  },
  {
    icon: MessageSquare,
    title: "Ask Questions",
    description: "Ask questions about your document in plain language. Every answer is grounded in what the document actually says, with page citations.",
    iconBg: "bg-[#FBF3DC]",
    iconColor: "text-[#A67C3A]",
    border: "border-[#E8C97A]",
  },
  {
    icon: Languages,
    title: "Translate to Hindi",
    description: "Translate your document or its explanation between English and Hindi. Choose legal precision or everyday simple language.",
    iconBg: "bg-[#D1FAE5]",
    iconColor: "text-[#0F7653]",
    border: "border-[#A7F3D0]",
  },
  {
    icon: Scale,
    title: "Create Legal Drafts",
    description: "Describe your situation step by step and generate a draft legal response, demand letter, or agreement — then download as PDF.",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#B45309]",
    border: "border-[#FDE68A]",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Upload your document", desc: "PDF, Word document, or photo of a document — any format works" },
  { step: "02", title: "We analyze it", desc: "AI extracts key information, parties, dates, obligations, and risks" },
  { step: "03", title: "Read in plain language", desc: "See what it means, who is involved, what you owe, and what to watch out for" },
  { step: "04", title: "Ask questions", desc: "Get grounded answers with citations to the exact page in your document" },
];

const TRUST_SIGNALS = [
  { icon: Lock, text: "Your documents are private and secure" },
  { icon: Shield, text: "Never used to train AI models" },
  { icon: CheckCircle, text: "Answers grounded in your actual document" },
  { icon: Zap, text: "Results in seconds" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "navbar shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="content-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-[17px] text-[#0F1B2D] tracking-tight">LegalSaathi</span>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="btn-ghost text-sm">Features</Link>
            <Link href="#how-it-works" className="btn-ghost text-sm">How it works</Link>
            <div className="w-px h-5 bg-[#DDD0BC] mx-2" />
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-5">
              Open App
            </Link>
          </div>
          <Link href="/dashboard" className="md:hidden btn-primary text-sm py-2 px-4">
            Open App
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div className="page-container">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="hero-bg hero-pattern pt-24 pb-16 relative overflow-hidden">
        {/* Decorative lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-[#C8B99A]/30" />
          <div className="absolute bottom-0 right-12 w-48 h-48 rounded-full border border-[#DDD0BC]/40" />
          <div className="absolute bottom-8 right-20 w-28 h-28 rounded-full border border-[#C8B99A]/30" />
        </div>

        <div className="content-container relative">
          {/* Disclaimer banner */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="disclaimer-box text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Important:</strong> LegalSaathi provides AI-generated legal information for informational purposes only. It is not a substitute for advice from a qualified lawyer. For urgent matters, consult a qualified advocate.
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto fade-in-up">
            <div className="inline-flex items-center gap-2 bg-[#FBF3DC] border border-[#E8C97A] px-4 py-2 rounded-full mb-8">
              <Star className="w-3.5 h-3.5 text-[#A67C3A] fill-[#A67C3A]" />
              <span className="text-sm text-[#A67C3A] font-semibold">AI-Powered Legal Assistance for India</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-[#0F1B2D] mb-5 leading-[1.12] tracking-tight">
              Understand Your{" "}
              <span className="gradient-text-gold">Legal Documents.</span>
              <br />
              <span className="text-[#374151]">In Simple Language.</span>
            </h1>

            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload a legal document, understand what it means, ask questions, translate to Hindi, and create useful legal drafts — without needing a law degree.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/upload" className="btn-primary text-[15px] px-7 py-3">
                <Upload className="w-4 h-4" />
                Understand a Document
              </Link>
              <Link href="/create" className="btn-secondary text-[15px] px-7 py-3">
                <FileText className="w-4 h-4" />
                Create a Legal Draft
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-5">
              <Link href="/translate" className="btn-ghost text-sm text-[#6B7280]">
                <Languages className="w-4 h-4" /> Translate
              </Link>
              <Link href="/chat" className="btn-ghost text-sm text-[#6B7280]">
                <MessageSquare className="w-4 h-4" /> Ask about a document
              </Link>
            </div>
          </div>

          {/* Hero card */}
          <div className="max-w-3xl mx-auto mt-14 fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="card p-5 shadow-lg">
              {/* Window chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FECACA]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEF08A]" />
                  <div className="w-3 h-3 rounded-full bg-[#BBF7D0]" />
                </div>
                <div className="flex-1 bg-[#F2EDE0] rounded-md h-6 flex items-center px-3">
                  <span className="text-xs text-[#9CA3AF]">legalsaathi.in/analyze</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F7F2E8] border border-[#EDE4D3] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#EFF4FF] rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#1E3A5F]" />
                    </div>
                    <span className="text-sm font-semibold text-[#0F1B2D]">Rental Agreement.pdf</span>
                    <span className="badge badge-ready ml-auto">Ready</span>
                  </div>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    This is a rental agreement between Rahul Sharma (landlord) and Amit Verma (tenant) for a flat in Bangalore from January to December 2027.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Monthly Rent", value: "₹15,000 (due 5th)", dot: "bg-[#0F7653]" },
                    { label: "Security Deposit", value: "₹45,000", dot: "bg-[#1E3A5F]" },
                    { label: "Notice Period", value: "30 days", dot: "bg-[#A67C3A]" },
                    { label: "⚠ Risk Flag", value: "Termination clause", dot: "bg-[#C0392B]" },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#F7F2E8] border border-[#EDE4D3] rounded-lg px-3 py-2.5 flex items-center justify-between">
                      <span className="text-xs text-[#6B7280] flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold text-[#0F1B2D]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST SIGNALS ─── */}
      <section className="py-10 bg-[#F2EDE0] border-y border-[#DDD0BC]">
        <div className="content-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_SIGNALS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-[#6B7280]">
                <Icon className="w-5 h-5 text-[#A67C3A] flex-shrink-0" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 bg-[#FDFAF5]">
        <div className="content-container">
          <div className="text-center mb-14">
            <p className="section-label mb-3">What you can do</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F1B2D] mb-4">
              Everything you need to understand your legal situation
            </h2>
            <p className="text-[#6B7280] max-w-xl mx-auto">
              Four tools that work together to help you navigate legal documents without a law degree.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, description, iconBg, iconColor, border }) => (
              <div key={title} className={`card card-hover p-6 border ${border}`}>
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4 ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F1B2D] mb-2">{title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{description}</p>
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-[#A67C3A] mt-4 font-medium hover:text-[#C4943A] transition-colors">
                  Try it <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 bg-[#F7F2E8] border-t border-[#DDD0BC]">
        <div className="content-container">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Simple process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F1B2D] mb-4">
              From confusing document to clear understanding
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-px bg-[#DDD0BC]" />

            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                <div className="w-14 h-14 rounded-full bg-[#FDFAF5] border-2 border-[#DDD0BC] flex items-center justify-center mb-5 relative z-10">
                  <span className="text-lg font-black text-[#C4943A]">{step}</span>
                </div>
                <h3 className="text-base font-bold text-[#0F1B2D] mb-2">{title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-[#FDFAF5]">
        <div className="content-container">
          <div className="max-w-2xl mx-auto text-center card p-12 border-[#DDD0BC]">
            <div className="w-14 h-14 bg-[#1E3A5F] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#0F1B2D] mb-4">
              Don't let legal language confuse you
            </h2>
            <p className="text-[#6B7280] mb-8 leading-relaxed">
              Start understanding your documents in minutes. No legal background required.
            </p>
            <Link href="/dashboard" className="btn-primary text-[15px] px-9 py-3.5">
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#DDD0BC] py-10 bg-[#F2EDE0]">
        <div className="content-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-[#0F1B2D]">LegalSaathi</span>
            </div>
            <p className="text-xs text-[#9CA3AF] text-center max-w-lg">
              AI-generated legal information for informational purposes only. Not a substitute for advice from a qualified lawyer. Laws vary by jurisdiction and circumstances.
            </p>
            <p className="text-xs text-[#9CA3AF]">© 2027 LegalSaathi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
