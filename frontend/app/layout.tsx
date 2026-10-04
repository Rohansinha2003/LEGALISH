import type { Metadata } from "next";
import { Outfit, Merriweather } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/Navbar";

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
  title: "LegalSaathi V2 — Digital Legal Companion for India",
  description:
    "Understand legal situations, organize evidence, ask questions grounded in Indian law, and create structured legal drafts in simple language.",
  keywords: ["legal assistance India", "case workspace", "legal RAG", "evidence locker", "Hindi legal", "Tamil legal"],
  openGraph: {
    title: "LegalSaathi V2 — Digital Legal Companion for India",
    description: "Multilingual Indian Legal Assistance Platform for Ordinary People.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${merriweather.variable}`}>
      <body className="antialiased min-h-screen bg-[#F5F0E8] text-[#1A2B49] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FAF7F2",
              color: "#1A2B49",
              border: "1px solid #DDD5C7",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
