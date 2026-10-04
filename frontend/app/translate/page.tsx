"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import {
  Languages,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Copy,
  CheckCircle,
  Volume2,
  Shield,
  Sparkles,
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
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E6DFD5] pb-6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] bg-[#E6C687]/20 px-2.5 py-0.5 rounded-full">
            Multilingual Indian Engine
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#1A2B49]">
          Translate & Simplify Legal Documents
        </h1>
        <p className="text-xs text-[#706E6B] max-w-2xl leading-relaxed">
          Translate between English and 10 Indian regional languages across 3 clarity modes. Crucial dates, monetary amounts, and statutory references are strictly protected.
        </p>
      </div>

      {/* Control Bar: Language Selectors & Clarity Modes */}
      <div className="bg-white rounded-3xl p-6 border border-[#E6DFD5] shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Source Lang */}
          <div>
            <label className="block text-xs font-semibold text-[#55524E] mb-1.5">Source Language</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
            >
              {ALL_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name} ({l.native})</option>
              ))}
            </select>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#55524E] mb-1.5">Clarity Mode</label>
            <div className="flex rounded-xl bg-[#F7F2E8] p-1 border border-[#DDD5C7]">
              {[
                { id: "legal", label: "Legal" },
                { id: "simple", label: "Simple" },
                { id: "very_simple", label: "Very Simple" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as Mode)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === m.id
                      ? "bg-[#1A2B49] text-white shadow-xs"
                      : "text-[#706E6B] hover:text-[#1A2B49]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Lang */}
          <div>
            <label className="block text-xs font-semibold text-[#55524E] mb-1.5">Target Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
            >
              {ALL_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name} ({l.native})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Input & Output Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A2B49]">Input Legal Clause or Text</span>
              <VoiceInputButton
                onTranscript={(txt) => setInputText((prev) => prev ? `${prev} ${txt}` : txt)}
              />
            </div>
            <textarea
              rows={10}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste clause or paragraph here (e.g. 'The lessee agrees to pay a refundable security deposit of Rs 45,000 on or before the execution date...')."
              className="w-full p-4 rounded-2xl border border-[#DDD5C7] bg-[#FDFAF5] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49] placeholder-[#9C9488]"
            />
            <button
              type="button"
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="w-full py-3 rounded-xl bg-[#1A2B49] text-white hover:bg-[#111C30] text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Translating & Adapting to {ALL_LANGUAGES.find(l => l.code === targetLang)?.name}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E6C687]" />
                  Translate to {ALL_LANGUAGES.find(l => l.code === targetLang)?.name}
                </>
              )}
            </button>
          </div>

          {/* Output Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A2B49]">Translated / Simplified Output</span>
              {outputText && (
                <div className="flex items-center gap-2">
                  <ReadAloudButton text={outputText} />
                  <button
                    onClick={copyOutput}
                    className="p-1.5 rounded-lg text-xs font-medium bg-[#EFE8DD] text-[#55524E] hover:text-[#1A2B49] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="w-full h-[256px] p-4 rounded-2xl border border-[#DDD5C7] bg-[#FAF7F2] text-sm text-[#1A2B49] overflow-y-auto leading-relaxed">
              {outputText ? (
                <p className="whitespace-pre-wrap">{outputText}</p>
              ) : (
                <span className="text-[#9C9488] text-xs italic">
                  Translation in &quot;{mode}&quot; mode will appear here...
                </span>
              )}
            </div>

            {/* Preserved Entities Badge */}
            {preservedTerms.length > 0 && (
              <div className="text-[11px] text-[#706E6B] bg-[#FDFAF5] p-2.5 rounded-xl border border-[#E6DFD5] flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#8C6D23]" />
                <span>Preserved Terms: {preservedTerms.join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Translation Disclaimer */}
        <div className="p-4 rounded-2xl bg-[#F7F2E8] border border-[#DDD0BC] text-[11px] text-[#706E6B] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#8C6D23] shrink-0 mt-0.5" />
          <p>
            {disclaimer || "Translated text is provided for understanding. For formal legal submission to a court, consider using a qualified legal translator or advocate where required."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TranslatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#706E6B]">Loading translation engine...</div>}>
      <TranslateContent />
    </Suspense>
  );
}
