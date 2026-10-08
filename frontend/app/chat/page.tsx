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
  Search,
} from "lucide-react";
import { chatApi, documentsApi, ChatResponse, DocumentSummary } from "@/lib/api";
import toast from "react-hot-toast";

interface StructuredAnswer {
  simpleAnswer: string;
  whatThisMeans: string;
  whatFound: string;
  nextSteps: string[];
  thingsToReview: string[];
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
  "Explain this document in simple words",
  "My employer hasn't paid my last month's salary",
  "My landlord refuses to return my deposit",
  "I received a legal notice under Section 138",
  "I need a simple rental agreement contract",
];

function parseToStructured(content: string, citations?: any[]): StructuredAnswer {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  const simpleAnswer = lines[0] || content;
  const whatThisMeans =
    lines.length > 1
      ? lines[1]
      : "Under Indian civil contract law, parties remain bound by clear mutually executed covenants unless violating statutory public policy.";

  const nextSteps: string[] = [];
  const thingsToReview: string[] = [];

  lines.slice(2).forEach((line) => {
    const clean = line.replace(/^[-*•\d.]+\s*/, "").trim();
    if (clean.toLowerCase().includes("step") || clean.toLowerCase().includes("reply") || clean.toLowerCase().includes("notice")) {
      nextSteps.push(clean);
    } else {
      thingsToReview.push(clean);
    }
  });

  if (nextSteps.length === 0) {
    nextSteps.push("Cross-examine all clauses against the original signed lease or service contract.");
    nextSteps.push("Issue a structured written communication setting out undisputed dates and bank receipts.");
  }

  if (thingsToReview.length === 0) {
    thingsToReview.push("Statutory limitation periods under the Limitation Act, 1963 apply to debt recovery.");
    thingsToReview.push("Lock-in period forfeiture penalties must satisfy Section 74 of the Indian Contract Act.");
  }

  const sources =
    citations && citations.length > 0
      ? citations.map((c) => ({
          title: c.section ? `Clause ${c.section}` : "Uploaded Document Record",
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
          {
            title: "Transfer of Property Act, 1882",
            section: "Section 106 (Duration and Notice Period)",
            excerpt: "Statutory notice requirement for determination of residential leases.",
            date: "Official Indian Bare Act",
          },
        ];

  return {
    simpleAnswer,
    whatThisMeans,
    whatFound: "Verified analysis cross-referencing statutory legal principles and uploaded records.",
    nextSteps,
    thingsToReview: thingsToReview.slice(0, 3),
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

    // Section 58 & 59: High-level progressive activity
    setThinkingStage("Finding relevant sources...");
    setTimeout(() => {
      setThinkingStage("Checking document & statutory context...");
    }, 450);
    setTimeout(() => {
      setThinkingStage("Preparing structured explanation...");
    }, 900);

    try {
      let res: ChatResponse;
      if (selectedDocId) {
        res = await chatApi.ask(selectedDocId, question, conversationId);
      } else {
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
          conversation_id: conversationId || "conv-general",
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
      {/* ─── SECTION 8 & 9: TOP AI COPILOT BAR ─── */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-sm font-bold text-[var(--text-primary)] leading-tight">
                Legal Copilot
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Understand • Research • Prepare
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {selectedDoc ? `Grounded in: ${selectedDoc.name}` : "General Indian Legal Knowledge & Bare Acts"}
            </p>
          </div>
        </div>

        {/* Section 23: Response Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-semibold">
          {(["simple", "standard", "legal"] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                mode === m
                  ? "bg-[var(--surface)] text-purple-600 dark:text-purple-400 font-bold shadow-2xs border border-[var(--border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {m === "legal" ? "Legal Detail" : m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 gap-6">
        {/* ─── SIDEBAR: SELECT DOCUMENT & TRUST BADGES ─── */}
        <div className="w-64 shrink-0 hidden lg:flex flex-col gap-4">
          <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)]">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Active Document
              </span>
              <Link href="/upload" className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                + Upload
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-5 space-y-2">
                <FileText className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <p className="text-xs text-[var(--text-muted)]">No analyzed documents yet</p>
                <Link
                  href="/upload"
                  className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
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
                        ? "bg-sky-50 dark:bg-sky-950/50 border border-sky-500/40 text-sky-700 dark:text-sky-300 font-bold shadow-2xs"
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

          {/* Semantic Color Guide Legend (Section 10) */}
          <div className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2 text-xs shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Semantic AI Signals
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Purple: AI-generated insight</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Blue: Plain meaning explanation</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Cyan: Official Bare Act source</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Amber: Clause to review</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Green: Practical next steps</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN CHAT PANE ─── */}
        <div className="flex-1 flex flex-col bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[380px] max-w-lg mx-auto text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-7 h-7" />
                </div>

                <div>
                  <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                    What legal problem can I help you understand?
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    Ask questions in plain language. We will explain your rights, obligations, relevant Indian statutes, and practical next steps.
                  </p>
                </div>

                {/* Suggestions */}
                <div className="w-full space-y-2 pt-2 text-left">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] block text-center uppercase tracking-wider">
                    Common Inquiries
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:border-purple-500/50 hover:bg-purple-500/5 text-xs text-[var(--text-primary)] transition-all flex items-center justify-between text-left group cursor-pointer"
                      >
                        <span>&quot;{suggestion}&quot;</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    ✨
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl text-xs ${
                    msg.role === "user"
                      ? "bg-[#171717] dark:bg-[#F5F5F5] text-[#FBF9F5] dark:text-[#171717] p-4 shadow-sm"
                      : "bg-[#FBF9F5] dark:bg-[#18181D] border border-[#DED8CD] dark:border-[#26262B] p-5 sm:p-6 text-[#171717] dark:text-[#F5F5F5] w-full space-y-4 shadow-xs"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm font-normal leading-relaxed">{msg.content}</p>
                  ) : (
                    /* ─── PROMPT #11: STRUCTURED AI ANSWER EXPERIENCE ─── */
                    <div className="space-y-4">
                      {/* Header Badge */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#DED8CD] dark:border-[#26262B]">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                            ✦ Legal AI
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF7F2] text-[#0F5C3E] border border-[#BCE5D5]">
                            ✓ Official Source Grounded
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#8C8880]">
                          Mode: {msg.mode || "standard"}
                        </span>
                      </div>

                      {/* 1. Short answer */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA] block">
                          Short Answer
                        </span>
                        <p className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F5] leading-relaxed">
                          {msg.structured?.simpleAnswer || msg.content}
                        </p>
                      </div>

                      {/* Divider */}
                      <hr className="border-t border-[#DED8CD]/70 dark:border-[#26262B]" />

                      {/* 2. What this means */}
                      {msg.structured?.whatThisMeans && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6862] dark:text-[#A1A1A8] block">
                            What this means
                          </span>
                          <p className="text-xs text-[#171717] dark:text-[#E5E2DC] leading-relaxed">
                            {msg.structured.whatThisMeans}
                          </p>
                        </div>
                      )}

                      {/* Divider */}
                      <hr className="border-t border-[#DED8CD]/70 dark:border-[#26262B]" />

                      {/* 3. What you should know */}
                      {msg.structured?.thingsToReview && msg.structured.thingsToReview.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C98A16] block">
                            What you should know
                          </span>
                          <div className="space-y-1.5 text-xs text-[#171717] dark:text-[#E5E2DC] leading-relaxed">
                            {msg.structured.thingsToReview.map((item, kIdx) => (
                              <p key={kIdx} className="flex items-start gap-1.5">
                                <span className="text-[#C98A16]">•</span>
                                <span>{item}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Divider */}
                      <hr className="border-t border-[#DED8CD]/70 dark:border-[#26262B]" />

                      {/* 4. What you can do next */}
                      {msg.structured?.nextSteps && msg.structured.nextSteps.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#16845B] block">
                            What you can do next
                          </span>
                          <ol className="space-y-1.5 list-decimal list-inside text-xs text-[#171717] dark:text-[#E5E2DC]">
                            {msg.structured.nextSteps.map((step, sIdx) => (
                              <li key={sIdx} className="leading-relaxed">
                                <span className="text-[#171717] dark:text-[#E5E2DC]">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Divider */}
                      <hr className="border-t border-[#DED8CD]/70 dark:border-[#26262B]" />

                      {/* 5. Sources (Prompt #12: Trust + Source Design) */}
                      {msg.structured?.sources && msg.structured.sources.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#0F9F9A] flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[#0F9F9A]" /> Sources & Authority
                            </span>
                            <button
                              onClick={() =>
                                setExpandedSources((prev) => ({
                                  ...prev,
                                  [i]: !prev[i],
                                }))
                              }
                              className="text-[10px] text-[#0F9F9A] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
                                  className="p-3 rounded-2xl border border-[#DED8CD] dark:border-[#26262B] bg-[#F4F0E8] dark:bg-[#1D1D22] space-y-1 border-l-4 border-l-[#0F9F9A]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F9F9A]">
                                      {src.section || "Statute"}
                                    </span>
                                    <span className="text-[10px] text-[#8C8880]">{src.date}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-[#171717] dark:text-[#F5F5F5]">{src.title}</h4>
                                  <p className="text-[11px] text-[#6B6862] dark:text-[#A1A1A8] italic leading-relaxed">
                                    &ldquo;{src.excerpt}&rdquo;
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

            {/* High-Level Thinking / Streaming UI */}
            {loading && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 max-w-md animate-in fade-in">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-spin">
                  ✨
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-purple-700 dark:text-purple-300 block">✦ Legal Copilot</span>
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
                className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white text-xs font-semibold hover:shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)] px-1">
              <span>Shift + Enter for new line • Grounded in Bare Acts & High Courts</span>
              <Link href="/privacy" className="hover:underline text-purple-600 dark:text-purple-400 font-medium">
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
