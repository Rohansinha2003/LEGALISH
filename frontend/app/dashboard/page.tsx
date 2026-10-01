"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  Scale,
  FileText,
  MessageSquare,
  Languages,
  Upload,
  Plus,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BarChart3,
} from "lucide-react";
import { documentsApi, DocumentSummary } from "@/lib/api";

const ACTION_CARDS = [
  {
    id: "upload",
    href: "/upload",
    icon: FileText,
    title: "Understand a Document",
    description: "Upload a legal document and receive a clear, simple explanation",
    color: "from-violet-600/20 to-purple-700/10",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    badge: null,
  },
  {
    id: "create",
    href: "/create",
    icon: Plus,
    title: "Create a Document",
    description: "Describe your situation and generate a draft legal document",
    color: "from-blue-600/20 to-cyan-700/10",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    badge: null,
  },
  {
    id: "translate",
    href: "/translate",
    icon: Languages,
    title: "Translate",
    description: "Translate legal text between English and Hindi",
    color: "from-emerald-600/20 to-teal-700/10",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    badge: "EN ↔ हिंदी",
  },
  {
    id: "ask",
    href: "/chat",
    icon: MessageSquare,
    title: "Ask About My Document",
    description: "Ask questions about your previously uploaded documents",
    color: "from-amber-600/20 to-orange-700/10",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    badge: null,
  },
];

function StatusBadge({ status }: { status: DocumentSummary["status"] }) {
  const configs = {
    ready: { label: "Ready", cls: "badge-ready", icon: CheckCircle },
    uploading: { label: "Uploading", cls: "badge-processing", icon: Loader2 },
    processing: { label: "Processing", cls: "badge-processing", icon: Loader2 },
    extracting: { label: "Extracting", cls: "badge-processing", icon: Loader2 },
    analyzing: { label: "Analyzing", cls: "badge-processing", icon: Loader2 },
    error: { label: "Error", cls: "badge-error", icon: AlertTriangle },
  };
  const config = configs[status] || configs.processing;
  const Icon = config.icon;
  return (
    <span className={`badge ${config.cls}`}>
      <Icon className={`w-3 h-3 ${status !== "ready" && status !== "error" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentsApi
      .list()
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const recentDocs = documents.slice(0, 5);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="content-container">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">LegalSaathi</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
              <Link href="/upload" className="btn-ghost text-sm">Upload</Link>
              <Link href="/translate" className="btn-ghost text-sm">Translate</Link>
              <Link href="/create" className="btn-ghost text-sm">Create</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="content-container py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">How can we help?</h1>
          <p className="text-slate-400">Choose what you&apos;d like to do today.</p>
        </div>

        {/* 4 Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {ACTION_CARDS.map(({ id, href, icon: Icon, title, description, color, border, iconBg, iconColor, badge }) => (
            <Link
              key={id}
              href={href}
              className={`glass card-hover p-6 border ${border} bg-gradient-to-br ${color} flex flex-col group`}
            >
              <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 ${iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              {badge && (
                <span className="text-xs font-bold text-emerald-400 mb-2">{badge}</span>
              )}
              <h3 className="text-base font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed flex-1">{description}</p>
              <div className={`flex items-center gap-1 text-xs mt-4 ${iconColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                Get started <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Documents</h2>
              <Link href="/upload" className="btn-ghost text-sm py-1.5 px-3">
                <Upload className="w-3.5 h-3.5" /> Upload new
              </Link>
            </div>

            {loading ? (
              <div className="glass rounded-xl p-8 text-center">
                <Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Loading documents...</p>
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-4">No documents yet</p>
                <Link href="/upload" className="btn-primary text-sm py-2 px-5">
                  <Upload className="w-4 h-4" /> Upload your first document
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href={doc.status === "ready" ? `/analyze/${doc.id}` : "#"}
                    className="glass rounded-xl p-4 flex items-center gap-3 card-hover border border-white/5 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500">
                        {doc.file_type.toUpperCase()} · {doc.page_count ? `${doc.page_count} pages` : "Processing"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={doc.status} />
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Quick Stats</h2>
            <div className="space-y-3">
              {[
                { label: "Documents uploaded", value: documents.length, icon: FileText, color: "text-violet-400" },
                { label: "Documents analyzed", value: documents.filter(d => d.status === "ready").length, icon: CheckCircle, color: "text-emerald-400" },
                { label: "Processing", value: documents.filter(d => ["processing", "analyzing", "extracting"].includes(d.status)).length, icon: Loader2, color: "text-amber-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass rounded-xl p-4 flex items-center gap-4 border border-white/5">
                  <div className={`w-10 h-10 rounded-lg glass flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-slate-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="disclaimer-box mt-4">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs">
                LegalSaathi provides AI-generated legal information for informational purposes only. Not a substitute for advice from a qualified lawyer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="page-container flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
