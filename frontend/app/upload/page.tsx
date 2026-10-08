"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  Upload,
  FileText,
  File,
  Image,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { documentsApi } from "@/lib/api";
import toast from "react-hot-toast";

// Section 15: Multi-stage progress indicators
const PROGRESS_STAGES = [
  { id: "upload", label: "Upload complete" },
  { id: "extracted", label: "Text extracted" },
  { id: "clauses", label: "Important clauses found" },
  { id: "understanding", label: "Understanding legal content" },
  { id: "explaining", label: "Preparing simple explanation" },
];

const ACCEPTED_TYPES = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/png": ".png",
  "image/jpeg": ".jpg,.jpeg",
};

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    // Advance realistic stages every 800ms
    const stageTimer = setInterval(() => {
      setStageIndex((prev) => (prev < PROGRESS_STAGES.length - 1 ? prev + 1 : prev));
    }, 800);

    const pollInterval = setInterval(async () => {
      try {
        const res = await documentsApi.status(documentId);
        if (res.status === "ready") {
          clearInterval(pollInterval);
          clearInterval(stageTimer);
          setStageIndex(PROGRESS_STAGES.length);
          toast.success("Document analyzed successfully!");
          setTimeout(() => router.push(`/analyze/${documentId}`), 700);
        } else if (res.status === "error") {
          clearInterval(pollInterval);
          clearInterval(stageTimer);
          setError(res.error_message || "We couldn't read this document. Please check the file formatting.");
          setUploading(false);
        }
      } catch {
        // Continue polling
      }
    }, 1400);

    return () => {
      clearInterval(pollInterval);
      clearInterval(stageTimer);
    };
  }, [documentId, router]);

  const handleFile = useCallback((file: File) => {
    const maxSizeMB = 20;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit. Please upload a smaller document.`);
      return;
    }
    const validTypes = Object.keys(ACCEPTED_TYPES);
    const isValid = validTypes.some((t) => file.type === t) || file.name.endsWith(".docx");
    if (!isValid) {
      setError("Supported formats: PDF, DOCX, JPG, PNG. Please upload a standard legal document format.");
      return;
    }
    setError(null);
    setSelectedFile(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setStageIndex(0);
    setError(null);

    try {
      const res = await documentsApi.upload(selectedFile);
      setDocumentId(res.id);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't process this document right now. Please try again.";
      setError(message);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* ─── TOP ACTION BAR ─── */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Back to Dashboard</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">DPDP Encrypted</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            ✦ Document Intelligence
          </span>
          <h1 className="font-serif text-3xl font-bold text-[var(--text-primary)] mt-1">
            Understand your legal document
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
            Instant plain-language breakdown of clauses, responsibilities, and areas worth reviewing.
          </p>
        </div>

        {/* ─── SECTION 14: DROPZONE WITH ANIMATED GRADIENT BORDER ─── */}
        {!uploading ? (
          <div className="space-y-6">
            <div
              className={`animated-gradient-border p-[1.5px] shadow-lg transition-all ${
                dragOver ? "scale-[1.01]" : ""
              }`}
            >
              <div
                className="p-8 sm:p-10 rounded-[1.25rem] bg-[var(--surface)] border border-[var(--border)] text-center cursor-pointer hover:bg-[var(--surface-secondary)]/50 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById("file-upload-input")?.click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{selectedFile.name}</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="mt-1 text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <X className="w-3.5 h-3.5" /> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-cyan-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">
                        Drop your legal document here
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        or <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">Choose a file</span> from your device
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[var(--text-muted)]">
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)]">PDF</span>
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)]">DOCX</span>
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)]">JPG</span>
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)]">PNG</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium pt-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Your document stays private</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-5 rounded-2xl bg-[#FAEDED] dark:bg-rose-950/30 border border-[#D95C55]/30 text-xs text-[#171717] dark:text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#D95C55]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Something went wrong.</span>
                </div>
                <p className="text-xs text-[#6B6862] dark:text-rose-300/80 leading-relaxed">
                  We couldn&apos;t process this document. Your document has not been lost.
                </p>
                <div className="pt-2 flex items-center gap-3 border-t border-[#D95C55]/20">
                  <button
                    onClick={() => {
                      setError(null);
                      if (selectedFile) handleUpload();
                    }}
                    className="font-semibold underline hover:text-[#171717] cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      setSelectedFile(null);
                    }}
                    className="font-semibold underline hover:text-[#171717] cursor-pointer"
                  >
                    Upload another file
                  </button>
                  <Link href="/easy-help" className="hover:underline text-[#6B6862]">
                    Contact support
                  </Link>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            {selectedFile && !error && (
              <button
                onClick={handleUpload}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Analyze Document</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Privacy Microcopy */}
            <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Private & Confidential</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Your document is private to your account unless you choose to share it. We adhere strictly to the Digital Personal Data Protection (DPDP) Act 2023.
              </p>
            </div>
          </div>
        ) : (
          /* ─── SECTION 15: MULTI-STAGE ANIMATED PROGRESS ─── */
          <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#171717] text-[#FBF9F5] flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-6 h-6 text-[#7C3AED]" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#171717] dark:text-[#F5F5F5] mt-3">
                ✦ Reading your document
              </h2>
              <p className="text-xs text-[#6B6862]">
                Identifying important clauses & verifying legal references.
              </p>
            </div>

            <div className="space-y-2.5 max-w-md mx-auto pt-2">
              {PROGRESS_STAGES.map((stage, idx) => {
                const isDone = idx < stageIndex;
                const isCurrent = idx === stageIndex;
                const isPending = idx > stageIndex;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isCurrent
                        ? "bg-purple-50 dark:bg-purple-950/40 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold shadow-2xs"
                        : isDone
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "text-[var(--text-muted)] opacity-50"
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      {isCurrent && <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />}
                      {isPending && <span className="w-2 h-2 rounded-full border border-[var(--border-strong)]" />}
                    </div>
                    <span className="text-xs">{stage.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[var(--border)] text-center text-[11px] text-[var(--text-muted)]">
              This usually completes in 3-8 seconds depending on document length.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
