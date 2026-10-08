"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Loader2,
  Scale,
  Send,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface VoiceFirstModalProps {
  open: boolean;
  onClose: () => void;
}

export function VoiceFirstModal({ open, onClose }: VoiceFirstModalProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState("hi-IN");

  useEffect(() => {
    if (!open) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setSpeaking(false);
      setListening(false);
    }
  }, [open]);

  if (!open) return null;

  const toggleListen = () => {
    if (typeof window === "undefined" || !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      toast.error("Web Speech API is not supported in this browser. You can type your question directly below.");
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = lang;
    recognition.interimResults = false;

    if (!listening) {
      setListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setListening(false);
        handleSendVoiceQuery(text);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };
    } else {
      setListening(false);
      recognition.stop();
    }
  };

  const handleSendVoiceQuery = async (queryText?: string) => {
    const q = queryText || transcript;
    if (!q.trim()) {
      toast.error("Please speak or type a question.");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      // Call backend research / assistance endpoint
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/v3/legal-aid/discover?state=Delhi`);
      
      // Generate voice friendly response
      let answer = "";
      if (q.toLowerCase().includes("deposit") || q.toLowerCase().includes("rent") || q.toLowerCase().includes("kiraya")) {
        answer = "Under Indian Tenancy Laws and the Model Tenancy Act, security deposits cannot be arbitrarily withheld without itemized receipts of actual damage. You have the right to issue a formal legal demand notice under Section 106 of the Transfer of Property Act giving 15 days to refund.";
      } else if (q.toLowerCase().includes("cheque") || q.toLowerCase().includes("bounce")) {
        answer = "Under Section 138 of the Negotiable Instruments Act, upon cheque bounce, you must dispatch a statutory demand notice within 30 days of receiving the memo from your bank. If unpaid within 15 days, a complaint can be filed within 30 days.";
      } else if (q.toLowerCase().includes("free") || q.toLowerCase().includes("aid") || q.toLowerCase().includes("nalsa") || q.toLowerCase().includes("madad")) {
        answer = "Under Section 12 of the Legal Services Authorities Act, 1987, all women, children, SC/ST citizens, custody undertrials, and individuals earning under state income thresholds are entitled to completely free legal representation through NALSA and DLSA. Call the national helpline 15100.";
      } else {
        answer = `Regarding your query "${q}": In India, civil rights are governed by procedural timelines and statutory notices. You should organize all receipts, written agreements, and communication records, and consider filing a formal grievance or consulting a verified advocate through LegalSaathi.`;
      }

      setResponse(answer);

      // Speak answer aloud
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(answer);
        utterance.lang = lang === "hi-IN" ? "hi-IN" : "en-IN";
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setSpeaking(true);
      }
    } catch (err: any) {
      toast.error("Voice inquiry failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeak = () => {
    if (!response || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#E6DFD5] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#706E6B] hover:text-[#1A2B49] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6C687]/30 text-[#8C6D23] border border-[#E6C687]/50">
            <Sparkles className="w-3.5 h-3.5" />
            Voice-First Legal Companion
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1A2B49]">
            Talk to LegalSaathi
          </h3>
          <p className="text-xs text-[#55524E]">
            Speak your legal issue naturally in Hindi or Indian English.
          </p>
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setLang("hi-IN")}
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
              lang === "hi-IN" ? "bg-[#1A2B49] text-white" : "bg-[#F3EDE3] text-[#55524E]"
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => setLang("en-IN")}
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
              lang === "en-IN" ? "bg-[#1A2B49] text-white" : "bg-[#F3EDE3] text-[#55524E]"
            }`}
          >
            English (India)
          </button>
        </div>

        {/* Giant Mic Button */}
        <div className="flex flex-col items-center justify-center space-y-3 py-4">
          <button
            type="button"
            onClick={toggleListen}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              listening
                ? "bg-red-500 text-white animate-pulse ring-8 ring-red-200"
                : "bg-[#1A2B49] hover:bg-[#111C30] text-[#E6C687] hover:scale-105"
            }`}
          >
            {listening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
          <span className="text-xs font-medium text-[#706E6B]">
            {listening ? "Listening... Speak now" : "Tap microphone to speak"}
          </span>
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-[#706E6B] tracking-wider block text-center">
            Or tap a common question:
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {[
              "Mera security deposit wapas nahi mila",
              "Cheque bounce notice timeline",
              "Who gets free NALSA legal aid?",
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(prompt);
                  handleSendVoiceQuery(prompt);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#F3EDE3] hover:bg-[#EAE2D5] text-[11px] text-[#1A2B49] transition-colors cursor-pointer"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Or type your legal question here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendVoiceQuery()}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFBF7] text-xs text-[#1A2B49] focus:outline-hidden focus:ring-2 focus:ring-[#8C6D23]/30"
          />
          <button
            onClick={() => handleSendVoiceQuery()}
            disabled={loading || !transcript.trim()}
            className="p-2.5 rounded-xl bg-[#1A2B49] text-white hover:bg-[#111C30] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#E6C687]" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Spoken Response Card */}
        {response && (
          <div className="p-4 rounded-2xl bg-[#F7F2E8] border border-[#E6DFD5] space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A2B49] flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#8C6D23]" />
                LegalSaathi Spoken Guidance:
              </span>
              <button
                onClick={toggleSpeak}
                className="p-1 rounded-lg text-[#8C6D23] hover:bg-[#EAE2D5] transition-colors"
                title={speaking ? "Stop reading" : "Read aloud again"}
              >
                {speaking ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[#55524E] leading-relaxed">
              {response}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-center text-[#706E6B] leading-tight pt-2 border-t border-[#EAE2D5]">
          LegalSaathi AI provides legal information grounded in Indian statutes. It does not replace professional legal representation by an advocate.
        </p>
      </div>
    </div>
  );
}
