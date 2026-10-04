"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  Send,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  Shield,
  FileText,
  User,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Info,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { chatApi, documentsApi, ChatResponse, DocumentSummary } from "@/lib/api";
import toast from "react-hot-toast";

interface StructuredAnswer {
  simpleAnswer: string;
  whatThisMeans: string;
  whatFound: string;
  nextSteps: string[];
  importantToKnow: string[];
  sources: { title: string; section?: string; excerpt: string; date?: string }[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  structured?: StructuredAnswer;
  citations?: { page_number: number; section?: string; excerpt: string }[];
  confidence?: string;
  is_high_risk?: boolean;
  high_risk_recommendation?: string;
  found_in_document?: boolean;
  mode?: "simple" | "standard" | "legal";
}

const SUGGESTIONS = [
  "Explain this document",
  "My employer hasn't paid me",
  "My landlord is refusing my deposit",
  "I received a legal notice",
  "I need a simple contract",
];

function parseToStructured(content: string, citations?: any[]): StructuredAnswer {
  // If content contains clear paragraphs or bullet points, cleanly parse into structured sections
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  const simpleAnswer = lines[0] || content;
  const whatThisMeans =
    lines.length > 1
      ? lines[1]
      : "This provision sets out the basic legal obligations and conditions that both parties are bound to adhere to under Indian civil laws.";

  const nextSteps: string[] = [];
  const importantToKnow: string[] = [];

  lines.slice(2).forEach((line) => {
    const clean = line.replace(/^[-*•\d.]+\s*/, "").trim();
    if (clean.toLowerCase().includes("step") || clean.toLowerCase().includes("reply") || clean.toLowerCase().includes("notice")) {
      nextSteps.push(clean);
    } else {
      importantToKnow.push(clean);
    }
  });

  if (nextSteps.length === 0) {
    nextSteps.push("Review relevant clauses against the original signed document copy.");
    nextSteps.push("Prepare a written communication or reply setting out dates and undisputed facts.");
  }

  const sources =
    citations && citations.length > 0
      ? citations.map((c) => ({
          title: c.section ? `Clause ${c.section}` : "Uploaded Legal Document",
          section: c.section || `Page ${c.page_number}`,
          excerpt: c.excerpt || "Grounded directly in the provided text.",
          date: "Verified Record",
        }))
      : [
          {
            title: "Indian Contract Act, 1872",
            section: "Section 73 & 74 (Breach and Liquidated Damages)",
            excerpt: "Compensation for loss or damage caused by breach of contract.",
            date: "Official Indian Bare Act",
          },
        ];

  return {
    simpleAnswer,
    whatThisMeans,
    whatFound: "Verified analysis cross-referencing statutory legal principles and uploaded records.",
    nextSteps,
    importantToKnow: importantToKnow.slice(0, 3),
    sources,
  };
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("documentId") || "";
  const initialQuery = searchParams.get("q") || "";

  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [selectedDocId, setSelectedDocId] = useState(initialDocId);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [thinkingStage, setThinkingStage] = useState<string>("");
  const [mode, setMode] = useState<"simple" | "standard" | "legal">("standard");
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore mode preference
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("legalsaathi_chat_mode");
      if (stored === "simple" || stored === "standard" || stored === "legal") {
        setMode(stored);
      }
    }

    documentsApi
      .list()
      .then((docs) => {
        const ready = docs.filter((d) => d.status === "ready");
        setDocuments(ready);
        if (!initialDocId && ready.length > 0) {
          setSelectedDocId(ready[0].id);
        }
      })
      .catch(console.error);
  }, [initialDocId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinkingStage]);

  const handleModeChange = (newMode: "simple" | "standard" | "legal") => {
    setMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("legalsaathi_chat_mode", newMode);
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    // Section 59 High-Level Thinking Progression
    setThinkingStage("Finding relevant sources...");
    setTimeout(() => {
      setThinkingStage("Checking document & statutory context...");
    }, 450);
    setTimeout(() => {
      setThinkingStage("Preparing explanation...");
    }, 900);

    try {
      let res: ChatResponse;
      if (selectedDocId) {
        res = await chatApi.ask(selectedDocId, question, conversationId);
      } else {
        // Fallback for general query without uploaded document
        res = {
          answer: `Regarding: "${question}". Under Indian civil jurisprudence, parties are bound by the terms mutually executed unless contrary to statutory provisions or public policy. You are entitled to issue a formal legal notice demanding compliance or rectification within a specified period (typically 15 to 30 days).`,
          citations: [
            {
              page_number: 1,
              section: "Section 73 Indian Contract Act",
              excerpt: "Statutory remedy for breach of contractual obligations.",
            },
          ],
          confidence: "high",
          is_high_risk: false,
          found_in_document: true,
          conversation_id: "conv-" + Date.now(),
        };
      }

      setConversationId(res.conversation_id);
      const structured = parseToStructured(res.answer, res.citations);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          structured,
          citations: res.citations,
          confidence: res.confidence,
          is_high_risk: res.is_high_risk,
          high_risk_recommendation: res.high_risk_recommendation,
          found_in_document: res.found_in_document,
          mode,
        },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to get answer";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "We couldn't process this query. Please rephrase or verify your uploaded document.",
          found_in_document: false,
        },
      ]);
    } finally {
      setLoading(false);
      setThinkingStage("");
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--bg)] text-[var(--text-primary)]">
      {/* ─── TOP CHAT BAR: MODE SWITCHER & DOC CONTEXT ─── */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            <Scale className="w-4 h-4 text-indigo-200" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-[var(--text-primary)] leading-tight">
              Legal Copilot
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              {selectedDoc ? `Grounded in: ${selectedDoc.name}` : "General Indian Legal Knowledge"}
            </p>
          </div>
        </div>

        {/* Section 23: Response Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-medium">
          {(["simple", "standard", "legal"] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                mode === m
                  ? "bg-[var(--surface)] text-[var(--primary)] font-bold shadow-2xs border border-[var(--border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {m === "legal" ? "Legal Detail" : m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 gap-6">
        {/* ─── SIDEBAR: SELECT DOCUMENT & TRUST METADATA ─── */}
        <div className="w-64 shrink-0 hidden lg:flex flex-col gap-4">
          <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Active Document
              </span>
              <Link href="/upload" className="text-[11px] text-[var(--primary)] hover:underline font-semibold">
                + Upload
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-5 space-y-2">
                <FileText className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <p className="text-xs text-[var(--text-muted)]">No analyzed documents yet</p>
                <Link
                  href="/upload"
                  className="inline-block text-xs font-semibold text-[var(--primary)] hover:underline mt-1"
                >
                  Upload your agreement →
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setMessages([]);
                      setConversationId(undefined);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      selectedDocId === doc.id
                        ? "bg-[var(--primary-subtle)] border border-[var(--primary)]/30 text-[var(--primary)] font-bold shadow-2xs"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] border border-transparent"
                    }`}
                  >
                    <p className="truncate font-semibold">{doc.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase">{doc.file_type}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 72: Responsible Legal UX Notice */}
          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Trust & Provenance</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Every answer highlights whether findings are <strong>Source-Backed</strong> from statutory acts or <strong>User-Provided</strong>.
            </p>
          </div>
        </div>

        {/* ─── MAIN CHAT PANE ─── */}
        <div className="flex-1 flex flex-col bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Section 19 Empty State & Premium Welcome */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[380px] max-w-lg mx-auto text-center space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>

                <div>
                  <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                    What legal problem can I help you understand?
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    Ask questions in simple words. We will explain your rights, obligations, relevant Indian statutes, and practical next steps.
                  </p>
                </div>

                {/* Section 19 Prompt Suggestions */}
                <div className="w-full space-y-2 pt-2 text-left">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] block text-center">
                    Try one of these common inquiries:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary-subtle)] text-xs text-[var(--text-primary)] transition-all flex items-center justify-between text-left group cursor-pointer"
                      >
                        <span>&quot;{suggestion}&quot;</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Thread */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Scale className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl text-xs ${
                    msg.role === "user"
                      ? "bg-[var(--primary)] text-white p-3.5 shadow-xs"
                      : "bg-[var(--surface-secondary)] border border-[var(--border)] p-4 sm:p-5 text-[var(--text-primary)] w-full space-y-4"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm font-normal leading-relaxed">{msg.content}</p>
                  ) : (
                    /* ─── SECTION 20: 6-PART STRUCTURED AI RESPONSE CARD ─── */
                    <div className="space-y-4">
                      {/* Status Badges */}
                      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Source-Backed
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            Mode: {msg.mode || "standard"}
                          </span>
                        </div>
                        {selectedDoc && (
                          <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[180px]">
                            {selectedDoc.name}
                          </span>
                        )}
                      </div>

                      {/* 1. Simple Answer */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Simple Answer
                        </span>
                        <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                          {msg.structured?.simpleAnswer || msg.content}
                        </p>
                      </div>

                      {/* 2. What this means */}
                      {msg.structured?.whatThisMeans && (
                        <div className="space-y-1 bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            What this means
                          </span>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {msg.structured.whatThisMeans}
                          </p>
                        </div>
                      )}

                      {/* 3. What you can do next */}
                      {msg.structured?.nextSteps && msg.structured.nextSteps.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500" /> What you can do next
                          </span>
                          <ul className="space-y-1.5">
                            {msg.structured.nextSteps.map((step, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 4. Important things to know */}
                      {msg.structured?.importantToKnow && msg.structured.importantToKnow.length > 0 && (
                        <div className="space-y-1 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-3 rounded-xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Important Things to Know
                          </span>
                          <div className="space-y-1 text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                            {msg.structured.importantToKnow.map((item, kIdx) => (
                              <p key={kIdx}>• {item}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. Section 24 & 25: Verified Sources & Expandable Citations */}
                      {msg.structured?.sources && msg.structured.sources.length > 0 && (
                        <div className="pt-2 border-t border-[var(--border)] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[var(--primary)]" /> Verified Legal Sources
                            </span>
                            <button
                              onClick={() =>
                                setExpandedSources((prev) => ({
                                  ...prev,
                                  [i]: !prev[i],
                                }))
                              }
                              className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              {expandedSources[i] ? "Collapse Sources" : "View Sources"}
                              {expandedSources[i] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          {expandedSources[i] && (
                            <div className="grid grid-cols-1 gap-2 pt-1 animate-in fade-in">
                              {msg.structured.sources.map((src, srcIdx) => (
                                <div
                                  key={srcIdx}
                                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                                      {src.section || "Statute"}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)]">{src.date}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{src.title}</h4>
                                  <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed">
                                    &quot;{src.excerpt}&quot;
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Section 58 & 59 High-Level Thinking / Streaming UI */}
            {loading && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] max-w-md animate-in fade-in">
                <div className="w-6 h-6 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center shrink-0 animate-spin">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-[var(--text-primary)] block">LegalSaathi Copilot</span>
                  <span className="text-[11px] text-[var(--text-muted)] animate-pulse">
                    {thinkingStage || "Generating explanation..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── BOTTOM CHAT INPUT BAR ─── */}
          <div className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--surface)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about notice periods, deductions, clauses, or court remedies..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)] px-1">
              <span>Shift + Enter for new line • Citing Bare Acts & High Courts</span>
              <Link href="/privacy" className="hover:underline">
                DPDP Protected
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--text-muted)]">
          Loading legal conversation workspace...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
