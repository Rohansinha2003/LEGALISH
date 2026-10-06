/**
 * Centralized Design System: Color Tokens
 * Combining: Colorful + Premium + Intelligent + Friendly + Trustworthy + Modern
 */

export const colors = {
  // Primary: Deep indigo / electric blue
  primary: {
    DEFAULT: "#4F46E5",
    hover: "#4338CA",
    active: "#3730A3",
    subtle: "#EEF2FF",
    border: "#C7D2FE",
  },
  // Secondary: Purple / violet
  secondary: {
    DEFAULT: "#7C3AED",
    hover: "#6D28D9",
    active: "#5B21B6",
    subtle: "#F5F3FF",
    border: "#DDD6FE",
  },
  // Accent: Teal / cyan
  accent: {
    cyan: "#06B6D4",
    cyanHover: "#0891B2",
    cyanSubtle: "#ECFEFF",
    teal: "#0D9488",
    tealHover: "#0F766E",
    tealSubtle: "#F0FDFA",
  },
  // Supporting accents
  emerald: {
    DEFAULT: "#10B981",
    subtle: "#ECFDF5",
    border: "#A7F3D0",
    text: "#065F46",
  },
  amber: {
    DEFAULT: "#F59E0B",
    subtle: "#FFFBEB",
    border: "#FDE68A",
    text: "#92400E",
  },
  coral: {
    DEFAULT: "#F43F5E",
    subtle: "#FFF1F2",
    border: "#FECDD3",
    text: "#9F1239",
  },
  pink: {
    DEFAULT: "#EC4899",
    subtle: "#FDF2F8",
    border: "#FBCFE8",
    text: "#9D174D",
  },
  sky: {
    DEFAULT: "#0EA5E9",
    subtle: "#F0F9FF",
    border: "#BAE6FD",
    text: "#0369A1",
  },

  // Surfaces & Backgrounds
  background: {
    light: "#F8FAFC",
    secondary: "#F1F5F9",
    dark: "#0B1020",
    darkSurface: "#111827",
    darkElevated: "#161D2F",
  },
  surface: {
    DEFAULT: "#FFFFFF",
    elevated: "#FFFFFF",
    subtle: "#F8FAFC",
  },

  // Text
  text: {
    primary: "#0F172A",
    secondary: "#334155",
    muted: "#64748B",
    inverse: "#FFFFFF",
  },

  // Semantic feature colors (Prompt #17 & #50)
  features: {
    cases: "#4F46E5",        // Indigo
    documents: "#0EA5E9",    // Blue / Sky
    ai: "#7C3AED",           // Purple / Violet
    research: "#06B6D4",     // Cyan
    translation: "#0D9488",  // Teal
    deadlines: "#F59E0B",    // Amber
    lawyer: "#10B981",       // Green / Emerald
    settings: "#64748B",     // Slate
  },

  // Semantic AI response colors (Prompt #10)
  semantic: {
    info: "#0EA5E9",         // Blue
    insight: "#8B5CF6",      // Purple
    verified: "#10B981",     // Green
    attention: "#F59E0B",    // Amber
    warning: "#EF4444",      // Red
    source: "#06B6D4",       // Cyan
  },
} as const;

export const gradients = {
  primary: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
  ai: "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F59E0B 100%)",
  hero: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 40%, #06B6D4 100%)",
  warm: "linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)",
  teal: "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)",
  success: "linear-gradient(135deg, #0D9488 0%, #10B981 100%)",
  mesh: "radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(124, 58, 237, 0.10) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(6, 182, 212, 0.08) 0px, transparent 50%)",
} as const;
