"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  ArrowRight,
  Shield,
  HelpCircle,
  Sparkles,
  FileText,
} from "lucide-react";
import { v4Api, VoiceTurnResponse } from "@/lib/api";

export default function EasyLegalHelpPage() {
  const [language, setLanguage] = useState<"hi" | "en">("hi");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [userSpeech, setUserSpeech] = useState("");
  const [response, setResponse] = useState<VoiceTurnResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Default pre-filled example query
  useEffect(() => {
    handleAskQuestion("Mera landlord deposit wapas nahi de raha hai, keh raha hai painting ka kharcha katega");
  }, []);

  async function handleAskQuestion(queryText: string) {
    if (!queryText.trim()) return;
    setUserSpeech(queryText);
    setLoading(true);
    try {
      const res = await v4Api.processVoiceTurn(queryText, language);
      setResponse(res);
      // Auto speak response in browser if supported
      speakText(res.spoken_reply_text, language);
    } catch (err) {
      console.error("Voice turn processing failed", err);
    } finally {
      setLoading(false);
    }
  }

  function speakText(text: string, lang: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  function toggleSpeech() {
    if (isPlayingAudio) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else if (response?.spoken_reply_text) {
      speakText(response.spoken_reply_text, language);
    }
  }

  function simulateMicrophoneInput() {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const query = language === "hi"
        ? "Mera cheque bounce ho gaya hai, samne wala phone nahi utha raha"
        : "My bank return memo says funds insufficient on cheque, what should I do?";
      handleAskQuestion(query);
    }, 1800);
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      {/* High Accessibility Hero */}
      <section className="bg-[#1A2B49] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#C29B38]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6C687]/20 border border-[#E6C687]/40 text-[#E6C687] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {language === "hi" ? "सरल कानूनी सहायता (कम साक्षरता अनुकूल)" : "Easy Legal Help Mode (Plain Audio-First)"}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            {language === "hi" ? "बोलकर अपनी कानूनी समस्या बताएं" : "Speak Your Legal Problem Simply"}
          </h1>
          <p className="text-base sm:text-lg text-[#E2DACB] max-w-2xl mx-auto leading-relaxed">
            {language === "hi"
              ? "कानूनी भाषा को आसान बोलचाल की भाषा में समझें। बिना किसी जटिल शब्द के सीधा रास्ता जानिए।"
              : "Understand your rights in simple, everyday language without complex legal jargon."}
          </p>

          {/* Language Switcher Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setLanguage("hi");
                if (userSpeech) handleAskQuestion(userSpeech);
              }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                language === "hi"
                  ? "bg-[#C29B38] text-[#1A2B49] shadow-md scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              🇮🇳 हिंदी (सरल भाषा)
            </button>
            <button
              onClick={() => {
                setLanguage("en");
                if (userSpeech) handleAskQuestion(userSpeech);
              }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                language === "en"
                  ? "bg-[#C29B38] text-[#1A2B49] shadow-md scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Simple Indian English
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Big Microphone Card */}
        <div className="bg-white rounded-3xl p-8 border-2 border-[#E6DFD5] shadow-md text-center space-y-6">
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={simulateMicrophoneInput}
              disabled={isRecording || loading}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse ring-8 ring-red-100 scale-110"
                  : "bg-[#1A2B49] hover:bg-[#111C30] text-[#E6C687] hover:scale-105 ring-8 ring-[#EAE2D5]"
              }`}
            >
              <Mic className="w-10 h-10" />
              <span className="text-[11px] font-bold mt-1 text-white uppercase tracking-wider">
                {isRecording ? (language === "hi" ? "सुन रहे हैं..." : "Listening...") : (language === "hi" ? "बोलें" : "Tap to Speak")}
              </span>
            </button>

            <p className="text-xs text-[#706E6B] mt-4 font-medium">
              {language === "hi"
                ? "माइक दबाकर बोलें या नीचे दिए गए आम कानूनी प्रश्नों पर क्लिक करें"
                : "Tap the microphone to speak or click an everyday example below"}
            </p>
          </div>

          {/* Common Problem Quick Prompts */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              {
                hi: "मकान मालिक सिक्योरिटी डिपॉजिट नहीं दे रहा",
                en: "Landlord not refunding deposit",
                q_hi: "Mera landlord deposit wapas nahi de raha hai, keh raha hai painting ka kharcha katega",
                q_en: "Landlord refusing to refund deposit citing painting and wear tear",
              },
              {
                hi: "चेक बाउंस (Section 138) हो गया है",
                en: "Cheque bounce / dishonour problem",
                q_hi: "Mera cheque bounce ho gaya hai, notice kaise bhejna hai?",
                q_en: "Cheque bounced due to insufficient funds, what is the notice timeline?",
              },
              {
                hi: "नौकरी से बिना नोटिस हटा दिया",
                en: "Terminated without notice / salary",
                q_hi: "Company ne bina notice aur bina salary diye nikaal diya",
                q_en: "Company terminated me without salary or notice period",
              },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(language === "hi" ? p.q_hi : p.q_en)}
                className="text-xs px-3.5 py-2 rounded-xl border border-[#DDD5C7] bg-[#FAF7F2] hover:bg-[#EFE8DD] text-[#1A2B49] font-medium transition-colors cursor-pointer"
              >
                {language === "hi" ? p.hi : p.en}
              </button>
            ))}
          </div>
        </div>

        {/* Spoken Response & Large Action Box */}
        {response && (
          <div className="bg-white rounded-3xl border-2 border-[#C29B38]/50 shadow-lg overflow-hidden space-y-0">
            {/* Audio Header Bar */}
            <div className="bg-[#FAF7F2] p-6 border-b border-[#E6DFD5] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSpeech}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                    isPlayingAudio ? "bg-[#C29B38] text-[#1A2B49] scale-105" : "bg-[#1A2B49] text-white hover:bg-[#111C30]"
                  }`}
                  title={isPlayingAudio ? "Stop Audio" : "Listen Spoken Audio"}
                >
                  {isPlayingAudio ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 text-[#E6C687]" />}
                </button>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A2B49]">
                    {language === "hi" ? "सरल आवाज में जवाब" : "Plain Spoken Guidance"}
                  </h3>
                  <p className="text-xs text-[#706E6B]">
                    {isPlayingAudio
                      ? (language === "hi" ? "आवाज बज रही है... (रोकने के लिए दबाएं)" : "Speaking guidance aloud...")
                      : (language === "hi" ? "दोबारा सुनने के लिए स्पीकर बटन दबाएं" : "Press speaker to hear aloud")}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {language === "hi" ? "आसान भाषा" : "Simplified"}
              </span>
            </div>

            {/* Response Content Body */}
            <div className="p-8 space-y-6">
              {/* Spoken Paragraph with High Legibility */}
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200">
                <p className="text-base sm:text-lg text-[#1A2B49] font-serif leading-relaxed">
                  "{response.spoken_reply_text}"
                </p>
              </div>

              {/* 3 Clear Action Steps */}
              <div>
                <h4 className="text-sm font-bold text-[#706E6B] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  {language === "hi" ? "आपको क्या करना चाहिए (कदम दर कदम)" : "What You Should Do (Step-by-Step)"}
                </h4>
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD5] space-y-2.5">
                  {response.display_summary.split("\n").map((line, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1A2B49] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-[#2A2826] leading-snug">
                        {line.replace(/^\d+\.\s*/, "")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Next Step */}
              {response.procedural_next_step && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                      {language === "hi" ? "पहला जरूरी कदम" : "Immediate First Step"}
                    </span>
                    <p className="text-xs font-semibold text-emerald-950">
                      {response.procedural_next_step}
                    </p>
                  </div>
                </div>
              )}

              {/* Legal Disclaimer */}
              <p className="text-xs text-[#706E6B] italic border-t border-[#E6DFD5] pt-4">
                {response.disclaimer}
              </p>
            </div>
          </div>
        )}

        {/* Free Legal Aid & NALSA Emergency Box */}
        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border-2 border-[#E6DFD5] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              {language === "hi" ? "मुफ्त सरकारी कानूनी मदद" : "Free Legal Aid Available"}
            </span>
            <h3 className="font-serif text-xl font-bold text-[#1A2B49]">
              {language === "hi" ? "क्या आपको वकील की फीस देने में परेशानी है?" : "Need Help Paying Lawyer Fees?"}
            </h3>
            <p className="text-xs text-[#55524E] max-w-lg">
              {language === "hi"
                ? "नालसा (NALSA) और जिला विधिक सेवा प्राधिकरण (DLSA) के तहत महिलाएं, बच्चे, मजदूर और कम आय वाले नागरिक मुफ्त सरकारी वकील के हकदार हैं।"
                : "Under Section 12 of the Legal Services Authorities Act, eligible citizens can get a government-appointed free advocate."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="tel:15100"
              className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>NALSA Helpline: 15100</span>
            </a>
            <a
              href="/legal-aid"
              className="px-5 py-3 rounded-2xl bg-[#1A2B49] hover:bg-[#111C30] text-white text-xs font-bold transition-colors"
            >
              {language === "hi" ? "पात्रता जांचें" : "Check Eligibility"}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
