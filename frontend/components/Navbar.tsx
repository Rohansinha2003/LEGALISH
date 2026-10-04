"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  Briefcase,
  PlusCircle,
  FileText,
  Languages,
  Search,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { SearchModal } from "./SearchModal";

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Cases & Dashboard", icon: Briefcase },
    { href: "/cases/new", label: "New Case", icon: PlusCircle, highlight: true },
    { href: "/upload", label: "Upload Doc", icon: FileText },
    { href: "/translate", label: "Multilingual", icon: Languages },
    { href: "/create", label: "Draft Document", icon: Layers },
    { href: "/admin", label: "Admin & Law RAG", icon: Shield },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DFD5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#1A2B49] text-[#FAF7F2] flex items-center justify-center shadow-xs group-hover:bg-[#111C30] transition-colors">
              <Scale className="w-5 h-5 text-[#E6C687]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold text-[#1A2B49] tracking-tight">LegalSaathi</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E6C687]/25 text-[#8C6D23] uppercase tracking-wider">V2</span>
              </div>
              <p className="text-[10px] text-[#706E6B] leading-none">Digital Legal Companion for India</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    link.highlight
                      ? "bg-[#1A2B49] text-white hover:bg-[#111C30] shadow-xs"
                      : isActive
                      ? "bg-[#EFE8DD] text-[#1A2B49] font-semibold"
                      : "text-[#55524E] hover:text-[#1A2B49] hover:bg-[#F3EDE3]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.highlight ? "text-[#E6C687]" : ""}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Search Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DDD5C7] bg-[#F7F2E8] hover:bg-[#EFE8DD] text-[#55524E] hover:text-[#1A2B49] text-xs transition-colors shadow-2xs cursor-pointer"
              title="Global Search (Cmd + K)"
            >
              <Search className="w-3.5 h-3.5 text-[#8C7A63]" />
              <span className="hidden sm:inline">Search cases & docs...</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-[#EAE2D5] text-[#706E6B] rounded border border-[#D5CCBE]">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
