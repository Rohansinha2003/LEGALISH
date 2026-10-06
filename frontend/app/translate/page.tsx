"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import {
  Languages,
  ArrowRight,
  ArrowLeftRight,
  Loader2,
  AlertTriangle,
  Copy,
  CheckCircle,
  Volume2,
  Shield,
  Sparkles,
  Download,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { translateV2Api } from "@/lib/api";
import { VoiceInputButton, ReadAloudButton } from "@/components/VoiceHelper";
import toast from "react-hot-toast";

const ALL_LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
];

type Mode = "legal" | "simple" | "very_simple";

function TranslateContent() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [mode, setMode] = useState<Mode>("simple");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [preservedTerms, setPreservedTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (outputText) {
      setInputText(outputText);
      setOutputText("");
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutputText("");
    try {
      const res = await translateV2Api.translate(inputText, sourceLang, targetLang, mode);
      setOutputText(res.translated_text);
      setDisclaimer(res.safety_disclaimer);
      setPreservedTerms(res.preserved_terms || []);
    } catch (e: any) {
      toast.error(e.message || "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied translation to clipboard");
  };

  const downloadOutput = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `legalsaathi_translation_${targetLang}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded translation file");
  };

  const currentTargetLangObj = ALL_LANGUAGES.find((l) => l.code === targetLang) || ALL_LANGUAGES[1];
  const currentSourceLangObj = ALL_LANGUAGES.find((l) => l.code === sourceLang) || ALL_LANGUAGES[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Languages className="w-3.5 h-3.5 text-teal-600" />
          <span>Multilingual Legal AI Engine • 12+ Indian Languages</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Translate legal documents
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Convert complex legal text into plain meaning in your regional language. Critical statutory sections, limitation dates, and rupee values are strictly preserved.
        </p>
      </div>

      {/* Language Quick Bar & Selectors */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Source Lang */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Original Language
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            >
              {ALL_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} — {l.native}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center pt-2 md:pt-6">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap languages"
              className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-300 text-slate-600 hover:text-teal-600 shadow-xs transition-all cursor-pointer group"
            >
              <ArrowLeftRight className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
          </div>

          {/* Target Lang */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            >
              {ALL_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} — {l.native}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Indian Language Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quick Select Target Indian Language:
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ALL_LANGUAGES.filter((l) => l.code !== "en").map((lang) => {
              const isSelected = targetLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setTargetLang(lang.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-teal-600 text-white shadow-xs font-semibold"
                      : "bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
                  }`}
                >
                  <span className="font-sans mr-1">{lang.native}</span>
                  <span className="text-[10px] opacity-75">({lang.name})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-600">Simplicity & Clarity Target:</span>
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 max-w-md">
            {[
              { id: "legal", label: "⚖ Formal Legal" },
              { id: "simple", label: "✨ Simple Meaning" },
              { id: "very_simple", label: "🌱 Layperson Easy" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id as Mode)}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === m.id
                    ? "bg-white text-indigo-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Panel Workspace: Original vs Translation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Original Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Original ({currentSourceLangObj.name})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {inputText && (
                  <button
                    onClick={() => setInputText("")}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <VoiceInputButton
                  onTranscript={(txt) => setInputText((prev) => (prev ? `${prev} ${txt}` : txt))}
                />
              </div>
            </div>

            <textarea
              rows={11}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste legal text, contract clauses, court orders, or notices here... (e.g. 'The tenant shall pay a non-refundable maintenance charge of Rs 3,500 on the first day of each calendar month...')"
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/40 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-slate-400 leading-relaxed font-sans"
            />

            <button
              type="button"
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-teal-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Translating to {currentTargetLangObj.native} ({currentTargetLangObj.name})...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  Translate & Clarify to {currentTargetLangObj.native}
                </>
              )}
            </button>
          </div>

          {/* Translation Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                  Translation ({currentTargetLangObj.native} • {currentTargetLangObj.name})
                </span>
              </div>

              {outputText && (
                <div className="flex items-center gap-1.5">
                  <ReadAloudButton text={outputText} />
                  <button
                    onClick={copyOutput}
                    className="p-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={downloadOutput}
                    className="p-1.5 rounded-xl text-xs font-medium bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Download text file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            <div className="w-full h-[278px] p-4 rounded-2xl border border-teal-200/80 bg-gradient-to-b from-teal-50/30 to-white text-sm text-slate-900 overflow-y-auto leading-relaxed shadow-inner">
              {outputText ? (
                <div className="space-y-3">
                  <p className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-slate-800">
                    {outputText}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <BookOpen className="w-8 h-8 text-teal-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-500">
                    Translation in &ldquo;{mode}&rdquo; mode will appear here.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dates, numbers, and statutory names will be protected.
                  </p>
                </div>
              )}
            </div>

            {/* Preserved Entities Badge */}
            {preservedTerms.length > 0 ? (
              <div className="text-xs text-teal-900 bg-teal-50/80 p-3 rounded-2xl border border-teal-200 flex items-start gap-2 shadow-xs">
                <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-teal-950">Statutory terms preserved: </span>
                  <span className="text-teal-800">{preservedTerms.join(", ")}</span>
                </div>
              </div>
            ) : (
              <div className="h-10" />
            )}
          </div>
        </div>

        {/* Translation Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {disclaimer ||
              "Legal translations are adapted for clear comprehension and legal awareness. For formal submission to judicial forums or government registries, certified advocate copies are recommended where statutory rules require."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TranslatePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
          Loading translation engine...
        </div>
      }
    >
      <TranslateContent />
    </Suspense>
  );
}
