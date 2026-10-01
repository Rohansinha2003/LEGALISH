import type { Metadata } from "next";
import { Outfit, Merriweather } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

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
  title: "LegalSaathi — Understand Your Legal Documents",
  description:
    "Upload a legal document, understand what it means in simple language, ask questions, translate it, and create useful legal drafts — without needing to understand complicated legal language.",
  keywords: ["legal document", "India legal", "legal AI", "document analysis", "Hindi legal"],
  openGraph: {
    title: "LegalSaathi — Understand Your Legal Documents",
    description: "AI-powered legal assistance for ordinary people in India.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${merriweather.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a2e",
              color: "#e2e8f0",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
