"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  Plus,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  FileText,
  CheckCircle,
  Download,
  Edit3,
} from "lucide-react";
import { generateApi, DocumentType, GeneratedDocumentResult } from "@/lib/api";
import toast from "react-hot-toast";

type Step = "select-type" | "interview" | "review" | "generated";

export default function CreatePage() {
  const [step, setStep] = useState<Step>("select-type");
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedDocumentResult | null>(null);

  useEffect(() => {
    generateApi.types().then((r) => setDocTypes(r.document_types)).catch(console.error);
  }, []);

  const selectType = (type: DocumentType) => {
    setSelectedType(type);
    setAnswers({});
    setCurrentQ(0);
    setStep("interview");
  };

  const handleAnswer = (value: string) => {
    if (!selectedType) return;
    const q = selectedType.questions[currentQ];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const nextQuestion = () => {
    if (!selectedType) return;
    if (currentQ < selectedType.questions.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      setStep("review");
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) setCurrentQ((c) => c - 1);
    else setStep("select-type");
  };

  const generate = async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      const res = await generateApi.generate(selectedType.id, answers);
      setResult(res);
      setStep("generated");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = selectedType?.questions[currentQ];
  const progress = selectedType ? ((currentQ + 1) / selectedType.questions.length) * 100 : 0;

  return (
    <div className="page-container min-h-screen">
      <div className="border-b border-white/5">
        <div className="content-container">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">LegalSaathi</span>
            </Link>
            <Link href="/dashboard" className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="content-container py-10">
        <div className="max-w-2xl mx-auto">
          {/* Step: Select Type */}
          {step === "select-type" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create a Legal Document</h1>
                <p className="text-slate-400">Select the type of document you want to create.</p>
              </div>
              <div className="space-y-3">
                {docTypes.length === 0 ? (
                  <div className="glass rounded-xl p-8 text-center">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Loading document types...</p>
                  </div>
                ) : (
                  docTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => selectType(type)}
                      className="w-full glass card-hover p-5 rounded-xl border border-white/5 text-left flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{type.name}</p>
                        <p className="text-sm text-slate-400">{type.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 transition-colors" />
                    </button>
                  ))
                )}
              </div>
              <div className="disclaimer-box mt-6">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs">Generated documents are AI-created drafts for informational purposes. Please review with a qualified advocate before use.</p>
              </div>
            </>
          )}

          {/* Step: Interview */}
          {step === "interview" && selectedType && currentQuestion && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">{selectedType.name}</span>
                  <span className="text-sm text-slate-500">
                    {currentQ + 1} / {selectedType.questions.length}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="glass-strong rounded-2xl p-8 mb-4">
                <h2 className="text-2xl font-bold text-white mb-6">{currentQuestion.label}</h2>
                {currentQuestion.type === "textarea" ? (
                  <textarea
                    className="input-field min-h-[120px] resize-none"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Describe in your own words..."
                    autoFocus
                  />
                ) : currentQuestion.type === "date" ? (
                  <input
                    type="date"
                    className="input-field"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="input-field"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && nextQuestion()}
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={prevQuestion} className="btn-secondary flex-1 justify-center">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={nextQuestion}
                  className="btn-primary flex-1 justify-center"
                >
                  {currentQ < selectedType.questions.length - 1 ? (
                    <><span>Next</span> <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <><span>Review</span> <CheckCircle className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Step: Review */}
          {step === "review" && selectedType && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Review Your Information</h1>
                <p className="text-slate-400">Check your answers before we generate the document.</p>
              </div>

              <div className="glass rounded-xl border border-white/5 mb-6 divide-y divide-white/5">
                {selectedType.questions.map((q) => (
                  <div key={q.id} className="p-4">
                    <p className="text-xs text-slate-500 mb-1">{q.label}</p>
                    <p className="text-sm text-slate-200">{answers[q.id] || <span className="text-slate-600 italic">Not provided</span>}</p>
                  </div>
                ))}
              </div>

              <div className="disclaimer-box mb-6">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs">The generated document is a draft for informational purposes only. Review with a qualified advocate before sending.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setStep("interview"); setCurrentQ(0); }} className="btn-secondary flex-1 justify-center">
                  <Edit3 className="w-4 h-4" /> Edit Answers
                </button>
                <button onClick={generate} disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {loading ? "Generating..." : "Generate Document"}
                </button>
              </div>
            </>
          )}

          {/* Step: Generated */}
          {step === "generated" && result && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <h1 className="text-2xl font-bold text-white">Document Generated</h1>
                </div>
                <p className="text-slate-400 text-sm">{result.title}</p>
              </div>

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div className="high-risk-alert mb-4">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <ul className="text-sm space-y-1">
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Missing info */}
              {result.missing_information?.length > 0 && (
                <div className="disclaimer-box mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-400 mb-1">Please fill in before sending:</p>
                    <ul className="text-xs space-y-0.5">
                      {result.missing_information.map((m, i) => <li key={i}>• {m}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* Document preview */}
              <div className="glass rounded-xl border border-white/5 p-6 mb-4 max-h-[400px] overflow-y-auto">
                <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{result.content}</pre>
              </div>

              {/* Disclaimer */}
              <div className="disclaimer-box mb-6">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs">{result.disclaimer}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <a
                  href={generateApi.downloadPdf(result.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 justify-center"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
                <button onClick={() => setStep("select-type")} className="btn-secondary flex-1 justify-center">
                  <Plus className="w-4 h-4" /> Create Another
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
