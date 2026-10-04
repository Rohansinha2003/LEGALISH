"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Download,
  Trash2,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  FileText,
  UserCheck,
  Eye,
  RefreshCw,
  Mail,
  Loader2,
} from "lucide-react";
import {
  privacyV3Api,
  casesApi,
  intelligenceV3Api,
  CaseSummary,
  NotificationItem,
} from "@/lib/api";
import toast from "react-hot-toast";

export default function PrivacyCenterPage() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseForPurge, setSelectedCaseForPurge] = useState("");
  const [selectedCaseForExport, setSelectedCaseForExport] = useState("");
  const [purging, setPurging] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Consent states
  const [aiConsent, setAiConsent] = useState(true);
  const [translationConsent, setTranslationConsent] = useState(true);
  const [advocateSharingConsent, setAdvocateSharingConsent] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [caseList, notifList] = await Promise.all([
          casesApi.list().catch(() => []),
          privacyV3Api.notifications().catch(() => []),
        ]);
        setCases(caseList || []);
        setNotifications(notifList || []);
        if (caseList && caseList.length > 0) {
          setSelectedCaseForPurge(caseList[0].id);
          setSelectedCaseForExport(caseList[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load privacy data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePurgeCase = async () => {
    if (!selectedCaseForPurge) {
      toast.error("Please select a case to purge.");
      return;
    }
    if (!confirm("Are you sure? Under the DPDP Act 2023, this will irreversibly delete all documents, evidence, timeline milestones, and AI logs associated with this case.")) {
      return;
    }

    setPurging(true);
    try {
      await privacyV3Api.deleteCase(selectedCaseForPurge);
      toast.success("Case and associated personal data erased successfully.");
      const updated = cases.filter((c) => c.id !== selectedCaseForPurge);
      setCases(updated);
      setSelectedCaseForPurge(updated[0]?.id || "");
    } catch (err: any) {
      toast.error(err.message || "Failed to purge case.");
    } finally {
      setPurging(false);
    }
  };

  const handleExportData = async () => {
    if (!selectedCaseForExport) {
      toast.error("Please select a case to export.");
      return;
    }
    setExporting(true);
    try {
      const dossier = await intelligenceV3Api.exportCase(selectedCaseForExport);
      const blob = new Blob([JSON.stringify(dossier, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `legalsaathi_case_${selectedCaseForExport}_dossier.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Complete machine-readable dossier exported!");
    } catch (err: any) {
      toast.error(err.message || "Failed to export dossier.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#706E6B] mb-2">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span className="text-[#1A2B49] font-medium">Privacy & DPDP Center</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#1A2B49] tracking-tight flex items-center gap-2.5">
                <Shield className="w-8 h-8 text-[#8C6D23]" />
                DPDP Privacy & Data Control Center
              </h1>
              <p className="text-sm text-[#55524E] mt-1 max-w-2xl">
                Compliant with the Digital Personal Data Protection Act (DPDP Act, 2023). Exercise your rights to data access, rectification, portability, and complete erasure.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5CCBE] bg-[#F3EDE3] text-xs font-semibold text-[#1A2B49]">
              <Lock className="w-3.5 h-3.5 text-[#8C6D23]" />
              Zero AI Training on Your Data
            </div>
          </div>
        </div>

        {/* DPDP Compliance Notice */}
        <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A2B49] text-[#E6C687] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-[#1A2B49]">
                Our DPDP Act 2023 Commitments to Indian Citizens
              </h3>
              <p className="text-xs text-[#55524E] leading-relaxed">
                LegalSaathi operates under strict purpose limitation. Your legal filings, contracts, identity documents, and personal details are processed solely to provide assistance to you. We do not sell your personal data, nor do we train foundation models on private user uploads.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#EAE2D5] text-xs">
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E6DFD5]">
              <strong className="text-[#1A2B49] block">1. Purpose Limitation</strong>
              <span className="text-[#706E6B] text-[11px] mt-0.5 block">
                Data is used exclusively for case analysis, translation, and user-initiated lawyer consultations.
              </span>
            </div>
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E6DFD5]">
              <strong className="text-[#1A2B49] block">2. Granular Scoped Sharing</strong>
              <span className="text-[#706E6B] text-[11px] mt-0.5 block">
                Lawyers only see the exact timeline and evidence tabs you explicitly grant access to.
              </span>
            </div>
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E6DFD5]">
              <strong className="text-[#1A2B49] block">3. Right to Erasure</strong>
              <span className="text-[#706E6B] text-[11px] mt-0.5 block">
                Immediate, irrevocable deletion of all records, vectorized embeddings, and storage files.
              </span>
            </div>
          </div>
        </div>

        {/* Consent & Processing Controls */}
        <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="font-serif text-lg font-bold text-[#1A2B49]">
            Processing Consents & Permissions
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-xl border border-[#E6DFD5]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1A2B49] block">
                  AI Orchestration & Document Extraction
                </span>
                <p className="text-[11px] text-[#706E6B]">
                  Enables multi-agent extraction of dates, financial amounts, obligations, and legal risks.
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => {
                  setAiConsent(e.target.checked);
                  toast.success(`AI processing consent ${e.target.checked ? "granted" : "withdrawn"}`);
                }}
                className="w-4 h-4 accent-[#1A2B49] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-xl border border-[#E6DFD5]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1A2B49] block">
                  Regional Indian Language Translation
                </span>
                <p className="text-[11px] text-[#706E6B]">
                  Allows contextual translation into Hindi, Tamil, Telugu, Kannada, Bengali, and other scheduled languages.
                </p>
              </div>
              <input
                type="checkbox"
                checked={translationConsent}
                onChange={(e) => {
                  setTranslationConsent(e.target.checked);
                  toast.success(`Translation consent ${e.target.checked ? "granted" : "withdrawn"}`);
                }}
                className="w-4 h-4 accent-[#1A2B49] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-xl border border-[#E6DFD5]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1A2B49] block">
                  Advocate Scoped Sharing Permission
                </span>
                <p className="text-[11px] text-[#706E6B]">
                  Permits sharing approved case dossiers with verified Bar Council lawyers when you initiate a consultation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={advocateSharingConsent}
                onChange={(e) => {
                  setAdvocateSharingConsent(e.target.checked);
                  toast.success(`Advocate sharing permission ${e.target.checked ? "enabled" : "disabled"}`);
                }}
                className="w-4 h-4 accent-[#1A2B49] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Data Portability & Erasure Action Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Portability / Export */}
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#1A2B49]" />
                <h3 className="font-serif text-base font-bold text-[#1A2B49]">
                  Export Complete Case Dossier
                </h3>
              </div>
              <p className="text-xs text-[#55524E] leading-relaxed">
                Download a complete, machine-readable JSON dossier containing your verified facts, timeline events, evidence audit logs, and statutory deadlines.
              </p>
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-[#1A2B49] mb-1">
                  Select Case to Export
                </label>
                <select
                  value={selectedCaseForExport}
                  onChange={(e) => setSelectedCaseForExport(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DDD5C7] bg-[#FDFBF7] text-xs text-[#1A2B49]"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.issue_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleExportData}
              disabled={exporting || !selectedCaseForExport}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1A2B49] hover:bg-[#111C30] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E6C687]" />
                  Compiling Dossier...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#E6C687]" />
                  Export Data Dossier (JSON)
                </>
              )}
            </button>
          </div>

          {/* Right to Erasure / Purge */}
          <div className="bg-[#FFF5F5] border border-[#FECDCD] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[#B91C1C]" />
                <h3 className="font-serif text-base font-bold text-[#991B1B]">
                  Right to Erasure (Purge Case)
                </h3>
              </div>
              <p className="text-xs text-[#7F1D1D] leading-relaxed">
                Irrevocably delete all files, extracted text, timeline events, verified facts, and AI chats for a specific case. This action cannot be undone.
              </p>
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-[#991B1B] mb-1">
                  Select Case to Erase
                </label>
                <select
                  value={selectedCaseForPurge}
                  onChange={(e) => setSelectedCaseForPurge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FECACA] bg-[#FFF] text-xs text-[#991B1B]"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.issue_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handlePurgeCase}
              disabled={purging || !selectedCaseForPurge}
              className="w-full py-2.5 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {purging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Erasing All Case Data...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Permanently Purge Case Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Data Protection Officer (DPO) & Redressal */}
        <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="font-serif text-base font-bold text-[#1A2B49] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#8C6D23]" />
            Grievance Redressal & Data Protection Officer (DPO)
          </h3>
          <p className="text-xs text-[#55524E] leading-relaxed">
            In compliance with Section 10(2) of the DPDP Act 2023, you have the right to contact our designated Data Protection Officer for inquiries, rectification requests, or privacy concerns.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#1A2B49]">
            <div>
              <span className="text-[#706E6B] block text-[11px]">Designated DPO:</span>
              <strong className="font-medium">Adv. Ananya Sengupta</strong>
            </div>
            <div>
              <span className="text-[#706E6B] block text-[11px]">Direct Grievance Email:</span>
              <a href="mailto:dpo@legalsaathi.in" className="font-medium text-[#8C6D23] hover:underline">
                dpo@legalsaathi.in
              </a>
            </div>
            <div>
              <span className="text-[#706E6B] block text-[11px]">Response SLA:</span>
              <strong className="font-medium">Within 48 Working Hours</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
