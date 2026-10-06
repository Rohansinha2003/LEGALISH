/**
 * Design System: Animation Tokens
 * Fast, subtle micro-interactions & AI gradient motions
 */

export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
  smooth: "350ms cubic-bezier(0.16, 1, 0.3, 1)",
  bounce: "500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const keyframeDescriptions = {
  pulseSlow: "pulse-slow 4s ease-in-out infinite",
  shimmer: "shimmer 2.5s linear infinite",
  gradientRotate: "gradientRotate 8s linear infinite",
} as const;
