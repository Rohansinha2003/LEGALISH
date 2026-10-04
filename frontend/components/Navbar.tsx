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
  GitCompare,
  UserCheck,
  HeartHandshake,
  BookOpen,
  CreditCard,
  Lock,
  Bell,
  Mic,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SearchModal } from "./SearchModal";
import { VoiceFirstModal } from "./VoiceFirstModal";
import { privacyV3Api, NotificationItem } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [simpleMode, setSimpleMode] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const notifs = await privacyV3Api.notifications();
        setNotifications(notifs || []);
      } catch (err) {
        // Fallback sample notification
        setNotifications([
          {
            id: "1",
            title: "Limitation Act Alert",
            message: "Deposit refund demand notice response window expires in 14 days.",
            notification_type: "deadline",
            severity: "high",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "NALSA Legal Aid Eligible",
            message: "Delhi State Legal Services Authority resource matched for your case.",
            notification_type: "legal_aid",
            severity: "medium",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }
    loadNotifications();
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/caselaw", label: "Case-Law", icon: Scale },
    { href: "/easy-help", label: "Easy Help", icon: Sparkles },
    { href: "/compare", label: "Redline", icon: GitCompare },
    { href: "/lawyer-workspace", label: "Lawyer Portal", icon: UserCheck },
    { href: "/ngo", label: "NGO Clinic", icon: HeartHandshake },
    { href: "/procedures", label: "Procedures", icon: BookOpen },
    { href: "/pricing", label: "Plans", icon: CreditCard },
    { href: "/privacy", label: "DPDP", icon: Lock },
    { href: "/admin", label: "Admin", icon: Shield },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DFD5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#1A2B49] text-[#FAF7F2] flex items-center justify-center shadow-xs group-hover:bg-[#111C30] transition-colors">
              <Scale className="w-5 h-5 text-[#E6C687]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold text-[#1A2B49] tracking-tight">LegalSaathi</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E6C687]/30 text-[#8C6D23] uppercase tracking-wider">V4</span>
              </div>
              <p className="text-[10px] text-[#706E6B] leading-none hidden sm:block">Legal Intelligence Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#EFE8DD] text-[#1A2B49] font-semibold"
                      : "text-[#55524E] hover:text-[#1A2B49] hover:bg-[#F3EDE3]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Talk to LegalSaathi Voice Button */}
            <button
              onClick={() => setVoiceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A2B49] hover:bg-[#111C30] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Talk to LegalSaathi (Hindi/English Voice Assistance)"
            >
              <Mic className="w-3.5 h-3.5 text-[#E6C687]" />
              <span className="hidden sm:inline">Voice Assistant</span>
            </button>

            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#DDD5C7] bg-[#F7F2E8] hover:bg-[#EFE8DD] text-[#55524E] hover:text-[#1A2B49] text-xs transition-colors shadow-2xs cursor-pointer"
              title="Search cases, laws & documents (Cmd + K)"
            >
              <Search className="w-3.5 h-3.5 text-[#8C7A63]" />
              <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-[#EAE2D5] text-[#706E6B] rounded border border-[#D5CCBE]">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifsOpen(!notifsOpen)}
                className="p-2 rounded-lg border border-[#DDD5C7] bg-[#F7F2E8] hover:bg-[#EFE8DD] text-[#55524E] hover:text-[#1A2B49] relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-[#8C7A63]" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[9px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD5] shadow-xl p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D5]">
                    <span className="text-xs font-bold text-[#1A2B49]">Recent Alerts</span>
                    <span className="text-[10px] text-[#706E6B]">{notifications.length} unread</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6DFD5] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-[#1A2B49] text-[11px] font-semibold">{n.title}</strong>
                          <span className="text-[9px] uppercase font-bold text-[#B91C1C] bg-red-100 px-1.5 py-0.2 rounded">
                            {n.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#55524E] leading-tight">{n.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 text-center border-t border-[#EAE2D5]">
                    <Link
                      href="/privacy"
                      onClick={() => setNotifsOpen(false)}
                      className="text-[11px] text-[#8C6D23] hover:underline font-medium"
                    >
                      Manage DPDP Notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Simple Accessibility Mode Toggle */}
            <button
              onClick={() => {
                const next = !simpleMode;
                setSimpleMode(next);
                document.documentElement.classList.toggle("accessibility-simple-mode", next);
              }}
              className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                simpleMode
                  ? "bg-[#1A2B49] text-white border-[#1A2B49]"
                  : "border-[#DDD5C7] bg-[#F7F2E8] text-[#55524E] hover:bg-[#EFE8DD]"
              }`}
              title={simpleMode ? "Simple Mode Active" : "Toggle Simple Accessibility Mode"}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <VoiceFirstModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </>
  );
}
