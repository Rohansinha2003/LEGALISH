"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  Briefcase,
  FileText,
  MessageSquareText,
  Search,
  FilePlus2,
  HelpCircle,
  Bell,
  Mic,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { VoiceFirstModal } from "./VoiceFirstModal";
import { ProfileModal } from "./ProfileModal";
import { privacyV3Api, NotificationItem } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check dark mode
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

  // Section 11 Navigation Spec
  const primaryNavLinks = [
    { href: "/", label: "Home" },
    { href: "/cases", label: "My Cases" },
    { href: "/upload", label: "Documents" },
    { href: "/chat", label: "Ask AI" },
    { href: "/caselaw", label: "Legal Research" },
    { href: "/create", label: "Create Document" },
    { href: "/easy-help", label: "Legal Help" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-xs group-hover:bg-[var(--primary-hover)] transition-colors">
              <Scale className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold text-[var(--text-primary)] tracking-tight">LegalSaathi</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] tracking-wider">V4</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-none hidden sm:block">Legal Intelligence Platform</p>
            </div>
          </Link>

          {/* Clean Primary Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {primaryNavLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[var(--surface-secondary)] text-[var(--primary)] font-semibold shadow-2xs border border-[var(--border)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Global Command Palette Trigger (Cmd+K) */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--border)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs transition-colors cursor-pointer"
              title="Search documents, cases & actions (⌘K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[11px] text-[var(--text-muted)]">Search</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--surface)] text-[var(--text-muted)] rounded border border-[var(--border)]">
                ⌘K
              </kbd>
            </button>

            {/* Talk to LegalSaathi Voice Button */}
            <button
              onClick={() => setVoiceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Talk to LegalSaathi (Hindi/English Voice Assistance)"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden md:inline">Voice Assistant</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--border)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifsOpen(!notifsOpen)}
                className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--border)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--error)] text-white text-[9px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Notifications & Deadlines</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{notifications.length} unread</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-[var(--text-primary)] text-[11px] font-semibold">{n.title}</strong>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              n.severity === "high"
                                ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {n.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-tight">{n.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 text-center border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                    <Link
                      href="/dashboard"
                      onClick={() => setNotifsOpen(false)}
                      className="text-[var(--primary)] hover:underline font-medium"
                    >
                      View All Deadlines →
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={() => setNotifsOpen(false)}
                      className="text-[var(--text-muted)] hover:underline"
                    >
                      Privacy Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-1.5 p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--border)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Profile & Settings"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center">
                RS
              </div>
            </button>
          </div>
        </div>
      </header>

      <VoiceFirstModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
