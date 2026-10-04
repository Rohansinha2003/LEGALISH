"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, MessageSquareText, FileText, User } from "lucide-react";
import { ProfileModal } from "./ProfileModal";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cases", label: "Cases", icon: Briefcase },
    { href: "/chat", label: "Ask AI", icon: MessageSquareText },
    { href: "/upload", label: "Documents", icon: FileText },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] px-2 py-1.5 shadow-lg"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-[var(--primary)] font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? "scale-110 bg-[var(--primary-subtle)]" : ""
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
            <div className="p-1 rounded-lg">
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
