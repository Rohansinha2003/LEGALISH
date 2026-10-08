"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Sparkles,
  Search,
  Languages,
  Scale,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mic,
  Paperclip,
  Clock,
  UserCheck,
  FileEdit,
  FolderOpen,
  Volume2,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { VoiceFirstModal } from "@/components/VoiceFirstModal";

const COMMON_PROMPTS = [
  "Explain this legal notice in simple words",
  "My landlord isn't returning my deposit after 30 days notice",
  "Received a notice under Section 138 Negotiable Instruments Act",
  "Employer terminated without paying 3 months notice salary",
];

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [activeTabDemo, setActiveTabDemo] = useState<"clause14" | "clause4">("clause14");
  const [selectedLanguage, setSelectedLanguage] = useState("hi");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
  };

  const indianLanguages = [
    { code: "hi", name: "Hindi", script: "हिन्दी", sample: "आपका सुरक्षा जमा 15 दिनों में वापस होना चाहिए।" },
    { code: "bn", name: "Bengali", script: "বাংলা", sample: "আপনার জামানত ১৫ দিনের মধ্যে ফেরত দেওয়া উচিত।" },
    { code: "ta", name: "Tamil", script: "தமிழ்", sample: "உங்கள் முன்பணம் 15 நாட்களுக்குள் திரும்ப வழங்கப்பட வேண்டும்." },
    { code: "te", name: "Telugu", script: "తెలుగు", sample: "మీ సెక్యూరిటీ డిపాజిట్ 15 రోజుల్లో తిరిగి ఇవ్వాలి." },
    { code: "mr", name: "Marathi", script: "मराठी", sample: "तुमची सुरक्षा ठेव १५ दिवसांत परत केली पाहिजे." },
    { code: "gu", name: "Gujarati", script: "ગુજરાતી", sample: "તમારી સિક્યોરિટી ડિપોઝિટ 15 દિવસમાં પરત થવી જોઈએ." },
    { code: "kn", name: "Kannada", script: "ಕನ್ನಡ", sample: "ನಿಮ್ಮ ಭದ್ರತಾ ಠೇವಣಿಯನ್ನು 15 ದಿನಗಳಲ್ಲಿ ಮರುಪಾವತಿಸಬೇಕು." },
    { code: "ml", name: "Malayalam", script: "മലയാളം", sample: "നിങ്ങളുടെ സെക്യൂരിറ്റി ഡെപ്പോസിറ്റ് 15 ദിവസത്തിനകം തിരികെ നൽകണം." },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EC] dark:bg-[#0D0D0F] text-[#171717] dark:text-[#F5F5F5] transition-colors relative selection:bg-[#EFE9DE] selection:text-[#171717]">
      {/* ─── 1. HERO SECTION (Editorial Serif + Technology Intelligence) ─── */}
      <section className="relative pt-16 md:pt-28 pb-20 md:pb-32 overflow-hidden border-b border-[#DED8CD] dark:border-[#26262B]">
        {/* Soft Ambient Depth Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-60">
          <div className="w-[42rem] h-[22rem] mx-auto rounded-full bg-gradient-to-b from-[#7C3AED]/5 via-[#4F46E5]/4 to-transparent blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Subtle AI Descriptor Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FBF9F5] dark:bg-[#151518] border border-[#DED8CD] dark:border-[#26262B] shadow-xs mb-8">
            <span className="text-[11px] font-serif text-[#7C3AED] dark:text-[#A78BFA]">✦</span>
            <span className="text-xs font-medium text-[#6B6862] dark:text-[#A1A1A8]">
              AI-powered legal intelligence for everyone
            </span>
          </div>

          {/* Master Headline (Section 4 & 6) */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#171717] dark:text-[#F5F5F5] leading-[1.08] max-w-4xl mx-auto">
            Understand the law. <br />
            <span className="font-sans font-semibold text-[#6B6862] dark:text-[#A1A1A8]">
              Know what to do next.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-[#6B6862] dark:text-[#A1A1A8] max-w-2xl mx-auto leading-relaxed font-normal">
            Legal intelligence designed to make complex legal documents, rights, procedures, and next steps understandable to everyone.
          </p>

          {/* Dual Action CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#171717] dark:bg-[#F5F5F5] hover:bg-[#2B2B2B] dark:hover:bg-[#E5E5E5] text-[#FBF9F5] dark:text-[#171717] text-sm font-semibold shadow-md shadow-black/5 hover:shadow-lg transition-all cursor-pointer group"
            >
              <span>Analyze a Document</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FBF9F5] dark:bg-[#151518] border border-[#DED8CD] dark:border-[#26262B] hover:bg-[#EFE9DE] dark:hover:bg-[#1D1D22] text-[#171717] dark:text-[#F5F5F5] text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Ask Legal AI</span>
            </Link>
          </div>

          {/* ─── 2. AI COMMAND INTERFACE (Prompt #6) ─── */}
          <div className="mt-14 max-w-2xl mx-auto text-left">
            <div className="bg-[#FBF9F5] dark:bg-[#151518] rounded-3xl p-5 sm:p-6 border border-[#DED8CD] dark:border-[#26262B] shadow-[0_12px_40px_rgba(23,23,23,0.06)] transition-all">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DED8CD]/60 dark:border-[#26262B]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#F5F1FD] dark:bg-[#26213B] text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center font-serif text-xs font-bold">
                    ✦
                  </span>
                  <span className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F5]">
                    Ask Legal AI
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8C8880]">Grounded in Indian Law</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="&quot;Explain this legal notice in simple words&quot; or paste a rental agreement clause..."
                  rows={3}
                  className="w-full bg-transparent text-sm sm:text-base text-[#171717] dark:text-[#F5F5F5] placeholder-[#8C8880] resize-none focus:outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-2 border-t border-[#EAE5DA] dark:border-[#26262B]">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#6B6862] dark:text-[#A1A1A8] hover:text-[#171717] dark:hover:text-white bg-[#F4F0E8] dark:bg-[#1D1D22] hover:bg-[#EFE9DE] transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>Upload</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setVoiceOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#6B6862] dark:text-[#A1A1A8] hover:text-[#171717] dark:hover:text-white bg-[#F4F0E8] dark:bg-[#1D1D22] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>Speak</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#171717] dark:bg-[#F5F5F5] text-[#FBF9F5] dark:text-[#171717] text-xs font-semibold hover:bg-[#2B2B2B] disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Ask AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Prompts */}
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 justify-center">
              <span className="text-[11px] text-[#8C8880]">Common:</span>
              {COMMON_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setQuery(prompt)}
                  className="text-[11px] px-3 py-1 rounded-full bg-[#FBF9F5] dark:bg-[#151518] hover:bg-[#EFE9DE] text-[#6B6862] dark:text-[#A1A1A8] border border-[#DED8CD] dark:border-[#26262B] transition-colors truncate max-w-[280px] cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. HERO VISUAL: FLOATING DOCUMENT INTELLIGENCE (Prompt #7) ─── */}
      <section className="py-20 md:py-28 bg-[#FBF9F5] dark:bg-[#151518] border-b border-[#DED8CD] dark:border-[#26262B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
              Legal Intelligence Interface
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171717] dark:text-[#F5F5F5] mt-1.5">
              From confusing legalese to crystal clarity
            </h2>
            <p className="mt-2 text-sm text-[#6B6862] dark:text-[#A1A1A8]">
              See how Legal AI identifies critical obligations, assesses risks, and explains what each clause actually means.
            </p>
          </div>

          {/* Floating Document & AI Analysis Demo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
            {/* Left: Original Legal Document */}
            <div className="bg-[#F7F3EC] dark:bg-[#111114] rounded-3xl p-6 sm:p-7 border border-[#DED8CD] dark:border-[#26262B] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#DED8CD] dark:border-[#26262B]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4F46E5]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#171717] dark:text-[#F5F5F5]">
                      Residential Tenancy Agreement
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8C8880]">Page 4 of 8</span>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-[#6B6862] dark:text-[#A1A1A8]">
                  <p className="opacity-60 line-clamp-2">
                    Clause 13. The Lessee shall maintain the premises in tenantable repair, reasonable wear and tear excepted...
                  </p>

                  {/* Active Highlighted Clause */}
                  <div className="p-4 rounded-2xl bg-[#FAF4E6] dark:bg-[#2A2314] border border-[#F3E3BC] dark:border-[#42361B] text-[#171717] dark:text-[#F5F5F5] transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-[11px] text-[#C98A16]">
                        CLAUSE 14.2 (Deposit Forfeiture)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C98A16]/20 text-[#8A5E0E] dark:text-[#FBBF24]">
                        ⚠ Important Clause
                      </span>
                    </div>
                    <p className="font-serif italic text-xs leading-relaxed">
                      &ldquo;The Lessor reserves the unconditional right to forfeit the entire security deposit of ₹50,000/- forthwith in the event of early determination of lease prior to lock-in, notwithstanding 30 days written notice.&rdquo;
                    </p>
                  </div>

                  <p className="opacity-60 line-clamp-2">
                    Clause 15. Jurisdiction. In the event of any dispute arising hereunder, courts in New Delhi shall have exclusive jurisdiction...
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-[#DED8CD] dark:border-[#26262B] flex items-center justify-between text-[11px] text-[#8C8880]">
                <span>Registered Lease Deed • Delhi</span>
                <span className="text-[#16845B] font-semibold">Verified format</span>
              </div>
            </div>

            {/* Right: AI Explanation Card */}
            <div className="bg-[#FBF9F5] dark:bg-[#18181D] rounded-3xl p-6 sm:p-7 border border-[#DDD2FA] dark:border-[#4B3B70] shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#EAE5DA] dark:border-[#26262B]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-[#F5F1FD] dark:bg-[#2A213D] text-[#7C3AED] flex items-center justify-center font-serif text-[10px]">
                      ✦
                    </span>
                    <span className="text-xs font-bold text-[#7C3AED] dark:text-[#C4B5FD]">
                      AI Explanation
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF7F2] text-[#0F5C3E]">
                    ✓ Section 74 Indian Contract Act
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-[#171717] dark:text-[#F5F5F5] mb-1">
                      What this clause actually means:
                    </h4>
                    <p className="text-[#6B6862] dark:text-[#A1A1A8] leading-relaxed">
                      Your landlord is attempting to claim 100% of your deposit (₹50,000) automatically if you vacate early, even if you serve the required 30-day advance notice.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#171717] dark:text-[#F5F5F5] mb-1">
                      Statutory protection in India:
                    </h4>
                    <p className="text-[#6B6862] dark:text-[#A1A1A8] leading-relaxed">
                      Under Section 74 of the Indian Contract Act, 1872, automatic total deposit forfeiture without proving genuine reasonable damages is legally contestable as an unconscionable penalty.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#EBF7F2] dark:bg-[#122A1E] border border-[#BCE5D5] dark:border-[#1E4D36] text-[11px] text-[#0F5C3E] dark:text-[#34D399]">
                    <span className="font-bold block mb-0.5">What you can do next:</span>
                    <span>Propose modifying this clause to deduct only actual rent loss until a new tenant is found, capped at 1 month.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-[#EAE5DA] dark:border-[#26262B] flex items-center justify-between">
                <Link
                  href="/upload"
                  className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline flex items-center gap-1"
                >
                  Analyze your document <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-[#8C8880]">Source: Clause 14.2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. FEATURE SHOWCASE (Prompt #8 & #9) ─── */}
      <section className="py-20 md:py-28 bg-[#F7F3EC] dark:bg-[#0D0D0F] border-b border-[#DED8CD] dark:border-[#26262B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6862] dark:text-[#8C8880]">
              Modular Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#171717] dark:text-[#F5F5F5] mt-1.5">
              Everything you need to navigate the law.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6B6862] dark:text-[#A1A1A8]">
              Each module is engineered to give you clarity, reduce uncertainty, and prepare next steps with confidence.
            </p>
          </div>

          {/* 8 Feature Modules with Sophisticated Accent Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Ask Legal AI",
                desc: "Understand legal questions in simple language grounded in Indian Bare Acts.",
                href: "/chat",
                icon: Sparkles,
                accentColor: "text-[#7C3AED]",
                tag: "Violet Accent",
                badgeBg: "bg-[#F5F1FD] dark:bg-[#2A213D] text-[#7C3AED] border-[#DDD2FA]",
              },
              {
                title: "Document Intelligence",
                desc: "Extract clauses, liabilities, and unfair terms from agreements and legal notices.",
                href: "/upload",
                icon: FileText,
                accentColor: "text-[#4F46E5]",
                tag: "Indigo Accent",
                badgeBg: "bg-[#EEF0FC] dark:bg-[#1E2342] text-[#4F46E5] border-[#C7D0FA]",
              },
              {
                title: "Legal Research",
                desc: "Explore authoritative Supreme Court & High Court ratios with 10-point summaries.",
                href: "/caselaw",
                icon: Search,
                accentColor: "text-[#0F9F9A]",
                tag: "Teal Accent",
                badgeBg: "bg-[#ECF9F8] dark:bg-[#162D2C] text-[#0F9F9A] border-[#B2E7E5]",
              },
              {
                title: "Case Management",
                desc: "Organize facts, timelines, documents, and evidence in a structured workspace.",
                href: "/cases",
                icon: FolderOpen,
                accentColor: "text-[#4F46E5]",
                tag: "Indigo Accent",
                badgeBg: "bg-[#EEF0FC] dark:bg-[#1E2342] text-[#4F46E5] border-[#C7D0FA]",
              },
              {
                title: "Translation",
                desc: "Convert legal texts between English and 12 Indian regional languages with protected terms.",
                href: "/translate",
                icon: Languages,
                accentColor: "text-[#16845B]",
                tag: "Green Accent",
                badgeBg: "bg-[#EBF7F2] dark:bg-[#142A1F] text-[#16845B] border-[#BCE5D5]",
              },
              {
                title: "Document Generator",
                desc: "Draft verified rental agreements, legal notices, affidavits, and consumer claims.",
                href: "/create",
                icon: FileEdit,
                accentColor: "text-[#C98A16]",
                tag: "Amber Accent",
                badgeBg: "bg-[#FAF4E6] dark:bg-[#2C2415] text-[#C98A16] border-[#F3E3BC]",
              },
              {
                title: "Lawyer Assistance",
                desc: "Bridge directly to Bar Council verified advocates for formal review and signing.",
                href: "/lawyer-workspace",
                icon: UserCheck,
                accentColor: "text-[#16845B]",
                tag: "Emerald Accent",
                badgeBg: "bg-[#EBF7F2] dark:bg-[#142A1F] text-[#16845B] border-[#BCE5D5]",
              },
              {
                title: "Statutory Deadlines",
                desc: "Track Limitation Act windows, dispute deadlines, and eviction notice periods.",
                href: "/dashboard",
                icon: Clock,
                accentColor: "text-[#D95C55]",
                tag: "Coral Accent",
                badgeBg: "bg-[#FAEDED] dark:bg-[#2D1B1B] text-[#D95C55] border-[#F7D1CF]",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.title}
                  href={f.href}
                  className="paper-card p-6 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-9 h-9 rounded-2xl bg-[#F4F0E8] dark:bg-[#1D1D22] ${f.accentColor} flex items-center justify-center`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className="font-serif text-sm text-[#8C8880] group-hover:text-[#171717] dark:group-hover:text-white transition-colors">
                        ✦
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#171717] dark:text-[#F5F5F5] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-[#6B6862] dark:text-[#A1A1A8] mt-2 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-[#DED8CD]/60 dark:border-[#26262B] flex items-center justify-between text-xs font-semibold text-[#171717] dark:text-[#F5F5F5]">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#FBF9F5] dark:bg-[#151518] border-b border-[#DED8CD] dark:border-[#26262B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              Intuitive Workflow
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171717] dark:text-[#F5F5F5] mt-1.5">
              Three steps to complete legal clarity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload or Describe",
                desc: "Drop a contract, court notice, or police complaint — or simply describe your issue in plain English or your regional language.",
              },
              {
                step: "02",
                title: "AI Analysis & Verification",
                desc: "The engine extracts covenants, evaluates legal risks, and cross-references statutory sections with Supreme Court precedents.",
              },
              {
                step: "03",
                title: "Act With Confidence",
                desc: "Receive clear explanations, next step checklists, generated draft responses, and direct escalation to verified advocates.",
              },
            ].map((s) => (
              <div key={s.step} className="p-7 rounded-3xl bg-[#F7F3EC] dark:bg-[#111114] border border-[#DED8CD] dark:border-[#26262B] space-y-3">
                <span className="font-mono text-xs font-bold text-[#7C3AED] bg-[#F5F1FD] dark:bg-[#2A213D] px-2.5 py-1 rounded-full border border-[#DDD2FA] dark:border-[#423363]">
                  {s.step}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#171717] dark:text-[#F5F5F5] pt-1">
                  {s.title}
                </h3>
                <p className="text-xs text-[#6B6862] dark:text-[#A1A1A8] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. MULTILINGUAL INDIAN LANGUAGE EXPERIENCE (Prompt #17 & #25) ─── */}
      <section className="py-20 md:py-28 bg-[#F7F3EC] dark:bg-[#0D0D0F] border-b border-[#DED8CD] dark:border-[#26262B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16845B]">
              True Indian Inclusivity
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171717] dark:text-[#F5F5F5] mt-1.5">
              The law in your mother tongue
            </h2>
            <p className="mt-2 text-sm text-[#6B6862] dark:text-[#A1A1A8]">
              Switch effortlessly between English and Indian regional languages without losing dates, numbers, or legal meaning.
            </p>
          </div>

          {/* Language Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {indianLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => setSelectedLanguage(l.code)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedLanguage === l.code
                    ? "bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-semibold shadow-xs"
                    : "bg-[#FBF9F5] dark:bg-[#151518] text-[#6B6862] dark:text-[#A1A1A8] border border-[#DED8CD] dark:border-[#26262B] hover:border-[#171717]"
                }`}
              >
                <span className="mr-1">{l.script}</span>
                <span className="text-[10px] opacity-70">({l.name})</span>
              </button>
            ))}
          </div>

          {/* Sample Card */}
          <div className="max-w-xl mx-auto bg-[#FBF9F5] dark:bg-[#151518] rounded-3xl p-6 border border-[#DED8CD] dark:border-[#26262B] shadow-sm text-center space-y-3">
            <span className="text-[11px] font-mono text-[#16845B] uppercase font-bold tracking-wider">
              Sample Plain Legal Translation
            </span>
            <p className="font-serif text-base sm:text-lg text-[#171717] dark:text-[#F5F5F5] leading-relaxed">
              &ldquo;{indianLanguages.find((l) => l.code === selectedLanguage)?.sample}&rdquo;
            </p>
            <div className="pt-2">
              <Link
                href="/translate"
                className="text-xs font-semibold text-[#16845B] hover:underline inline-flex items-center gap-1"
              >
                Open Full Multilingual Translator →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. LOW-LITERACY & SIMPLE MODE (Prompt #18) ─── */}
      <section className="py-20 md:py-24 bg-[#FAF4E6] dark:bg-[#1C180E] border-b border-[#F3E3BC] dark:border-[#382E19]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C98A16]">
            Accessible Simple Mode
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171717] dark:text-[#F5F5F5]">
            What happened? Tell us in your own words.
          </h2>
          <p className="text-sm text-[#6B6862] dark:text-[#D4CBB8] max-w-xl mx-auto leading-relaxed">
            No legal jargon required. Speak into your microphone in any language, and Legal AI will guide you step by step.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setVoiceOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#C98A16] hover:bg-[#B37810] text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Tell Us Your Story (Voice)</span>
            </button>
            <Link
              href="/easy-help"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FBF9F5] dark:bg-[#151518] text-[#171717] dark:text-[#F5F5F5] text-sm font-semibold border border-[#DED8CD] hover:bg-[#EFE9DE] transition-all"
            >
              <span>Easy Step-by-Step Guide</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 8. TRUST, PRIVACY & STANDARDS (Prompt #12 & #31) ─── */}
      <section className="py-20 md:py-28 bg-[#FBF9F5] dark:bg-[#151518] border-b border-[#DED8CD] dark:border-[#26262B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16845B]">
              Ethical Governance
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171717] dark:text-[#F5F5F5] mt-1.5">
              Built on strict legal standards
            </h2>
            <p className="mt-2 text-sm text-[#6B6862] dark:text-[#A1A1A8]">
              We clearly distinguish verified statutes, AI explanations, and human advocate review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              {
                icon: ShieldCheck,
                badge: "✓ Official Source",
                badgeStyle: "bg-[#EBF7F2] text-[#0F5C3E] border-[#BCE5D5]",
                title: "Bare Acts & Case Law",
                desc: "Answers are tethered strictly to official Indian statutes and Supreme Court judgments.",
              },
              {
                icon: Lock,
                badge: "🔒 Private & Secure",
                badgeStyle: "bg-[#EEF0FC] text-[#3730A3] border-[#C7D0FA]",
                title: "DPDP Act 2023 Compliant",
                desc: "Your legal documents are encrypted and never used to train public models.",
              },
              {
                icon: UserCheck,
                badge: "👤 Advocate Review",
                badgeStyle: "bg-[#FAF4E6] text-[#8A5E0E] border-[#F3E3BC]",
                title: "Human Legal Escalation",
                desc: "Direct access to Bar Council verified advocates for formal legal notices and pleadings.",
              },
              {
                icon: Scale,
                badge: "⚖ Public Legal Aid",
                badgeStyle: "bg-[#FAEDED] text-[#9A3C36] border-[#F7D1CF]",
                title: "DLSA / NALSA Linkage",
                desc: "Connect directly with District Legal Services Authorities for free representation where eligible.",
              },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.title} className="p-6 rounded-3xl bg-[#F7F3EC] dark:bg-[#111114] border border-[#DED8CD] dark:border-[#26262B] space-y-3">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${t.badgeStyle}`}>
                    {t.badge}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#171717] dark:text-[#F5F5F5]">{t.title}</h3>
                  <p className="text-xs text-[#6B6862] dark:text-[#A1A1A8] leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 9. FINAL CTA (Prompt #33) ─── */}
      <section className="py-24 md:py-32 bg-[#F7F3EC] dark:bg-[#0D0D0F] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <span className="font-serif text-base text-[#7C3AED]">✦</span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#171717] dark:text-[#F5F5F5] leading-tight">
            The law is complicated. <br />
            <span className="font-sans font-semibold text-[#6B6862] dark:text-[#A1A1A8]">
              Understanding it shouldn&apos;t be.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#6B6862] dark:text-[#A1A1A8] max-w-xl mx-auto">
            Get clarity, understand your options, and take the next step with confidence.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#171717] dark:bg-[#F5F5F5] hover:bg-[#2B2B2B] dark:hover:bg-[#E5E5E5] text-[#FBF9F5] dark:text-[#171717] text-sm font-semibold shadow-md transition-all group cursor-pointer"
            >
              <span>Start with Legal AI</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FBF9F5] dark:bg-[#151518] border border-[#DED8CD] dark:border-[#26262B] hover:bg-[#EFE9DE] text-[#171717] dark:text-[#F5F5F5] text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Paperclip className="w-4 h-4 text-[#4F46E5]" />
              <span>Upload a document</span>
            </Link>
          </div>
        </div>
      </section>

      <VoiceFirstModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </div>
  );
}
