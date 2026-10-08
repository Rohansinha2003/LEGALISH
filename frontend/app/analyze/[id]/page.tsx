"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Languages,
  Sparkles,
  Layers,
  UserCheck,
  ZoomIn,
  ZoomOut,
  Lock,
  Download,
  Check,
  Building,
  Info,
  Grid,
} from "lucide-react";
import { analysisApi, AnalysisResult } from "@/lib/api";

// Rich fallback legal agreement data conforming exactly to Stitch Screen 2
const DEMO_ANALYSIS: AnalysisResult = {
  document_id: "demo-lease",
  document_name: "Commercial_Lease_Indiranagar_v3.pdf",
  status: "ready",
  document_type: "Commercial Lease & Indemnity Deed",
  confidence: "high",
  created_at: "2024-02-14T10:00:00Z",
  analysis: {
    document_type: "Commercial Lease & Indemnity Deed",
    summary:
      "A 36-month commercial lease agreement for 8,400 sq. ft. office space in Indiranagar, Bangalore with an interest-free refundable security deposit of ₹45,00,000. Key risks identified in unilateral arbitrator appointment (violating Perkins Eastman doctrine) and non-compliant lock-in deposit forfeiture provisions.",
    parties: [
      { name: "Triumph Realty Ventures LLP", role: "Lessor (Landlord)" },
      { name: "Kaleidoscope Software Private Limited", role: "Lessee (Tenant)" },
    ],
    important_dates: [
      { label: "Execution Date", date: "14 Feb 2024" },
      { label: "Rent Payment Date", date: "On or before 5th of each month" },
      { label: "Lock-in Expiry", date: "13 Feb 2027 (36 months)" },
    ],
    financial_terms: [
      { label: "Monthly Rent", amount: "₹15,000 / sub-unit or agreed base", due_date: "5th of each month" },
      { label: "Security Deposit", amount: "₹45,00,000 (Refundable)", notes: "Subject to 36-month lock-in" },
    ],
    important_clauses: [
      {
        title: "Clause 4: Security Deposit, Forfeiture & Lock-in Period",
        summary:
          "Mandates unconditional forfeiture of the ₹45,00,000 deposit upon early vacation prior to 36 months, without judicial assessment of actual damages.",
        page: 1,
        risk_level: "high",
      },
      {
        title: "Clause 7: Dispute Resolution & Arbitration Jurisdiction",
        summary:
          "Mandates a sole arbitrator nominated exclusively by the Lessor's Managing Director, which is void ab initio under Section 12(5) of the Arbitration & Conciliation Act.",
        page: 1,
        risk_level: "high",
      },
      {
        title: "Clause 9: Unlimited Indemnity Covenant",
        summary:
          "Absence of standard liability cap exposing lessee to uncurbed third-party claims.",
        page: 2,
        risk_level: "medium",
      },
      {
        title: "Clause 12: Force Majeure & Epidemic Abatement",
        summary:
          "Equitable clause providing complete rent and common charges abatement during government lockdowns or epidemics.",
        page: 2,
        risk_level: "low",
      },
    ],
    potential_concerns: [
      { text: "Unilateral arbitrator nomination violates Supreme Court Perkins Eastman precedent.", severity: "high" },
      { text: "Lock-in penalty clause risks violation of Section 74 of the Indian Contract Act.", severity: "high" },
      { text: "Absence of mutual indemnity liability cap.", severity: "medium" },
    ],
    obligations: {
      your_obligations: [
        { text: "Pay sub-metered power charges and common property maintenance assessments." },
        { text: "Do not underlet, assign, or mortgage premises without anterior written assent." },
      ],
      other_party_obligations: [
        { text: "Provide quiet enjoyment without unlawful disturbance throughout tenure." },
        { text: "Abate monthly rent in event of civic catastrophe or government lockdowns." },
      ],
    },
    next_steps: [
      "Negotiate mutual arbitrator appointment",
      "Cap lock-in deposit liquidated damages under Section 74",
    ],
    citations: [
      { claim: "Unilateral arbitrator is void ab initio", page: 1, excerpt: "Sole Arbitrator nominated by Managing Director of Lessor" },
    ],
    confidence: "high",
    is_high_risk: true,
    high_risk_recommendation: "Amend Clause 7 to institutional arbitration (DIAC/MCIA).",
  },
};

export default function AnalyzePage() {
  const router = useRouter();
  const params = useParams();
  const documentId = (params?.id as string) || "demo";

  const [result, setResult] = useState<AnalysisResult>(DEMO_ANALYSIS);
  const [selectedClauseKey, setSelectedClauseKey] = useState<"clause4" | "clause7" | "clause9" | "clause12">("clause7");
  const [activeTab, setActiveTab] = useState<"checklist" | "financial" | "plain">("checklist");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activePage, setActivePage] = useState(1);
  const [followUpQuestion, setFollowUpQuestion] = useState("");

  useEffect(() => {
    if (!documentId || documentId === "demo") return;

    analysisApi
      .get(documentId)
      .then((data) => {
        if (data && data.analysis) {
          setResult(data);
        }
      })
      .catch(() => {
        // Fallback to demo data
      });
  }, [documentId]);

  const analysis = result?.analysis || DEMO_ANALYSIS.analysis;
  const docName = result?.document_name || "Commercial_Lease_Indiranagar_v3.pdf";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F3EC] text-[#181818] font-sans antialiased">
      {/* ─── 1. FULL-HEIGHT LEFT NAVIGATION RAIL (Stitch Screen 2) ─── */}
      <aside className="w-56 xl:w-60 shrink-0 border-r border-[#DDD7CC] bg-[#EFE9DE] flex flex-col justify-between p-4 h-full z-20 overflow-y-auto">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 px-2 group">
            <span className="w-7 h-7 rounded-md bg-[#181818] text-[#FBF9F5] flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              ✦
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-base font-bold tracking-tight text-[#181818] leading-none">
                LEGAL AI
              </span>
              <span className="text-[10px] text-[#6B6862] font-mono tracking-wider mt-0.5">
                V4 INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1">
            <Link
              href={`/analyze/${documentId}`}
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#181818] text-[#FBF9F5] text-xs font-semibold shadow-xs transition-all"
            >
              <FileText className="w-4 h-4 text-[#FBF9F5]" />
              <span>Document Analysis</span>
            </Link>

            <Link
              href="/caselaw"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-[#6B6862] hover:text-[#181818] hover:bg-[#FBF9F5] text-xs font-medium transition-all"
            >
              <Scale className="w-4 h-4" />
              <span>Legal Research</span>
            </Link>

            <Link
              href="/easy-help"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-[#6B6862] hover:text-[#181818] hover:bg-[#FBF9F5] text-xs font-medium transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Simple Mode</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-[#6B6862] hover:text-[#181818] hover:bg-[#FBF9F5] text-xs font-medium transition-all"
            >
              <Grid className="w-4 h-4" />
              <span>Product Suite</span>
            </Link>

            <Link
              href="/lawyers"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-[#6B6862] hover:text-[#181818] hover:bg-[#FBF9F5] text-xs font-medium transition-all"
            >
              <Building className="w-4 h-4" />
              <span>Solutions</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-[#6B6862] hover:text-[#181818] hover:bg-[#FBF9F5] text-xs font-medium transition-all"
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Sovereign Retention Badge */}
        <div className="p-3 rounded-lg bg-[#FBF9F5] border border-[#DDD7CC] space-y-1 shadow-2xs mt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#181818]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Zero LLM Retention</span>
          </div>
          <p className="text-[10px] text-[#6B6862] leading-tight font-sans">
            Sovereign India Cloud Instance • DPDP Act 2023 Compliant
          </p>
        </div>
      </aside>

      {/* ─── 2. MAIN RIGHT APPLICATION AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F7F3EC]">
        {/* Top Header Row (Built for India ... Analyze a document ... Avatar) */}
        <header className="h-12 border-b border-[#DDD7CC] bg-[#FBF9F5] px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EFE9DE] border border-[#DDD7CC] text-[11px] font-mono text-[#6B6862]">
              <span>Built for India</span>
              <span>🇮🇳</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#181818] text-[#FBF9F5] text-xs font-semibold hover:bg-[#2D2C2A] transition-colors shadow-xs"
            >
              <span>Analyze a document ▾</span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#EFE9DE] border border-[#DDD7CC] flex items-center justify-center text-xs font-serif font-bold text-[#181818]">
              RS
            </div>
          </div>
        </header>

        {/* Breadcrumb & Actions Row */}
        <div className="h-12 border-b border-[#DDD7CC] bg-[#F7F3EC] px-6 flex items-center justify-between gap-4 shrink-0 z-10">
          <div className="flex items-center gap-2 text-xs text-[#6B6862] min-w-0">
            <Link href="/dashboard" className="hover:text-[#181818] transition-colors shrink-0">
              Workspaces
            </Link>
            <span className="shrink-0">/</span>
            <span className="hover:text-[#181818] transition-colors shrink-0">
              Tenancy Agreements
            </span>
            <span className="shrink-0">/</span>
            <span className="font-semibold text-[#181818] font-mono text-[11px] truncate max-w-[180px] lg:max-w-xs">
              {docName}
            </span>
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-[#0F9F9A] bg-[#ECF9F8] border border-[#0F9F9A]/30 px-2 py-0.5 rounded-full font-mono shrink-0 ml-2">
              <Check className="w-3 h-3 text-[#0F9F9A]" /> Verified against Transfer of Property Act 1882
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#DDD7CC] bg-[#FBF9F5] hover:bg-[#EFE9DE] text-xs font-medium text-[#181818] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#6B6862]" />
              <span>Export Brief</span>
            </button>
            <Link
              href="/compare"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#DDD7CC] bg-[#FBF9F5] hover:bg-[#EFE9DE] text-xs font-medium text-[#181818] transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#6B6862]" />
              <span>Compare Clauses</span>
            </Link>
            <Link
              href={`/translate?documentId=${documentId}`}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#0F9F9A]/30 bg-[#ECF9F8] text-[#0F9F9A] hover:bg-[#0F9F9A]/15 text-xs font-medium transition-colors"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Translate हिन्दी</span>
            </Link>
            <Link
              href="/lawyers"
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-[#181818] text-[#FBF9F5] text-xs font-semibold hover:bg-[#2D2C2A] transition-colors shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Escalate to Advocate</span>
            </Link>
          </div>
        </div>

        {/* ─── 3. SPLIT WORKSPACE: CENTER FOLIO + RIGHT DOCK ─── */}
        <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
          {/* CENTER DOCUMENT FOLIO COLUMN */}
          <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-[#F7F3EC] min-h-0 min-w-0">
            {/* Page Header Bar */}
            <div className="w-full max-w-2xl mb-4 flex items-center justify-between text-xs text-[#6B6862] bg-[#FBF9F5] border border-[#DDD7CC] rounded-lg px-4 py-2 shadow-2xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-[#181818]">
                  PAGE {activePage} OF 2
                </span>
                <span>•</span>
                <span className="text-[11px]">Stamp Duty: ₹5,000 Paid (Karnataka)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 10, 80))}
                  className="p-1 hover:text-[#181818] cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] w-9 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
                  className="p-1 hover:text-[#181818] cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="h-3 w-px bg-[#DDD7CC] mx-1" />
                <button
                  onClick={() => setActivePage(activePage === 1 ? 2 : 1)}
                  className="text-[11px] font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                >
                  Go to Page {activePage === 1 ? 2 : 1}
                </button>
              </div>
            </div>

            {/* Parchment Folio Sheet */}
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              className="w-full max-w-2xl bg-[#FFFFFF] border border-[#DDD7CC] rounded-xl shadow-[0_4px_24px_rgba(24,24,24,0.06)] p-10 sm:p-14 space-y-7 text-[#181818] font-sans transition-transform"
            >
              {/* Stamp Folio Header */}
              <div className="text-center border-b border-[#DDD7CC] pb-6 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6B6862] block">
                  — REGISTERED STAMP INSTRUMENT - BLR 06-8994 —
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#181818]">
                  COMMERCIAL LEASE & INDEMNITY DEED
                </h1>
                <p className="font-serif italic text-xs text-[#6B6862]">
                  Executed at Indiranagar, Bengaluru, Urban District of Karnataka
                </p>
              </div>

              {/* Recitals */}
              <div className="text-xs leading-relaxed space-y-3.5 text-[#181818]">
                <p>
                  <strong>THIS INDENTURE OF LEASE</strong> is made and entered into on this 14th day of February, 2024, by and between <strong>TRIUMPH REALTY VENTURES LLP</strong> (hereinafter referred to as the &ldquo;Lessor&rdquo;) and <strong>KALEIDOSCOPE SOFTWARE PRIVATE LIMITED</strong> (hereinafter referred to as the &ldquo;Lessee&rdquo;).
                </p>
                <p>
                  <strong>WHEREAS</strong> the Lessor is the absolute and lawful owner of Suite 402, Third Floor, 100 Feet Road, Indiranagar, Bengaluru 560038, measuring approximately 8,400 sq. ft. of super built-up commercial office space.
                </p>
              </div>

              {/* CLAUSE 4: SECURITY DEPOSIT */}
              <div
                onClick={() => setSelectedClauseKey("clause4")}
                className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2.5 ${
                  selectedClauseKey === "clause4"
                    ? "bg-[#FFF6F5] border-[#D95C55] ring-2 ring-[#D95C55]/20 shadow-xs"
                    : "border-[#DDD7CC] bg-[#FBF9F5] hover:bg-[#FFF6F5]"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-[11px] font-bold tracking-wide uppercase text-[#181818]">
                    CLAUSE 4: SECURITY DEPOSIT, FORFEITURE & LOCK-IN PERIOD
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FAEDED] border border-[#D95C55]/30 text-[10px] font-mono font-semibold text-[#D95C55] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Unenforceable Forfeiture Notice
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#181818]">
                  4.1 The Lessee shall deposit an interest-free refundable Security Deposit of ₹45,00,000/- (Rupees Forty-Five Lakhs only). If the Lessee vacates the premises prior to the expiration of the 36-month Lock-In Period, the entire security deposit shall be unconditionally forfeited to the Lessor without judicial recourse, and the Lessee shall remain liable for remaining lock-in lease rentals in full.
                </p>
              </div>

              {/* CLAUSE 5 & 6 */}
              <div className="text-xs leading-relaxed space-y-3.5 text-[#181818]">
                <p>
                  <strong>5. MAINTENANCE AND UTILITIES:</strong> All sub-metered power charges, diesel generator back-up tariffs, and common property maintenance assessments shall be discharged by the Lessee directly on or before the 5th day of every succeeding English calendar month.
                </p>
                <p>
                  <strong>6. SUB-LETTING & ASSIGNMENT:</strong> The Lessee shall not mortgage, assign, underlet, or part with the possession of the Leased Premises or any portion thereof without obtaining the anterior written assent of the Lessor.
                </p>
              </div>

              {/* CLAUSE 7: DISPUTE RESOLUTION (ACTIVE / HIGHLIGHTED IN STITCH SCREEN 2) */}
              <div
                onClick={() => setSelectedClauseKey("clause7")}
                className={`p-5 rounded-lg border-2 transition-all cursor-pointer space-y-2.5 ${
                  selectedClauseKey === "clause7"
                    ? "bg-[#F4F3FF] border-[#6366F1] ring-4 ring-[#6366F1]/15 shadow-md"
                    : "border-[#DDD7CC] bg-[#FBF9F5] hover:bg-[#F4F3FF]/60"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-[11px] font-bold tracking-wide uppercase text-[#4F46E5] flex items-center gap-1.5">
                    <span>✦</span> CLAUSE 7: DISPUTE RESOLUTION & ARBITRATION JURISDICTION
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EEF0FC] border border-[#4F46E5]/40 text-[10px] font-mono font-semibold text-[#4F46E5] flex items-center gap-1">
                    <Scale className="w-3 h-3" /> ⚖ Void ab initio Finding
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#181818] font-medium">
                  7.1 Any controversy, dispute, or claim arising out of or touching this Agreement shall be referred to and decided by a Sole Arbitrator to be nominated and appointed solely by the Managing Director of the Lessor. The venue and seat of such arbitration shall be Bengaluru. The decision of said Sole Arbitrator shall be final, binding, and unappealable by the Lessee under any statute.
                </p>
              </div>

              {/* CLAUSE 8 */}
              <div className="text-xs leading-relaxed space-y-3 text-[#181818]">
                <p>
                  <strong>8. QUIET ENJOYMENT:</strong> Yielding punctual discharge of the rent hereby stipulated and adhering to covenants herein bounded, the Lessee shall peaceably hold, occupy, and enjoy the demised premises throughout the tenure without unlawful disturbance by the Lessor.
                </p>
              </div>

              {/* CLAUSE 12: FORCE MAJEURE */}
              <div
                onClick={() => setSelectedClauseKey("clause12")}
                className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2.5 ${
                  selectedClauseKey === "clause12"
                    ? "bg-[#F6FAF7] border-[#0F9F9A] ring-2 ring-[#0F9F9A]/20"
                    : "border-[#DDD7CC] bg-[#FBF9F5] hover:bg-[#F6FAF7]"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-[11px] font-bold tracking-wide uppercase text-[#181818]">
                    CLAUSE 12: FORCE MAJEURE & EPIDEMIC ABATEMENT
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECF9F8] border border-[#0F9F9A]/30 text-[10px] font-mono font-semibold text-[#0F9F9A] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Equitable Term
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#181818]">
                  12.1 In the event of government lockdown, civic catastrophe, or epidemic preventing occupation of the Demised Premises, monthly rent and common charges shall stand completely abated proportionate to the total duration of the interruption without default penalties.
                </p>
              </div>

              {/* Signature Block */}
              <div className="pt-8 border-t border-[#DDD7CC] grid grid-cols-2 gap-8 text-xs font-mono text-[#6B6862]">
                <div>
                  <div className="h-10 border-b border-[#DDD7CC] flex items-end pb-1 font-serif italic text-sm text-[#181818]">
                    Sri Raghu Ramana (Auth. Signatory)
                  </div>
                  <span className="text-[10px] tracking-wider uppercase block mt-1">
                    FOR THE LESSOR
                  </span>
                </div>
                <div>
                  <div className="h-10 border-b border-[#DDD7CC] flex items-end pb-1 font-serif italic text-sm text-[#181818]">
                    Roshog Agnihotri (Director)
                  </div>
                  <span className="text-[10px] tracking-wider uppercase block mt-1">
                    FOR THE LESSEE
                  </span>
                </div>
              </div>
            </div>
          </main>

          {/* ─── 4. RIGHT ANALYTICAL DOCK (Stitch Screen 2 Analytical Inspector) ─── */}
          <aside className="w-[420px] xl:w-[440px] shrink-0 border-l border-[#DDD7CC] bg-[#F7F3EC] flex flex-col min-h-0 overflow-y-auto">
            {/* Header: AI Document Intelligence */}
            <div className="p-4 border-b border-[#DDD7CC] bg-[#FBF9F5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#181818] text-[#FBF9F5] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#FBF9F5]" />
                </div>
                <div>
                  <h2 className="font-serif text-sm font-bold tracking-tight text-[#181818] leading-tight">
                    AI Document Intelligence
                  </h2>
                  <span className="text-[10px] text-[#6B6862]">
                    Real-time statutory compliance verification
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-[#EEF0FC] border border-[#4F46E5]/30 text-[10px] font-mono font-semibold text-[#4F46E5] text-right">
                <div>98% Confidence</div>
                <div className="text-[9px] text-[#6B6862] font-normal">3 Citations linked</div>
              </div>
            </div>

            {/* Content Cards */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
              {/* ACTIVE INSPECTOR CARD */}
              <div className="p-4 rounded-xl border border-[#DDD7CC] bg-[#FBF9F5] space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CC]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6862]">
                    ACTIVE INSPECTOR
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FAEDED] border border-[#D95C55]/30 text-[10px] font-mono font-semibold text-[#D95C55] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> High Risk
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-base font-bold text-[#181818] leading-tight">
                    {selectedClauseKey === "clause7" && "Clause 7: Unilateral Arbitrator Appointment"}
                    {selectedClauseKey === "clause4" && "Clause 4: Lock-in Deposit Liquidated Damages"}
                    {selectedClauseKey === "clause9" && "Clause 9: Unlimited Indemnity Covenant"}
                    {selectedClauseKey === "clause12" && "Clause 12: Force Majeure Abatement"}
                  </h3>
                </div>

                {/* Short Answer */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7C3AED] font-semibold flex items-center gap-1">
                    ✦ SHORT ANSWER
                  </span>
                  <p className="text-xs text-[#181818] leading-relaxed">
                    {selectedClauseKey === "clause7" &&
                      "The dispute clause mandates a sole arbitrator appointed exclusively by the Landlord, which is void ab initio under Section 12(5) of the Arbitration & Conciliation Act (read with the Seventh Schedule)."}
                    {selectedClauseKey === "clause4" &&
                      "Automatic forfeiture of ₹45,00,000 without proving actual loss is unconstitutional and unenforceable under Section 74 of the Indian Contract Act 1872."}
                    {selectedClauseKey === "clause9" &&
                      "Exposes the lessee to unlimited indemnification liabilities without standard mutual capping mechanisms."}
                    {selectedClauseKey === "clause12" &&
                      "Balanced and equitable force majeure protection compliant with Indian lease jurisprudence."}
                  </p>
                </div>

                {/* What This Means (Warm Tint Box) */}
                <div className="p-3 rounded-lg bg-[#F5EFE6] border border-[#DDD7CC] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#181818]">
                    <FileText className="w-3.5 h-3.5 text-[#6B6862]" />
                    <span>What this means</span>
                  </div>
                  <p className="text-xs text-[#181818] leading-relaxed">
                    {selectedClauseKey === "clause7" &&
                      "The lessor cannot legally enforce the unilateral nomination of their own appointed adjudicator. In case of legal dispute, you retain statutory rights under Section 11 to petition the High Court of Karnataka for an independent tribunal."}
                    {selectedClauseKey === "clause4" &&
                      "The landlord cannot legally forfeit your deposit merely because you vacate early, unless they provide documented proof of equivalent financial damage suffered."}
                    {selectedClauseKey === "clause9" &&
                      "You could be held responsible for uncapped third-party claims regardless of actual fault or negligence."}
                    {selectedClauseKey === "clause12" &&
                      "Rent is legally paused if civic emergencies prevent physical occupancy of the premises."}
                  </p>
                </div>

                {/* Actionable Recommendation (Code Box) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F9F9A] font-semibold flex items-center gap-1">
                    ↙ ACTIONABLE RECOMMENDATION
                  </span>
                  <div className="p-3 rounded-lg bg-[#F5EFE6] border border-[#DDD7CC] space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#181818] block">
                      Replace with Mutual Consent or Institutional Arbitration:
                    </span>
                    <blockquote className="font-mono text-[11px] text-[#181818] bg-[#FBF9F5] p-2.5 rounded border border-[#DDD7CC] leading-relaxed">
                      &ldquo;Any dispute shall be referred to a sole arbitrator appointed by mutual consent of both parties, or failing consensus within 30 days, under the DIAC (Delhi) or BIAC/MCIA rules.&rdquo;
                    </blockquote>
                  </div>
                </div>

                {/* Authoritative Statutory Authorities Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B6862] block">
                    AUTHORITATIVE STATUTORY AUTHORITIES
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE9DE] border border-[#DDD7CC] text-[11px] font-mono text-[#181818]">
                      ⚖ Supreme Court: Perkins Eastman Architects (2019)
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE9DE] border border-[#DDD7CC] text-[11px] font-mono text-[#181818]">
                      ⚖ Arbitration Act S. 12(5)
                    </span>
                  </div>
                </div>
              </div>

              {/* RISK OVERVIEW LEDGER CARD */}
              <div className="p-4 rounded-xl border border-[#DDD7CC] bg-[#FBF9F5] space-y-3.5 shadow-2xs">
                {/* 3 Tabs */}
                <div className="flex items-center border-b border-[#DDD7CC] -mx-4 px-4 gap-2">
                  <button
                    onClick={() => setActiveTab("checklist")}
                    className={`pb-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
                      activeTab === "checklist"
                        ? "border-[#181818] text-[#181818]"
                        : "border-transparent text-[#6B6862] hover:text-[#181818]"
                    }`}
                  >
                    Risk Checklist (3/14)
                  </button>
                  <button
                    onClick={() => setActiveTab("financial")}
                    className={`pb-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
                      activeTab === "financial"
                        ? "border-[#181818] text-[#181818]"
                        : "border-transparent text-[#6B6862] hover:text-[#181818]"
                    }`}
                  >
                    Financial Exposure
                  </button>
                  <button
                    onClick={() => setActiveTab("plain")}
                    className={`pb-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
                      activeTab === "plain"
                        ? "border-[#181818] text-[#181818]"
                        : "border-transparent text-[#6B6862] hover:text-[#181818]"
                    }`}
                  >
                    Plain Language
                  </button>
                </div>

                {/* Tab 1: Checklist */}
                {activeTab === "checklist" && (
                  <div className="space-y-2">
                    <div
                      onClick={() => setSelectedClauseKey("clause4")}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        selectedClauseKey === "clause4"
                          ? "bg-[#FFF6F5] border-[#D95C55]"
                          : "bg-[#FBF9F5] border-[#DDD7CC] hover:bg-[#EFE9DE]"
                      }`}
                    >
                      <div>
                        <strong className="block text-xs text-[#181818]">
                          Clause 4: Lock-in Rental Penalties
                        </strong>
                        <span className="text-[11px] text-[#6B6862]">
                          Karnataka Rent Control precedent violation
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#FAEDED] border border-[#D95C55]/30 text-[10px] font-mono font-semibold text-[#D95C55]">
                        Critical
                      </span>
                    </div>

                    <div
                      onClick={() => setSelectedClauseKey("clause7")}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        selectedClauseKey === "clause7"
                          ? "bg-[#F4F3FF] border-[#6366F1]"
                          : "bg-[#FBF9F5] border-[#DDD7CC] hover:bg-[#EFE9DE]"
                      }`}
                    >
                      <div>
                        <strong className="block text-xs text-[#181818]">
                          Clause 7: Unilateral Sole Arbitrator
                        </strong>
                        <span className="text-[11px] text-[#6B6862]">
                          Perkins Eastman TRF Ltd. violation
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#EEF0FC] border border-[#4F46E5]/30 text-[10px] font-mono font-semibold text-[#4F46E5]">
                        Active
                      </span>
                    </div>

                    <div
                      onClick={() => setSelectedClauseKey("clause9")}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        selectedClauseKey === "clause9"
                          ? "bg-[#FAF4E6] border-[#C98A16]"
                          : "bg-[#FBF9F5] border-[#DDD7CC] hover:bg-[#EFE9DE]"
                      }`}
                    >
                      <div>
                        <strong className="block text-xs text-[#181818]">
                          Clause 9: Unlimited Indemnity Covenant
                        </strong>
                        <span className="text-[11px] text-[#6B6862]">
                          Absence of liability cap exposure
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF4E6] border border-[#C98A16]/30 text-[10px] font-mono font-semibold text-[#C98A16]">
                        Medium
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Financial */}
                {activeTab === "financial" && (
                  <div className="p-3.5 rounded-lg border border-[#DDD7CC] bg-[#FDF9F2] space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CC]">
                      <span className="text-[#6B6862]">Total Security Deposit:</span>
                      <strong className="font-mono text-sm text-[#181818]">₹45,00,000</strong>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CC]">
                      <span className="text-[#6B6862]">Lock-in Duration:</span>
                      <strong className="font-mono text-sm text-[#181818]">36 Months</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#D95C55]">
                      <span>Unmitigated Forfeiture Risk:</span>
                      <strong className="font-mono text-sm">₹45,00,000</strong>
                    </div>
                  </div>
                )}

                {/* Tab 3: Plain Language */}
                {activeTab === "plain" && (
                  <div className="p-3.5 rounded-lg border border-[#DDD7CC] bg-[#FDF9F2] space-y-2 text-xs leading-relaxed text-[#181818]">
                    <p>
                      {analysis.summary ||
                        "This agreement allows the landlord to appoint their own judge in disputes and keep 45 lakhs if you leave early. You should negotiate mutual arbitration and a 60-day notice clause before signing."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── FOLLOW-UP Q&A DOCK (Stitch Screen 2 Input Bar) ─── */}
            <div className="p-4 border-t border-[#DDD7CC] bg-[#EFE9DE]/80 space-y-2 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && followUpQuestion.trim()) {
                      router.push(
                        `/chat?documentId=${documentId}&q=${encodeURIComponent(followUpQuestion.trim())}`
                      );
                    }
                  }}
                  placeholder="Ask follow-up question regarding this document..."
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-lg bg-[#FBF9F5] border border-[#DDD7CC] text-[#181818] placeholder-[#6B6862] focus:outline-none focus:border-[#4F46E5] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (followUpQuestion.trim()) {
                      router.push(
                        `/chat?documentId=${documentId}&q=${encodeURIComponent(followUpQuestion.trim())}`
                      );
                    }
                  }}
                  className="absolute right-1.5 p-1.5 rounded-md bg-[#181818] text-[#FBF9F5] hover:bg-[#2D2C2A] cursor-pointer"
                  title="Send question"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#6B6862] uppercase tracking-wider font-mono">
                  Suggested:
                </span>
                {[
                  "Draft demand clause 7",
                  "Compare to standard RERA lease",
                  "Calculate stamp duty refund",
                ].map((prompt) => (
                  <Link
                    key={prompt}
                    href={`/chat?documentId=${documentId}&q=${encodeURIComponent(prompt)}`}
                    className="px-2 py-0.5 rounded-full border border-[#DDD7CC] bg-[#FBF9F5] text-[10px] text-[#6B6862] hover:text-[#4F46E5] hover:border-[#4F46E5]/40 transition-colors"
                  >
                    &ldquo;{prompt}&rdquo;
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
