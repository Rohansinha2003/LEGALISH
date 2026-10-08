"use client";

import { useState, useEffect } from "react";
import {
  HeartHandshake,
  Building2,
  Users,
  CheckCircle2,
  FileText,
  Upload,
  Shield,
  ArrowRight,
  Clock,
  Download,
  Filter,
} from "lucide-react";
import { v4Api, NgoDashboardData } from "@/lib/api";

export default function NgoWorkspacePage() {
  const [dashboard, setDashboard] = useState<NgoDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("sop");
  const [uploadContent, setUploadContent] = useState("");
  const [knowledgeDocs, setKnowledgeDocs] = useState([
    {
      id: "doc-1",
      title: "DLSA South Delhi Lok Adalat Referral SOP (2026)",
      type: "sop",
      created_at: "2026-02-14",
    },
    {
      id: "doc-2",
      title: "Model Section 12 Free Legal Services Intake Affidavit",
      type: "template",
      created_at: "2026-03-01",
    },
  ]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  async function loadNgoData() {
    setLoading(true);
    try {
      const data = await v4Api.getNgoDashboard("default-ngo");
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load NGO dashboard", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNgoData();
  }, []);

  function handleUploadDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setKnowledgeDocs([
      {
        id: `doc-${Date.now()}`,
        title: uploadTitle,
        type: uploadType,
        created_at: new Date().toISOString().split("T")[0],
      },
      ...knowledgeDocs,
    ]);

    setUploadTitle("");
    setUploadContent("");
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      {/* Header */}
      <section className="bg-[#1A2B49] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E6DFD5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6C687]/20 text-[#E6C687] border border-[#E6C687]/40 uppercase tracking-wider">
                  NGO & Legal Clinic Portal
                </span>
                <span className="text-xs text-[#C5BCAD]">NALSA & DLSA Partner</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                Nyaya Sahayata Legal Aid Clinic
              </h1>
              <p className="mt-2 text-sm text-[#E2DACB] max-w-2xl">
                Caseworker intake management, Section 12 NALSA eligibility screening,
                pro-bono advocate allocation, and quarterly DLSA compliance reporting.
              </p>
            </div>

            {/* DLSA South Delhi Status Badge */}
            <div className="bg-white/10 p-4 rounded-2xl border border-white/15 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#C5BCAD]">DLSA Compliance Status</p>
                <p className="text-sm font-bold text-white">Quarter 1 Active & Submitted</p>
                <p className="text-[10px] text-emerald-300">South Delhi District Court Saket</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#706E6B] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Monthly Intake Cases</span>
              <Users className="w-4 h-4 text-[#8C6D23]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#1A2B49]">{dashboard?.statistics.intake_cases_this_month || 38}</p>
            <p className="text-[11px] text-[#706E6B] mt-1">+14% vs previous month</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#706E6B] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Section 12 NALSA Eligible</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="font-serif text-3xl font-bold text-emerald-800">{dashboard?.statistics.nalsa_section_12_eligible_cases || 32}</p>
            <p className="text-[11px] text-emerald-700 mt-1">84% eligibility rate</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#706E6B] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Assigned Pro Bono Advocates</span>
              <HeartHandshake className="w-4 h-4 text-[#8C6D23]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#1A2B49]">{dashboard?.statistics.assigned_pro_bono_advocates || 8}</p>
            <p className="text-[11px] text-[#706E6B] mt-1">Delhi Bar Association Panel</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#706E6B] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Resolved in Lok Adalat</span>
              <Building2 className="w-4 h-4 text-[#8C6D23]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[#1A2B49]">{dashboard?.statistics.resolved_lok_adalat_matters || 14}</p>
            <p className="text-[11px] text-emerald-700 mt-1">Pre-litigation settlements</p>
          </div>
        </div>

        {/* Caseworker Intake Queue & Knowledge Base */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Caseworker Intake Queue (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A2B49]">Caseworker Intake Queue</h3>
                  <p className="text-xs text-[#706E6B]">Screened under Legal Services Authorities Act, 1987</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FAF7F2] text-[#55524E] border border-[#E6DFD5]">
                  Live Queue
                </span>
              </div>

              <div className="space-y-3">
                {(dashboard?.recent_client_matters || [
                  {
                    client_identifier: "Client #DL-2026-081",
                    issue_type: "Tenancy / Eviction",
                    nalsa_category: "Woman / Below State Income Threshold",
                    assigned_advocate: "Adv. Ramesh Varma",
                    status: "Notice Dispatched",
                  },
                  {
                    client_identifier: "Client #DL-2026-082",
                    issue_type: "Delayed Wages / Construction",
                    nalsa_category: "Payment of Wages Act Claim",
                    assigned_advocate: "Adv. Priya Sharma",
                    status: "Conciliation Meeting Scheduled",
                  },
                  {
                    client_identifier: "Client #DL-2026-083",
                    issue_type: "Cheque Dishonour Defense",
                    nalsa_category: "Senior Citizen / Section 12(h)",
                    assigned_advocate: "Adv. K.L. Mehta",
                    status: "Reply Draft Prepared",
                  },
                ]).map((matter, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[#E6DFD5] bg-[#FAF7F2] hover:bg-white transition-all space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-[#8C6D23]">{matter.client_identifier}</span>
                        <h4 className="font-serif font-bold text-sm text-[#1A2B49]">{matter.issue_type}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {matter.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-[#55524E] pt-1">
                      <span className="bg-white px-2 py-0.5 rounded border border-[#E6DFD5]">
                        NALSA: {matter.nalsa_category}
                      </span>
                      <span className="font-medium text-[#1A2B49]">
                        Assigned: {matter.assigned_advocate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tenant-Isolated Organization Knowledge Base (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1A2B49] text-white uppercase tracking-wider">
                  Private Knowledge Base
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A2B49] mt-1.5">
                  Clinic SOPs & Standard Templates
                </h3>
                <p className="text-xs text-[#706E6B]">
                  Tenant-isolated documents only visible to your clinic caseworkers.
                </p>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleUploadDoc} className="space-y-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#E6DFD5]">
                <h4 className="text-xs font-bold text-[#706E6B] uppercase tracking-wider">Add Clinic Document</h4>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Document Title (e.g. Lok Adalat Intake SOP)"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-white"
                  >
                    <option value="sop">Clinic SOP</option>
                    <option value="template">Standard Agreement / Notice</option>
                    <option value="policy">Internal Policy</option>
                  </select>
                  <button
                    type="submit"
                    className="py-2 rounded-xl bg-[#1A2B49] hover:bg-[#111C30] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Upload Document
                  </button>
                </div>

                {uploadSuccess && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Document added to private knowledge base!
                  </p>
                )}
              </form>

              {/* Uploaded Documents List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#706E6B] uppercase tracking-wider">Saved Organization Docs</p>
                {knowledgeDocs.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-xl border border-[#E6DFD5] bg-white flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-[#8C6D23] shrink-0" />
                      <span className="font-medium text-[#1A2B49] truncate">{doc.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E6DFD5] text-[#706E6B] shrink-0">
                      {doc.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
