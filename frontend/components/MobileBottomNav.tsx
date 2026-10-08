"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Sparkles, FileText, User } from "lucide-react";
import { ProfileModal } from "./ProfileModal";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  // Hide mobile nav in full-screen Document Analysis Studio
  if (pathname?.startsWith("/analyze/")) {
    return null;
  }

  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cases", label: "Cases", icon: Briefcase },
    { href: "/chat", label: "Ask AI", icon: Sparkles, isAi: true },
    { href: "/upload", label: "Documents", icon: FileText },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] px-3 py-1.5 shadow-xl"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            if (tab.isAi) {
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex flex-col items-center justify-center -translate-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-active:scale-95 transition-transform">
                    <Sparkles className="w-6 h-6 text-pink-100" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                    Ask AI
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-transform ${
                    isActive ? "scale-110 bg-indigo-50 dark:bg-indigo-950/60" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              </Link>
            );
          })}

          {/* Profile Tab Button */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <div className="p-1 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Profile</span>
          </button>
        </div>
      </nav>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
