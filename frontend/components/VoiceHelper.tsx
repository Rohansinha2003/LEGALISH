"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  lang?: string;
}

export function VoiceInputButton({ onTranscript, lang = "hi-IN" }: VoiceInputButtonProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setSupported(true);
    }
  }, []);

  const toggleListen = () => {
    if (!supported) {
      alert("Voice input is supported in Google Chrome, Edge, and modern browsers with Web Speech API.");
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
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setListening(false);
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

  return (
    <button
      type="button"
      onClick={toggleListen}
      className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
        listening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-[#EFE8DD] text-[#55524E] hover:text-[#1A2B49] hover:bg-[#E5DDCF]"
      }`}
      title={listening ? "Listening... click to stop" : "Speak your issue (Hindi/English voice input)"}
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#8C7A63]" />}
      <span className="hidden sm:inline">{listening ? "Listening..." : "Voice Input"}</span>
    </button>
  );
}

interface ReadAloudButtonProps {
  text: string;
}

export function ReadAloudButton({ text }: ReadAloudButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const toggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 500)); // Read initial summary
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSpeak}
      className="p-1.5 rounded-lg text-xs font-medium bg-[#EFE8DD] text-[#55524E] hover:text-[#1A2B49] hover:bg-[#E5DDCF] flex items-center gap-1 transition-colors cursor-pointer"
      title={speaking ? "Stop reading aloud" : "Read summary aloud"}
    >
      {speaking ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-[#8C7A63]" />}
      <span>{speaking ? "Stop" : "Read Aloud"}</span>
    </button>
  );
}
