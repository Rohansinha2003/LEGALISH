"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Languages,
  Shield,
  Bell,
  CreditCard,
  Moon,
  Sun,
  Eye,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INDIAN_LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
];

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "language" | "accessibility" | "privacy" | "notifications" | "security" | "subscription"
  >("profile");

  const [selectedLang, setSelectedLang] = useState("en");
  const [isDark, setIsDark] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [userName, setUserName] = useState("Rohan Sinha");
  const [userEmail, setUserEmail] = useState("rohan.sinha@example.in");
  const [userRole, setUserRole] = useState("Citizen / Individual");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Check dark mode
    if (typeof window !== "undefined") {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
      const isSimple = document.documentElement.classList.contains("accessibility-simple-mode");
      setSimpleMode(isSimple);
      const storedLang = localStorage.getItem("legalsaathi_lang");
      if (storedLang) setSelectedLang(storedLang);
    }
  }, [isOpen]);

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

  const toggleSimpleMode = () => {
    const nextSimple = !simpleMode;
    setSimpleMode(nextSimple);
    document.documentElement.classList.toggle("accessibility-simple-mode", nextSimple);
  };

  const handleSelectLang = (code: string) => {
    setSelectedLang(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("legalsaathi_lang", code);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[var(--surface)] text-[var(--text-primary)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Navigation Tabs */}
        <div className="w-full md:w-56 bg-[var(--surface-secondary)] border-b md:border-b-0 md:border-r border-[var(--border)] p-4 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center justify-between md:mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Settings & Profile
              </span>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "language", label: "Language", icon: Languages },
                { id: "accessibility", label: "Accessibility", icon: Eye },
                { id: "privacy", label: "Privacy & DPDP", icon: Shield },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "security", label: "Security", icon: Shield },
                { id: "subscription", label: "Plan & Billing", icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-[var(--surface)] text-[var(--primary)] font-semibold shadow-xs border border-[var(--border)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:block pt-4 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)]">
            LegalSaathi V4 • Clean UI
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)]">
            <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
              {activeTab === "profile" && "Personal Information"}
              {activeTab === "language" && "Language Preference"}
              {activeTab === "accessibility" && "Accessibility & Display"}
              {activeTab === "privacy" && "Privacy & DPDP Compliance"}
              {activeTab === "notifications" && "Notification Preferences"}
              {activeTab === "security" && "Security & Audit"}
              {activeTab === "subscription" && "Subscription & Plan"}
            </h3>
            <button
              onClick={onClose}
              className="hidden md:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  RS
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">{userName}</h4>
                  <p className="text-xs text-[var(--text-muted)]">{userEmail}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Account Type
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="Citizen / Individual">Citizen / Individual</option>
                    <option value="Advocate / Legal Professional">Advocate / Legal Professional</option>
                    <option value="NGO / Legal Aid Representative">NGO / Legal Aid Representative</option>
                    <option value="Enterprise / Corporate Legal Counsel">Enterprise / Corporate Legal Counsel</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSavedSuccess(true);
                    setTimeout(() => setSavedSuccess(false), 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === "language" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-secondary)]">
                Choose your preferred language. All document summaries, AI explanations, and guidance will be automatically localized.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INDIAN_LANGUAGES.map((lang) => {
                  const isSel = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLang(lang.code)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSel
                          ? "border-[var(--primary)] bg-[var(--primary-subtle)] font-bold text-[var(--primary)] shadow-xs"
                          : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)]"
                      }`}
                    >
                      <div className="text-sm font-semibold">{lang.native}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{lang.name}</div>
                    </button>
                  );
                })}
              </div>

              {savedSuccess && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--success)] animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Language preference updated
                </div>
              )}
            </div>
          )}

          {/* Accessibility & Display Tab */}
          {activeTab === "accessibility" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} Dark Mode
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Deep slate theme optimized for prolonged legal reading and low eye strain.
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isDark ? "bg-[var(--primary)]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isDark ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Simplified Citizen Reading Mode
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Increases line-height, text size, and provides plain English/vernacular definitions for complex Latin and legal terms.
                  </p>
                </div>
                <button
                  onClick={toggleSimpleMode}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    simpleMode ? "bg-[var(--primary)]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      simpleMode ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Privacy & DPDP Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">DPDP Act 2023 Compliant</strong>
                  <span>Your legal documents and personal identifiers are stored with AES-256 GCM encryption and never used to train external models.</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-[var(--text-primary)]">Consent & Data Retention</h5>
                <p className="text-[var(--text-secondary)]">
                  You hold full rights under Section 12 of the Digital Personal Data Protection Act to review, withdraw consent, or request irreversible shredding of uploaded case records.
                </p>
                <div className="pt-2">
                  <Link
                    href="/privacy"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:underline font-semibold"
                  >
                    Open Full Trust & Privacy Center <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]">
                <div>
                  <span className="font-semibold block text-[var(--text-primary)]">Statutory Limitation Deadlines</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Alerts for court limitation periods and notice response deadlines</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--primary)]" />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]">
                <div>
                  <span className="font-semibold block text-[var(--text-primary)]">Document Analysis Readiness</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Instant alert when AI clause extraction and risk analysis completes</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--primary)]" />
              </label>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] space-y-1">
                <span className="font-semibold text-[var(--text-primary)] block">Audit Log Verification</span>
                <p className="text-[var(--text-muted)]">Every document access and AI query is cryptographically signed with SHA-256 tamper-evident logs.</p>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[var(--text-primary)] block">Session Security</span>
                  <p className="text-[var(--text-muted)]">Active on Chrome (macOS) • IP verified</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-subtle)] px-2 py-0.5 rounded">
                    Active Plan
                  </span>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">Citizen Standard</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Unlimited AI document explanations and verified Indian case search.</p>
                </div>
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white font-semibold text-xs hover:bg-[var(--primary-hover)] transition-colors"
                >
                  Manage Plans
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
