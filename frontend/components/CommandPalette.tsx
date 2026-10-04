"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Briefcase,
  Sparkles,
  Scale,
  Languages,
  PlusCircle,
  HeartHandshake,
  UserCheck,
  Shield,
  ArrowRight,
  Command,
  X,
  FilePlus,
} from "lucide-react";

interface CommandItem {
  id: string;
  category: "Actions" | "Navigation" | "Recent";
  title: string;
  subtitle?: string;
  icon: any;
  href?: string;
  action?: () => void;
}

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommandPalette({ isOpen: propIsOpen, onClose: propOnClose }: CommandPaletteProps = {}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalOpen(false);
  };

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleToggle = () => setInternalOpen((prev) => !prev);
    const handleOpen = () => setInternalOpen(true);
    window.addEventListener("open-command-palette", handleOpen);

    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);

    return () => {
      window.removeEventListener("open-command-palette", handleOpen);
      window.removeEventListener("keydown", handleGlobalKey);
    };
  }, []);

  const commandItems: CommandItem[] = [
    {
      id: "ask-ai",
      category: "Actions",
      title: "Ask Legal AI Copilot",
      subtitle: "Ask any legal question in plain language",
      icon: Sparkles,
      href: "/chat",
    },
    {
      id: "upload-doc",
      category: "Actions",
      title: "Upload & Explain Document",
      subtitle: "Analyze rental agreement, notice, or contract",
      icon: FilePlus,
      href: "/upload",
    },
    {
      id: "create-doc",
      category: "Actions",
      title: "Create Legal Document / Notice",
      subtitle: "Step-by-step drafted notice or agreement",
      icon: PlusCircle,
      href: "/create",
    },
    {
      id: "easy-help",
      category: "Actions",
      title: "Easy Legal Help (Voice Mode)",
      subtitle: "Audio-first assistance in Hindi & English",
      icon: HeartHandshake,
      href: "/easy-help",
    },
    {
      id: "translate",
      category: "Actions",
      title: "Translate Legal Text",
      subtitle: "Between English and 14 Indian languages",
      icon: Languages,
      href: "/translate",
    },
    {
      id: "nav-cases",
      category: "Navigation",
      title: "My Cases & Matters",
      subtitle: "Active legal workspaces and evidence lockers",
      icon: Briefcase,
      href: "/dashboard",
    },
    {
      id: "nav-caselaw",
      category: "Navigation",
      title: "Legal Research & Precedents",
      subtitle: "Search Supreme Court decisions and citations",
      icon: Scale,
      href: "/caselaw",
    },
    {
      id: "nav-lawyers",
      category: "Navigation",
      title: "Find Verified Advocate",
      subtitle: "Bar Council verified lawyers directory",
      icon: UserCheck,
      href: "/lawyers",
    },
    {
      id: "nav-legal-aid",
      category: "Navigation",
      title: "NALSA Free Legal Aid",
      subtitle: "Section 12 eligibility and DLSA clinics",
      icon: Shield,
      href: "/legal-aid",
    },
    {
      id: "nav-lawyer-workspace",
      category: "Navigation",
      title: "Advocate Professional Portal",
      subtitle: "Document audit queue and SHA-256 signing",
      icon: Briefcase,
      href: "/lawyer-workspace",
    },
    {
      id: "nav-ngo",
      category: "Navigation",
      title: "NGO / Legal Clinic Manager",
      subtitle: "Caseworker intake and DLSA compliance",
      icon: HeartHandshake,
      href: "/ngo",
    },
  ];

  const filteredItems = commandItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) handleClose();
        else {
          // Open handled by parent or toggle
        }
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  function executeItem(item: CommandItem) {
    handleClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  }

  if (!isOpen) return null;

  // Group by category
  const categories = Array.from(new Set(filteredItems.map((i) => i.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-[var(--surface)] text-[var(--text-primary)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
          <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search cases, or ask a question..."
            className="flex-1 text-sm bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--text-muted)] bg-[var(--surface-secondary)] rounded border border-[var(--border)]">
            ESC
          </kbd>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching actions or documents found for "{query}".
            </div>
          ) : (
            categories.map((cat) => {
              const itemsInCat = filteredItems.filter((i) => i.category === cat);
              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {cat}
                  </div>
                  {itemsInCat.map((item) => {
                    const globalIdx = filteredItems.indexOf(item);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-white text-indigo-600 shadow-xs" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px]">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px]">↵</kbd> to select
            </span>
          </div>
          <span>LegalSaathi V4 Command Center</span>
        </div>
      </div>
    </div>
  );
}
