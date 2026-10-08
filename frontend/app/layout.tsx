import type { Metadata } from "next";
import { Outfit, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CommandPalette } from "@/components/CommandPalette";
import { Footer } from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LEGAL AI — AI-Powered Legal Intelligence for India",
  description:
    "Understand the law. Know what to do next. Plain-language document intelligence, statutory verification, and advocate collaboration.",
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
    title: "LEGAL AI — AI-Powered Legal Intelligence for India",
    description: "Understand the law. Know what to do next. Digital Legal Intelligence & Access Platform for India.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-150">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
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
