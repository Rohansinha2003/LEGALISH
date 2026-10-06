/**
 * Design System: Spacing, Radius, and Shadow Tokens
 * Compliant with Prompt #39 (16–24px radius, subtle borders, extremely soft shadows)
 */

export const borderRadius = {
  sm: "0.5rem",     // 8px
  md: "0.75rem",    // 12px
  lg: "1rem",       // 16px
  xl: "1.25rem",    // 20px
  "2xl": "1.5rem",  // 24px
  "3xl": "1.75rem", // 28px
  full: "9999px",
} as const;

export const shadows = {
  xs: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
  sm: "0 2px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
  md: "0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 8px -2px rgba(15, 23, 42, 0.04)",
  lg: "0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
  glowIndigo: "0 0 35px -5px rgba(79, 70, 229, 0.25)",
  glowPurple: "0 0 35px -5px rgba(124, 58, 237, 0.25)",
  glowCyan: "0 0 35px -5px rgba(6, 182, 212, 0.25)",
} as const;
