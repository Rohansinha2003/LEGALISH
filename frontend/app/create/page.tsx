"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  Download,
  Copy,
  Sparkles,
  AlertTriangle,
  Info,
  FilePlus2,
  Building,
  UserCheck,
  FileSignature,
  FileSpreadsheet,
  Edit3,
  Languages,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

// Section 26 Document Cards with individual vibrant accents
const DOCUMENT_OPTIONS = [
  {
    id: "rental_agreement",
    name: "Rental Agreement",
    category: "Tenancy",
    desc: "11-month residential lease with deposit protection, maintenance terms, and notice period.",
    icon: Building,
    color: "from-indigo-500/15 via-blue-500/5 to-transparent text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "legal_notice",
    name: "Legal Notice",
    category: "Dispute",
    desc: "Formal statutory demand notice for debt recovery, deposit refund, or contract breach.",
    icon: Scale,
    color: "from-purple-500/15 via-pink-500/5 to-transparent text-purple-600 dark:text-purple-400 border-purple-500/25",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    id: "employment_agreement",
    name: "Employment Agreement",
    category: "Workplace",
    desc: "Employment contract outlining probation, confidentiality, duties, and IP ownership.",
    icon: UserCheck,
    color: "from-sky-500/15 via-cyan-500/5 to-transparent text-sky-600 dark:text-sky-400 border-sky-500/25",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    id: "affidavit",
    name: "Affidavit",
    category: "Notarial",
    desc: "Sworn legal declaration under oath for name change, address proof, or bank records.",
    icon: FileSignature,
    color: "from-amber-500/15 via-orange-500/5 to-transparent text-amber-600 dark:text-amber-400 border-amber-500/25",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "declaration",
    name: "Declaration",
    category: "Official",
    desc: "Formal factual statement of truth for public authorities or corporate compliance.",
    icon: FileText,
    color: "from-teal-500/15 via-emerald-500/5 to-transparent text-teal-600 dark:text-teal-400 border-teal-500/25",
    iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
  {
    id: "application",
    name: "Application",
    category: "Administrative",
    desc: "Formal petition to government department, court registry, or municipal body.",
    icon: FileSpreadsheet,
    color: "from-cyan-500/15 via-sky-500/5 to-transparent text-cyan-600 dark:text-cyan-400 border-cyan-500/25",
    iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "custom_document",
    name: "Custom Document",
    category: "Specialized",
    desc: "Describe your specific circumstances to draft a tailored bilateral legal instrument.",
    icon: FilePlus2,
    color: "from-pink-500/15 via-purple-500/5 to-transparent text-pink-600 dark:text-pink-400 border-pink-500/25",
    iconBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
];

// Section 37 Sample Clause Review Items
const CLAUSE_REVIEW_ITEMS = [
  {
    title: "Parties and Recitals",
    level: "Required",
    desc: "Names, addresses, and identities of both parties establishing capacity to contract.",
    reason: "Mandatory under Section 10 of the Indian Contract Act for mutual enforceability.",
  },
  {
    title: "Consideration & Payment Terms",
    level: "Required",
    desc: "Exact currency amounts, due dates, bank transfer modes, and penalty interest terms.",
    reason: "Establishes lawful consideration and eliminates ambiguity regarding default.",
  },
  {
    title: "Termination & Notice Period",
    level: "Recommended",
    desc: "Defines minimum calendar days notice (e.g. 30 days) and lock-in period obligations.",
    reason: "Prevents immediate unilateral cancellation and mitigates statutory dispute exposure.",
  },
  {
    title: "Dispute Resolution & Jurisdiction",
    level: "Optional",
    desc: "Designates arbitration or the specific city courts having exclusive civil jurisdiction.",
    reason: "Ensures legal proceedings occur in your local territorial jurisdiction.",
  },
];

// Section 27 Building Stages
const DRAFTING_STAGES = [
  "Understanding your requirements",
  "Checking required details",
  "Preparing clauses",
  "Reviewing consistency",
  "Preparing final draft",
];

export default function CreatePage() {
  const [step, setStep] = useState<number>(1);
  const [selectedDocId, setSelectedDocId] = useState<string>("rental_agreement");
  const [partyA, setPartyA] = useState("Rahul Sharma (First Party / Lessor)");
  const [partyB, setPartyB] = useState("Amit Verma (Second Party / Lessee)");
  const [details, setDetails] = useState("Flat 402, Green Glen Layout, Bellandur, Bangalore. Monthly rent: ₹25,000. Security deposit: ₹75,000.");
  const [draftingStageIdx, setDraftingStageIdx] = useState(0);
  const [draftContent, setDraftContent] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedDoc = DOCUMENT_OPTIONS.find((d) => d.id === selectedDocId) || DOCUMENT_OPTIONS[0];

  const handleStartDrafting = () => {
    setStep(6);
    setDraftingStageIdx(0);

    const timer = setInterval(() => {
      setDraftingStageIdx((prev) => {
        if (prev < DRAFTING_STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          const generated = `RESIDENTIAL RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made and executed on this 6th day of October, 2026, between:

PARTY OF THE FIRST PART (LESSOR):
${partyA}

AND

PARTY OF THE SECOND PART (LESSEE):
${partyB}

WHEREAS the Lessor is the absolute owner of the premises situated at:
${details}

NOW THIS AGREEMENT WITNESSETH AND IT IS HEREBY MUTUALLY AGREED AS FOLLOWS:

1. DURATION:
The tenancy shall be for a duration of 11 (Eleven) calendar months commencing from the date of execution.

2. RENT AND CHARGES:
The Lessee agrees to pay regular monthly rental in advance on or before the 5th day of each calendar month. Electricity and water charges shall be paid directly based on actual meter consumption.

3. SECURITY DEPOSIT:
The Lessee has deposited an interest-free refundable security deposit. The said deposit shall be returned to the Lessee by the Lessor upon peaceful and vacant handover, deducting legitimate dues if any.

4. NOTICE PERIOD:
Either party may terminate this agreement prior to expiry by tendering 30 (thirty) days written notice.

5. JURISDICTION:
This agreement shall be governed by the laws of India and subject to the jurisdiction of the competent civil courts.

IN WITNESS WHEREOF the parties have set their respective hands in presence of witnesses.

____________________                      ____________________
LESSOR (First Party)                      LESSEE (Second Party)`;

          setDraftContent(generated);
          setStep(7);
          return prev;
        }
      });
    }, 700);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftContent);
    setCopied(true);
    toast.success("Draft copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiAction = (action: string) => {
    toast.success(`AI ${action} applied to draft`);
    if (action === "Simplify") {
      setDraftContent((prev) => prev.replace(/NOW THIS AGREEMENT WITNESSETH AND IT IS HEREBY MUTUALLY AGREED AS FOLLOWS:/g, "TERMS AGREED:"));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* ─── HEADER ─── */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-serif text-sm font-bold text-[var(--text-primary)]">
                Create a legal document
              </h1>
              <p className="text-[11px] text-[var(--text-muted)]">
                Step {step} of 8 • {selectedDoc.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Draft Progress: {Math.round((step / 8) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ─── STEP 1: WHAT DO YOU WANT TO CREATE? (Section 26) ─── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Step 1 of 8
              </span>
              <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] mt-1">
                Create a legal document
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                Tell us what you need. We&apos;ll help structure it with compliant clauses.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {DOCUMENT_OPTIONS.map((doc) => {
                const Icon = doc.icon;
                const isSelected = selectedDocId === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between bg-gradient-to-br ${doc.color} ${
                      isSelected
                        ? "shadow-md ring-2 ring-purple-500/50"
                        : "hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 rounded-xl ${doc.iconBg} flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
                          {doc.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-xs text-[var(--text-primary)]">{doc.name}</h3>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                        {doc.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[var(--border)]/40 flex items-center justify-between text-[11px]">
                      <span className={isSelected ? "font-bold text-purple-600 dark:text-purple-400" : "text-[var(--text-muted)]"}>
                        {isSelected ? "Selected ✓" : "Select"}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: TELL US WHAT YOU NEED ─── */}
        {step === 2 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Step 2 of 8
              </span>
              <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)] mt-1">
                Tell us what you need
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Describe the key purpose and background for this {selectedDoc.name}.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Primary Objective
                </label>
                <input
                  type="text"
                  defaultValue="Draft a standard 11-month residential rental contract with clear deposit refund terms"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Applicable State / Jurisdiction in India
                </label>
                <select className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] focus:outline-hidden">
                  <option>Karnataka (Bengaluru)</option>
                  <option>Maharashtra (Mumbai / Pune)</option>
                  <option>Delhi NCT</option>
                  <option>Tamil Nadu (Chennai)</option>
                  <option>Telangana (Hyderabad)</option>
                  <option>West Bengal (Kolkata)</option>
                  <option>Other State</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:shadow-md flex items-center gap-1.5"
              >
                <span>Add Parties</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: ADD PARTIES ─── */}
        {step === 3 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Step 3 of 8
              </span>
              <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)] mt-1">
                Add parties
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Enter the names and legal capacities of the individuals or entities involved.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  First Party (e.g. Landlord / Employer / Issuer)
                </label>
                <input
                  type="text"
                  value={partyA}
                  onChange={(e) => setPartyA(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Second Party (e.g. Tenant / Employee / Recipient)
                </label>
                <input
                  type="text"
                  value={partyB}
                  onChange={(e) => setPartyB(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:shadow-md flex items-center gap-1.5"
              >
                <span>Add Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: ADD IMPORTANT DETAILS ─── */}
        {step === 4 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Step 4 of 8
              </span>
              <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)] mt-1">
                Add important details
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Specify premises description, amounts, timelines, and payment dates.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Key Terms & Financial Amounts
                </label>
                <textarea
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:shadow-md flex items-center gap-1.5"
              >
                <span>Review Clauses</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 5: CLAUSE REVIEW UI ─── */}
        {step === 5 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Step 5 of 8
              </span>
              <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)] mt-1">
                Review standard clauses
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Every important clause indicates its legal necessity and reason for inclusion.
              </p>
            </div>

            <div className="space-y-3">
              {CLAUSE_REVIEW_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">{item.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.level === "Required"
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                          : item.level === "Recommended"
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                          : "bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]"
                      }`}
                    >
                      {item.level}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>

                  <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Why is this included?</strong> {item.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
              >
                Back
              </button>
              <button
                onClick={handleStartDrafting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white text-xs font-semibold hover:shadow-md flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-pink-200" />
                <span>Generate AI Draft</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 6: SECTION 27 BUILDING YOUR DOCUMENT ─── */}
        {step === 6 && (
          <div className="max-w-md mx-auto p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-6 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                ✨ Building your document
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Applying Indian civil contract rules and standard phrasing.
              </p>
            </div>

            <div className="space-y-2.5 text-left pt-2">
              {DRAFTING_STAGES.map((stg, i) => {
                const isDone = i < draftingStageIdx;
                const isCurrent = i === draftingStageIdx;
                return (
                  <div
                    key={stg}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-colors ${
                      isCurrent
                        ? "text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/40"
                        : isDone
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-[var(--text-muted)] opacity-50"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping shrink-0" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-400 shrink-0" />
                    )}
                    <span>{stg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── STEP 7 & 8: SECTION 28 DOCUMENT EDITOR WITH AI ACTIONS ─── */}
        {step >= 7 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Draft Generated
                </span>
                <h2 className="font-serif text-xl font-bold text-[var(--text-primary)] mt-0.5">
                  Review & Finalize Document
                </h2>
              </div>

              {/* Editor action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([draftContent], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selectedDocId}_draft.txt`;
                    a.click();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:shadow-md transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Split Editor + AI Assistant (Section 28) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Center Document (3 Cols) */}
              <div className="lg:col-span-3 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={20}
                  className="w-full bg-transparent font-mono text-xs leading-relaxed text-[var(--text-primary)] focus:outline-hidden resize-y"
                />
              </div>

              {/* Right: AI Assistant Actions (Section 28) */}
              <div className="p-4 rounded-2xl border border-purple-500/25 bg-gradient-to-b from-purple-500/5 to-transparent space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 pb-2 border-b border-[var(--border)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Assistant</span>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Improve phrasing", action: "Improve" },
                    { label: "Simplify language", action: "Simplify" },
                    { label: "Explain clauses", action: "Explain" },
                    { label: "Translate draft", action: "Translate" },
                    { label: "Compliance review", action: "Review" },
                  ].map((btn) => (
                    <button
                      key={btn.action}
                      onClick={() => handleAiAction(btn.action)}
                      className="w-full text-left p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-medium text-[var(--text-primary)] transition-all flex items-center justify-between"
                    >
                      <span>✨ {btn.label}</span>
                      <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Informational Standard */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-xs text-[var(--text-secondary)] space-y-1">
              <strong className="text-[var(--text-primary)] block">Standard Drafting Note:</strong>
              <p className="text-[11px] leading-relaxed">
                This document draft is generated for legal awareness and structure. To achieve statutory enforceability for high-stakes matters, execute on valid state stamp paper with required witness attestations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
