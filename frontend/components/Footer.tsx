"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide large footer in the full-screen Document Analysis Studio
  if (pathname?.startsWith("/analyze/")) {
    return null;
  }

  return (
    <footer className="bg-[#171717] text-[#D4D0C7] border-t border-[#26262B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FBF9F5] text-[#171717] flex items-center justify-center font-serif text-sm shadow-xs font-bold">
                ✦
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-tight">
                LEGAL AI
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#26262B] text-[#A1A1A8]">
                V4
              </span>
            </div>
            <p className="text-xs text-[#8C8880] max-w-sm leading-relaxed">
              AI-powered legal intelligence for everyone. Designed to demystify complex legal documents, statutes, rights, and next steps in India.
            </p>
            <div className="pt-2 text-[11px] text-[#6B6862] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16845B]" />
              <span>Grounded in official Indian Bare Acts & Supreme Court precedents.</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-2 text-xs text-[#A1A1A8]">
              <li><Link href="/chat" className="hover:text-white transition-colors">Legal AI Copilot</Link></li>
              <li><Link href="/upload" className="hover:text-white transition-colors">Document Intelligence</Link></li>
              <li><Link href="/caselaw" className="hover:text-white transition-colors">Precedent Research</Link></li>
              <li><Link href="/translate" className="hover:text-white transition-colors">Multilingual Translation</Link></li>
              <li><Link href="/create" className="hover:text-white transition-colors">Document Generator</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Resources</h4>
            <ul className="space-y-2 text-xs text-[#A1A1A8]">
              <li><Link href="/easy-help" className="hover:text-white transition-colors">Help Center & Guides</Link></li>
              <li><Link href="/procedures" className="hover:text-white transition-colors">Legal Procedures</Link></li>
              <li><Link href="/caselaw" className="hover:text-white transition-colors">Bare Acts & Citations</Link></li>
              <li><Link href="/legal-aid" className="hover:text-white transition-colors">DLSA / NALSA Legal Aid</Link></li>
              <li><Link href="/lawyer-workspace" className="hover:text-white transition-colors">Advocate Workspace</Link></li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal & Trust</h4>
            <ul className="space-y-2 text-xs text-[#A1A1A8]">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy & DPDP 2023</Link></li>
              <li><Link href="/privacy#terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy#disclaimer" className="hover:text-white transition-colors">Statutory Disclaimer</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Security & Audit Logs</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#26262B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6B6862]">
          <p>© {new Date().getFullYear()} Legal AI (LegalSaathi V4). All rights reserved.</p>
          <p className="max-w-md text-center sm:text-right">
            Legal AI is an informational technology platform, not a law firm. It does not provide legal representation.
          </p>
        </div>
      </div>
    </footer>
  );
}
