"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Scale, ArrowLeft, Languages, ArrowRight, Loader2, AlertTriangle, Copy, CheckCircle } from "lucide-react";
import { translateApi } from "@/lib/api";
import toast from "react-hot-toast";

type Lang = "en" | "hi";
type Mode = "legal" | "simple";

function TranslateContent() {
  const [sourceLang, setSourceLang] = useState<Lang>("en");
  const [mode, setMode] = useState<Mode>("simple");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const targetLang: Lang = sourceLang === "en" ? "hi" : "en";

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutputText("");
    setNotes("");
    try {
      const res = await translateApi.translate(inputText, sourceLang, targetLang, mode);
      setOutputText(res.translated_text);
      if (res.notes) setNotes(res.notes);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Translation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const langLabels: Record<Lang, string> = { en: "English", hi: "हिंदी (Hindi)" };

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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Languages className="w-7 h-7 text-emerald-400" />
              Translate Legal Text
            </h1>
            <p className="text-slate-400">Translate between English and Hindi in legal or simplified mode.</p>
          </div>

          {/* Controls */}
          <div className="glass rounded-xl p-4 border border-white/5 flex flex-wrap items-center gap-4 mb-6">
            {/* Language toggle */}
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => setSourceLang("en")}
                className={`flex-1 text-center py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  sourceLang === "en" ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300" : "text-slate-400 hover:text-white"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSourceLang(sourceLang === "en" ? "hi" : "en")}
                className="w-8 h-8 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSourceLang("hi")}
                className={`flex-1 text-center py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  sourceLang === "hi" ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300" : "text-slate-400 hover:text-white"
                }`}
              >
                हिंदी (Hindi)
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              {(["simple", "legal"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    mode === m ? "bg-violet-500/20 text-violet-300" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "simple" ? "Simple Language" : "Legal Precision"}
                </button>
              ))}
            </div>
          </div>

          {/* Mode info */}
          <div className="disclaimer-box mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs">
              {mode === "simple"
                ? "Simple mode: Translates using everyday language that non-lawyers can understand. Legal terms may be simplified."
                : "Legal mode: Preserves exact legal terminology and meaning. Recommended for formal legal documents."}
            </p>
          </div>

          {/* Text areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="glass rounded-xl border border-white/5 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-semibold text-white">{langLabels[sourceLang]}</span>
                <span className="text-xs text-slate-500">{inputText.length} / 10,000</span>
              </div>
              <textarea
                className="flex-1 bg-transparent p-4 text-slate-200 text-sm leading-relaxed resize-none outline-none min-h-[280px] placeholder:text-slate-500"
                placeholder={sourceLang === "en" ? "Paste your legal text here..." : "यहाँ अपना कानूनी पाठ डालें..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 10000))}
              />
            </div>

            <div className="glass rounded-xl border border-white/5 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-semibold text-white">{langLabels[targetLang]}</span>
                {outputText && (
                  <button onClick={copyOutput} className="btn-ghost text-xs py-1 px-2">
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <div className="flex-1 p-4 min-h-[280px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full gap-3 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    <span className="text-sm">Translating...</span>
                  </div>
                ) : outputText ? (
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{outputText}</p>
                ) : (
                  <p className="text-slate-500 text-sm">Translation will appear here...</p>
                )}
              </div>
            </div>
          </div>

          {/* Translator notes */}
          {notes && (
            <div className="glass rounded-xl p-4 border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent mb-6">
              <p className="text-sm text-blue-300"><strong>Translator note:</strong> {notes}</p>
            </div>
          )}

          <button
            onClick={handleTranslate}
            disabled={!inputText.trim() || loading}
            className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5" />}
            {loading ? "Translating..." : `Translate to ${langLabels[targetLang]}`}
          </button>

          {/* Coming soon languages */}
          <div className="mt-8 glass rounded-xl p-4 border border-white/5">
            <p className="text-sm font-semibold text-slate-300 mb-3">Coming soon:</p>
            <div className="flex flex-wrap gap-2">
              {["Bengali", "Marathi", "Tamil", "Telugu", "Kannada", "Gujarati", "Malayalam", "Punjabi"].map((lang) => (
                <span key={lang} className="badge bg-white/5 text-slate-500 border border-white/5">{lang}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TranslatePage() {
  return (
    <Suspense fallback={<div className="page-container flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>}>
      <TranslateContent />
    </Suspense>
  );
}
