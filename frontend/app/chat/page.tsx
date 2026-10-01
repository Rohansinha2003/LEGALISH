"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  Send,
  MessageSquare,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Shield,
  FileText,
  User,
  Bot,
} from "lucide-react";
import { chatApi, documentsApi, ChatResponse, DocumentSummary } from "@/lib/api";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: { page_number: number; section?: string; excerpt: string }[];
  confidence?: string;
  is_high_risk?: boolean;
  high_risk_recommendation?: string;
  found_in_document?: boolean;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("documentId") || "";
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [selectedDocId, setSelectedDocId] = useState(initialDocId);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    documentsApi
      .list()
      .then((docs) => setDocuments(docs.filter((d) => d.status === "ready")))
      .catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedDocId || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res: ChatResponse = await chatApi.ask(selectedDocId, question, conversationId);
      setConversationId(res.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          citations: res.citations,
          confidence: res.confidence,
          is_high_risk: res.is_high_risk,
          high_risk_recommendation: res.high_risk_recommendation,
          found_in_document: res.found_in_document,
        },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to get answer";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process your question. Please try again.", found_in_document: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId);
  const readyDocs = documents.filter((d) => d.status === "ready");

  return (
    <div className="page-container flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-white/5 flex-shrink-0">
        <div className="content-container">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">LegalSaathi</span>
            </Link>
            <Link href="/dashboard" className="btn-ghost text-sm">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-5xl mx-auto w-full px-4 py-4 gap-4">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-3">
          <div className="glass rounded-xl p-4 border border-white/5">
            <p className="section-label mb-3">Select Document</p>
            {readyDocs.length === 0 ? (
              <div className="text-center py-4">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No analyzed documents yet</p>
                <Link href="/upload" className="text-xs text-violet-400 hover:text-violet-300 mt-2 block">
                  Upload a document →
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {readyDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => { setSelectedDocId(doc.id); setMessages([]); setConversationId(undefined); }}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                      selectedDocId === doc.id
                        ? "bg-violet-500/20 border border-violet-500/30 text-white"
                        : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.file_type.toUpperCase()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="disclaimer-box">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs">Answers are based only on your uploaded document.</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Document header */}
          {selectedDoc && (
            <div className="glass rounded-xl p-3 mb-3 border border-white/5 flex items-center gap-3">
              <FileText className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">{selectedDoc.name}</span>
              <Link href={`/analyze/${selectedDoc.id}`} className="ml-auto text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View analysis <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-violet-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white mb-2">Ask about your document</p>
                  <p className="text-sm text-slate-400 max-w-xs">
                    {selectedDocId
                      ? "Ask any question about your document. Answers will be grounded in what the document actually says."
                      : "Select a document from the sidebar to start asking questions."}
                  </p>
                </div>
                {selectedDocId && (
                  <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                    {[
                      "What are my main obligations?",
                      "What happens if I miss a payment?",
                      "Can the other party terminate this early?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-left text-sm text-slate-300 glass rounded-lg px-3 py-2 border border-white/5 hover:border-violet-500/30 hover:text-white transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-violet-400" />
                  </div>
                )}
                <div className={msg.role === "user" ? "chat-message-user" : "chat-message-ai"}>
                  <p className="text-sm leading-relaxed text-slate-200">{msg.content}</p>

                  {msg.role === "assistant" && (
                    <>
                      {/* Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.citations.map((cit, j) => (
                            <span key={j} className="citation-link">
                              <ExternalLink className="w-3 h-3" />
                              {cit.section || `Page ${cit.page_number}`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Not found warning */}
                      {msg.found_in_document === false && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          This information was not found in the uploaded document.
                        </p>
                      )}

                      {/* High risk */}
                      {msg.is_high_risk && msg.high_risk_recommendation && (
                        <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2">
                          <Shield className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          <p className="text-xs text-rose-300">{msg.high_risk_recommendation}</p>
                        </div>
                      )}

                      {msg.confidence && (
                        <p className="text-xs text-slate-600 mt-2">
                          Confidence: {msg.confidence}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-violet-400" />
                </div>
                <div className="chat-message-ai">
                  <div className="dot-pulse">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="glass rounded-xl border border-white/5 p-3 flex items-end gap-3 flex-shrink-0">
            <textarea
              className="input-field resize-none min-h-[44px] max-h-[120px] py-2.5"
              placeholder={selectedDocId ? "Ask something about this document..." : "Select a document first..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!selectedDocId || loading}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !selectedDocId || loading}
              className="btn-primary py-2.5 px-4 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="page-container flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
