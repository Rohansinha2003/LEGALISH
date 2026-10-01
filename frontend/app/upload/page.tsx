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
  CheckCircle,
  Loader2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { documentsApi } from "@/lib/api";
import toast from "react-hot-toast";

const PROCESSING_STEPS = [
  { key: "uploading", label: "Uploading file..." },
  { key: "processing", label: "Processing document..." },
  { key: "extracting", label: "Extracting text..." },
  { key: "analyzing", label: "Analyzing document..." },
  { key: "ready", label: "Ready!" },
];

const ACCEPTED_TYPES = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/png": ".png",
  "image/jpeg": ".jpg,.jpeg",
};

function getFileIcon(type: string) {
  if (type.includes("pdf")) return FileText;
  if (type.includes("image")) return Image;
  return File;
}

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("uploading");
  const [error, setError] = useState<string | null>(null);

  // Poll status until ready or error
  useEffect(() => {
    if (!documentId || currentStatus === "ready" || currentStatus === "error") return;
    const interval = setInterval(async () => {
      try {
        const res = await documentsApi.status(documentId);
        setCurrentStatus(res.status);
        if (res.status === "ready") {
          clearInterval(interval);
          toast.success("Document analyzed! Redirecting...");
          setTimeout(() => router.push(`/analyze/${documentId}`), 1200);
        } else if (res.status === "error") {
          clearInterval(interval);
          setError(res.error_message || "Processing failed. Please try again.");
        }
      } catch {
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [documentId, currentStatus, router]);

  const handleFile = useCallback((file: File) => {
    const maxSizeMB = 20;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    const validTypes = Object.keys(ACCEPTED_TYPES);
    const isValid = validTypes.some((t) => file.type === t) || file.name.endsWith(".docx");
    if (!isValid) {
      setError("Unsupported file type. Please upload PDF, DOCX, PNG, or JPG.");
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

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setCurrentStatus("uploading");
    setError(null);

    try {
      const res = await documentsApi.upload(selectedFile);
      setDocumentId(res.id);
      setCurrentStatus("processing");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
      setUploading(false);
    }
  };

  const currentStepIndex = PROCESSING_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="page-container min-h-screen">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="content-container">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">LegalSaathi</span>
            </Link>
            <Link href="/dashboard" className="btn-ghost text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="content-container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Upload a Legal Document</h1>
            <p className="text-slate-400">
              Upload your document and we&apos;ll explain it in simple language within seconds.
            </p>
          </div>

          {!uploading ? (
            <>
              {/* Drop Zone */}
              <div
                className={`upload-zone mb-6 ${dragOver ? "drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  onChange={onInputChange}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-4">
                    {(() => {
                      const Icon = getFileIcon(selectedFile.type);
                      return <Icon className="w-12 h-12 text-violet-400" />;
                    })()}
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">{selectedFile.name}</p>
                      <p className="text-sm text-slate-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      className="btn-ghost text-sm text-rose-400 hover:text-rose-300"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    >
                      <X className="w-4 h-4" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center">
                      <Upload className="w-8 h-8 text-violet-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white mb-1">
                        Drop your document here
                      </p>
                      <p className="text-sm text-slate-400">
                        or click to browse your files
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      {["PDF", "DOCX", "PNG", "JPG"].map((ext) => (
                        <span key={ext} className="badge badge-processing">{ext}</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">Maximum file size: 20MB</p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="high-risk-alert mb-6">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Upload Button */}
              {selectedFile && (
                <button onClick={handleUpload} className="btn-primary w-full justify-center py-3.5 text-base">
                  <Upload className="w-5 h-5" />
                  Analyze this document
                </button>
              )}

              {/* Supported formats info */}
              <div className="mt-6 glass rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-300 mb-3">What we support:</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> PDF documents</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Word documents (.docx)</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Photos of documents</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Scanned documents (OCR)</div>
                </div>
              </div>
            </>
          ) : (
            /* Processing State */
            <div className="glass-strong rounded-2xl p-8">
              <div className="text-center mb-8">
                {currentStatus === "ready" ? (
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                ) : currentStatus === "error" ? (
                  <AlertTriangle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin mx-auto mb-4" />
                )}
                <h2 className="text-xl font-bold text-white mb-2">
                  {currentStatus === "ready"
                    ? "Analysis Complete!"
                    : currentStatus === "error"
                    ? "Processing Failed"
                    : "Processing your document..."}
                </h2>
                <p className="text-slate-400 text-sm">{selectedFile?.name}</p>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {PROCESSING_STEPS.map((step, i) => {
                  const isDone = i < currentStepIndex;
                  const isActive = i === currentStepIndex;
                  return (
                    <div key={step.key} className={`flex items-center gap-3 transition-all duration-300`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDone ? "bg-emerald-500/20" : isActive ? "bg-violet-500/20" : "bg-white/5"
                      }`}>
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : isActive ? (
                          <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
                        )}
                      </div>
                      <span className={`text-sm ${isDone ? "text-emerald-400" : isActive ? "text-violet-300 font-medium" : "text-slate-500"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="high-risk-alert mt-6">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-rose-300">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
