"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  Search,
  Bell,
  Mic,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { VoiceFirstModal } from "./VoiceFirstModal";
import { ProfileModal } from "./ProfileModal";
import { privacyV3Api, NotificationItem } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();

  // Hide global navbar in full-screen Document Analysis Studio
  if (pathname?.startsWith("/analyze/")) {
    return null;
  }

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }

    async function loadNotifications() {
      try {
        const notifs = await privacyV3Api.notifications();
        setNotifications(notifs || []);
      } catch (err) {
        setNotifications([
          {
            id: "1",
            title: "Limitation Act Notice",
            message: "Deposit refund demand notice response window expires in 3 days.",
            notification_type: "deadline",
            severity: "high",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Document Ready",
            message: "Residential Rental Agreement draft is ready for review.",
            notification_type: "document",
            severity: "medium",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }
    loadNotifications();
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { href: "/upload", label: "Product" },
    { href: "/cases", label: "Solutions" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/caselaw", label: "Research" },
    { href: "/chat", label: "Ask AI", badge: "AI" },
    { href: "/procedures", label: "Resources" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 dark:bg-[#151518]/90 backdrop-blur-md border-b border-[#DED8CD]/70 dark:border-[#26262B] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity (Prompt #3 & #5) */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#171717] dark:bg-[#F5F5F5] text-[#FBF9F5] dark:text-[#171717] flex items-center justify-center font-serif text-sm shadow-xs transition-transform group-hover:scale-105">
              ✦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#171717] dark:text-[#F5F5F5]">
                  LEGAL AI
                </span>
                <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#EAE5DA] dark:bg-[#26262B] text-[#6B6862] dark:text-[#A1A1A8]">
                  V4
                </span>
              </div>
              <p className="text-[10px] text-[#6B6862] dark:text-[#787882] leading-none hidden xl:block font-medium">
                AI-powered legal intelligence for everyone.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : !link.href.includes("#") && pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#EFE9DE] dark:bg-[#23232A] text-[#171717] dark:text-[#F5F5F5] font-semibold border border-[#DED8CD] dark:border-[#32323A]"
                      : "text-[#6B6862] dark:text-[#A1A1A8] hover:text-[#171717] dark:hover:text-[#F5F5F5] hover:bg-[#EAE5DA]/60 dark:hover:bg-[#1D1D22]"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#F5F1FD] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 border border-[#DDD2FA] dark:border-purple-800">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search ⌘K */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DED8CD] dark:border-[#26262B] bg-[#F4F0E8] dark:bg-[#1D1D22] hover:bg-[#EFE9DE] text-[#6B6862] hover:text-[#171717] text-xs transition-colors cursor-pointer"
              title="Search documents, cases & actions (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-[#8C8880]" />
              <span className="text-[11px]">Search</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#FBF9F5] dark:bg-[#151518] text-[#8C8880] rounded border border-[#DED8CD] dark:border-[#26262B]">
                ⌘K
              </kbd>
            </button>

            {/* Voice Assistant */}
            <button
              onClick={() => setVoiceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DED8CD] dark:border-[#26262B] bg-[#F4F0E8] dark:bg-[#1D1D22] hover:bg-[#EFE9DE] text-[#171717] dark:text-[#F5F5F5] text-xs font-medium transition-all cursor-pointer"
              title="Speak in Indian regional languages"
            >
              <Mic className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="hidden sm:inline text-[11px]">Voice</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full border border-[#DED8CD] dark:border-[#26262B] bg-[#F4F0E8] dark:bg-[#1D1D22] text-[#6B6862] hover:text-[#171717] transition-colors cursor-pointer"
              title={isDark ? "Switch to Warm Ivory" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#6B6862]" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifsOpen(!notifsOpen)}
                className="p-2 rounded-full border border-[#DED8CD] dark:border-[#26262B] bg-[#F4F0E8] dark:bg-[#1D1D22] text-[#6B6862] hover:text-[#171717] relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#D95C55] text-white text-[8px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#FBF9F5] dark:bg-[#151518] border border-[#DED8CD] dark:border-[#26262B] shadow-xl p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DED8CD] dark:border-[#26262B]">
                    <span className="text-xs font-bold text-[#171717] dark:text-[#F5F5F5]">Statutory Deadlines & Alerts</span>
                    <span className="text-[10px] text-[#6B6862]">{notifications.length} unread</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-[#F4F0E8] dark:bg-[#1D1D22] border border-[#DED8CD] dark:border-[#26262B] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-[#171717] dark:text-[#F5F5F5] text-[11px] font-semibold">{n.title}</strong>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              n.severity === "high"
                                ? "bg-[#FAEDED] text-[#D95C55]"
                                : "bg-[#FAF4E6] text-[#C98A16]"
                            }`}
                          >
                            {n.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B6862] leading-tight">{n.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 text-center border-t border-[#DED8CD] dark:border-[#26262B] flex items-center justify-between text-[11px]">
                    <Link
                      href="/dashboard"
                      onClick={() => setNotifsOpen(false)}
                      className="text-[#4F46E5] hover:underline font-semibold"
                    >
                      View All Deadlines →
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={() => setNotifsOpen(false)}
                      className="text-[#6B6862] hover:underline"
                    >
                      Privacy Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sign in Button */}
            <button
              onClick={() => setProfileOpen(true)}
              className="text-xs font-semibold text-[#6B6862] dark:text-[#A1A1A8] hover:text-[#171717] dark:hover:text-[#F5F5F5] px-2.5 py-1.5 cursor-pointer hidden sm:block transition-colors"
            >
              Sign in
            </button>

            {/* Primary Get Started Button (Prompt #5) */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#171717] dark:bg-[#F5F5F5] hover:bg-[#2B2B2B] dark:hover:bg-[#E5E5E5] text-[#FBF9F5] dark:text-[#171717] text-xs font-semibold shadow-xs hover:shadow-sm transition-all group cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <VoiceFirstModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
