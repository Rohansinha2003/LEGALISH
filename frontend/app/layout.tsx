import type { Metadata } from "next";
import { Outfit, Merriweather } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CommandPalette } from "@/components/CommandPalette";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LegalSaathi V4 — Digital Legal Intelligence & Access Platform for India",
  description:
    "Make legal information understandable and accessible to ordinary people in India. AI-powered document analysis, bilingual legal guidance, and trusted case intelligence.",
  keywords: [
    "legal assistance India",
    "Indian law AI",
    "case workspace",
    "legal RAG",
    "evidence locker",
    "Hindi legal explanation",
    "Tamil legal",
    "DPDP compliance",
  ],
  openGraph: {
    title: "LegalSaathi V4 — Digital Legal Intelligence & Access Platform",
    description: "Understand the law. Know what to do next. Multilingual Indian Legal Assistance Platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${merriweather.variable}`}>
      <body className="antialiased min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-150">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <MobileBottomNav />
        <CommandPalette />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
