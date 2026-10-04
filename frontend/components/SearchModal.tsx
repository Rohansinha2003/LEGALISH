"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, X, Briefcase, FileText, Shield, FileCheck, Loader2 } from "lucide-react";
import { searchApi, GlobalSearchResult } from "@/lib/api";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult["results"] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
        else openModal();
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const openModal = () => {
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchApi.search(query);
        setResults(res.results);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#FDFAF5] rounded-2xl shadow-2xl border border-[#DDD5C7] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#E6DFD5] bg-[#FAF7F2]">
          <Search className="w-5 h-5 text-[#8C7A63] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases, agreements, evidence, or legal notes..."
            className="flex-1 bg-transparent text-[#1A2B49] text-sm focus:outline-none placeholder-[#9C9488]"
          />
          {loading && <Loader2 className="w-4 h-4 text-[#8C7A63] animate-spin mr-2" />}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8C7A63] hover:text-[#1A2B49] hover:bg-[#EFE8DD] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="text-center py-8 text-[#8C7A63] text-xs">
              Type at least 2 characters to search across your cases, uploaded documents, evidence, and drafts.
            </div>
          )}

          {results && (
            <>
              {/* Cases */}
              {results.cases.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-[#8C7A63] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Cases ({results.cases.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.cases.map((c) => (
                      <Link
                        key={c.id}
                        href={`/cases/${c.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#EBE4D8] hover:border-[#C8B99A] hover:bg-[#F9F5EE] transition-all"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1A2B49]">{c.title}</p>
                          <p className="text-xs text-[#706E6B]">{c.issue_type}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          c.urgency === "critical" ? "bg-red-100 text-red-700" :
                          c.urgency === "high" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {c.urgency.toUpperCase()}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {results.documents.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-[#8C7A63] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Uploaded Documents ({results.documents.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.documents.map((d) => (
                      <Link
                        key={d.id}
                        href={`/analyze?id=${d.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#EBE4D8] hover:border-[#C8B99A] hover:bg-[#F9F5EE] transition-all"
                      >
                        <p className="text-sm font-medium text-[#1A2B49]">{d.name}</p>
                        <span className="text-[10px] text-[#8C7A63] font-mono">{d.status}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence */}
              {results.evidence.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-[#8C7A63] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Evidence Records ({results.evidence.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.evidence.map((e) => (
                      <Link
                        key={e.id}
                        href={`/cases/${e.case_id}?tab=evidence`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#EBE4D8] hover:border-[#C8B99A] hover:bg-[#F9F5EE] transition-all"
                      >
                        <p className="text-sm font-medium text-[#1A2B49]">{e.name}</p>
                        <span className="text-[10px] bg-[#EFE8DD] text-[#55524E] px-2 py-0.5 rounded">{e.evidence_type}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Drafts */}
              {results.drafts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-[#8C7A63] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" /> Generated Drafts ({results.drafts.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.drafts.map((dr) => (
                      <div
                        key={dr.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#EBE4D8]"
                      >
                        <p className="text-sm font-medium text-[#1A2B49]">{dr.title}</p>
                        <span className="text-[10px] text-[#8C7A63]">{dr.doc_type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.cases.length === 0 &&
               results.documents.length === 0 &&
               results.evidence.length === 0 &&
               results.drafts.length === 0 && (
                <div className="text-center py-8 text-[#8C7A63] text-xs">
                  No records found matching &quot;{query}&quot;.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
