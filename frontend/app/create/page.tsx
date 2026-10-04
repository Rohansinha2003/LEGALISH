"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  FileText,
  CheckCircle2,
  Download,
  Copy,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  FilePlus2,
  RefreshCw,
  Building,
  UserCheck,
  FileSignature,
  FileSpreadsheet,
} from "lucide-react";
import { generateApi, DocumentType, GeneratedDocumentResult } from "@/lib/api";
import toast from "react-hot-toast";

// Section 34 Document Templates
const DOCUMENT_OPTIONS = [
  {
    id: "rental_agreement",
    name: "Rental Agreement",
    category: "Tenancy",
    desc: "11-month residential lease with deposit protection, maintenance terms, and notice period.",
    icon: Building,
  },
  {
    id: "employment_agreement",
    name: "Employment Agreement",
    category: "Workplace",
    desc: "Employment contract outlining probation, confidentiality, duties, and IP ownership.",
    icon: UserCheck,
  },
  {
    id: "legal_notice",
    name: "Legal Notice",
    category: "Dispute",
    desc: "Formal statutory demand notice for outstanding debt, deposit refund, or contract breach.",
    icon: Scale,
  },
  {
    id: "affidavit",
    name: "Affidavit",
    category: "Notarial",
    desc: "Sworn legal declaration under oath for name change, address proof, or bank records.",
    icon: FileSignature,
  },
  {
    id: "declaration",
    name: "Declaration",
    category: "Official",
    desc: "Formal factual statement of truth for public authorities or corporate compliance.",
    icon: FileText,
  },
  {
    id: "complaint",
    name: "Complaint",
    category: "Consumer / Police",
    desc: "Written grievance for consumer forum, cyber cell, or housing society management.",
    icon: AlertTriangle,
  },
  {
    id: "application",
    name: "Application",
    category: "Administrative",
    desc: "Formal request to government department, court registry, or municipal body.",
    icon: FileSpreadsheet,
  },
  {
    id: "authorization_letter",
    name: "Authorization Letter",
    category: "Representation",
    desc: "Delegation letter authorizing a representative to collect documents or act on your behalf.",
    icon: UserCheck,
  },
  {
    id: "custom_document",
    name: "Custom Document",
    category: "Specialized",
    desc: "Describe your specific circumstances to draft a tailored bilateral legal instrument.",
    icon: FilePlus2,
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

// Section 36 AI Drafting Stages
const DRAFTING_STAGES = [
  "Understanding your requirements",
  "Checking required information",
  "Preparing clauses",
  "Checking consistency",
  "Preparing draft",
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
    setStep(6); // Step 6: AI Draft
    setDraftingStageIdx(0);

    const timer = setInterval(() => {
      setDraftingStageIdx((prev) => {
        if (prev < DRAFTING_STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          // Generate sample draft content
          const generated = `RESIDENTIAL RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made and executed on this 5th day of October, 2026, between:

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
          setStep(7); // Move to review & edit
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
                Legal Document Generator
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ─── STEP 1: WHAT DO YOU WANT TO CREATE? (Section 34) ─── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                Step 1 of 8
              </span>
              <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] mt-1">
                What do you want to create?
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                Select a standard Indian legal instrument. Our wizard guides you through required clauses and statutory standards.
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs"
                        : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--surface-secondary)] text-[var(--primary)] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded">
                          {doc.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-xs text-[var(--text-primary)]">{doc.name}</h3>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                        {doc.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                      <span className={isSelected ? "font-bold text-[var(--primary)]" : "text-[var(--text-muted)]"}>
                        {isSelected ? "Selected" : "Select"}
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
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
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
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
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
                className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] flex items-center gap-1.5"
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
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
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
                className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] flex items-center gap-1.5"
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
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
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
                className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] flex items-center gap-1.5"
              >
                <span>Review Clauses</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 5: SECTION 37 CLAUSE REVIEW UI ─── */}
        {step === 5 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
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
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
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
                    <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
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
                className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Generate AI Draft</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 6: SECTION 36 AI DRAFTING STAGES ─── */}
        {step === 6 && (
          <div className="max-w-md mx-auto p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-6 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center mx-auto animate-spin">
              <Scale className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                Drafting your legal document
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Applying Indian civil contract rules and standard phrasing.
              </p>
            </div>

            <div className="space-y-2 text-left pt-2">
              {DRAFTING_STAGES.map((stg, i) => {
                const isDone = i < draftingStageIdx;
                const isCurrent = i === draftingStageIdx;
                return (
                  <div
                    key={stg}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                      isCurrent
                        ? "text-[var(--primary)] font-bold bg-[var(--primary-subtle)]"
                        : isDone
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-[var(--text-muted)] opacity-50"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full border border-slate-400 shrink-0" />
                    )}
                    <span>{stg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── STEP 7 & 8: DOCUMENT EDITOR & EXPORT (Section 38) ─── */}
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
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Document Editor Area */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                rows={18}
                className="w-full bg-transparent font-mono text-xs leading-relaxed text-[var(--text-primary)] focus:outline-hidden resize-y"
              />
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-xs text-[var(--text-secondary)] space-y-1">
              <strong className="text-[var(--text-primary)] block">Informational Draft Standard:</strong>
              <p className="text-[11px] leading-relaxed">
                This document is generated based on standard statutory drafting guidelines. It does not constitute a universally registered legal deed until executed on proper stamp paper with requisite attestation and registration under state stamp laws.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
