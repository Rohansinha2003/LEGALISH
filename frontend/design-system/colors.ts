/**
 * Centralized Design System: Color Tokens
 * Signature: Warm Ivory & Soft Beige foundation with Deep Charcoal typography
 * Accents: Deep Indigo (#4F46E5), Violet (#7C3AED), Teal (#0F9F9A),
 * Emerald (#16845B), Amber (#C98A16), Coral (#D95C55)
 */

export const colors = {
  // 1. Signature Backgrounds (Warm Editorial Paper)
  background: {
    DEFAULT: "#F7F3EC",     // Warm Ivory (Primary Canvas)
    ivory: "#F7F3EC",
    beige: "#EFE9DE",       // Soft Beige
    cream: "#FBF9F5",       // Cream (Elevated Surface)
    paper: "#F4F0E8",       // Paper (Cards / Inputs)
    dark: "#0D0D0F",        // Premium Dark Mode
    darkSurface: "#151518",
    darkElevated: "#1D1D22",
  },

  // 2. Sophisticated Typography
  text: {
    primary: "#171717",     // Deep Charcoal
    secondary: "#6B6862",   // Warm Gray
    muted: "#8C8880",       // Faint Warm Gray
    inverse: "#FBF9F5",
    darkPrimary: "#F5F5F5",
    darkSecondary: "#A1A1A8",
  },

  // 3. Editorial Borders
  border: {
    DEFAULT: "#DED8CD",     // Refined Warm Border
    subtle: "#EAE5DA",
    medium: "#D5CEBF",
    dark: "#26262B",
  },

  // 4. Strategic Accent Colors
  primary: {
    DEFAULT: "#4F46E5",     // Deep Indigo
    hover: "#4338CA",
    active: "#3730A3",
    subtle: "#EEF0FC",
    border: "#C7D0FA",
  },
  ai: {
    DEFAULT: "#7C3AED",     // Violet
    hover: "#6D28D9",
    active: "#5B21B6",
    subtle: "#F5F1FD",
    border: "#DDD2FA",
  },
  secondary: {
    DEFAULT: "#0F9F9A",     // Teal
    hover: "#0D8682",
    subtle: "#ECF9F8",
    border: "#B2E7E5",
  },
  emerald: {
    DEFAULT: "#16845B",     // Positive / Verified Emerald
    subtle: "#EBF7F2",
    border: "#BCE5D5",
    text: "#0F5C3E",
  },
  amber: {
    DEFAULT: "#C98A16",     // Attention Amber
    subtle: "#FAF4E6",
    border: "#F3E3BC",
    text: "#8A5E0E",
  },
  coral: {
    DEFAULT: "#D95C55",     // Warning Coral
    subtle: "#FAEDED",
    border: "#F7D1CF",
    text: "#9A3C36",
  },

  // 5. Feature Visual Identity (Section 8)
  features: {
    askAi: "#7C3AED",       // Violet
    documents: "#4F46E5",   // Deep Indigo
    research: "#0F9F9A",    // Teal
    cases: "#4F46E5",       // Indigo
    translation: "#16845B", // Green / Turquoise
    generator: "#C98A16",   // Amber
    lawyer: "#16845B",      // Emerald
    deadlines: "#D95C55",   // Coral
  },

  // 6. Semantic Trust Indicators (Section 12)
  trust: {
    verified: {
      bg: "#EBF7F2",
      border: "#BCE5D5",
      text: "#0F5C3E",
      dot: "#16845B",
    },
    ai: {
      bg: "#F5F1FD",
      border: "#DDD2FA",
      text: "#5B21B6",
      dot: "#7C3AED",
    },
    warning: {
      bg: "#FAEDED",
      border: "#F7D1CF",
      text: "#9A3C36",
      dot: "#D95C55",
    },
    attention: {
      bg: "#FAF4E6",
      border: "#F3E3BC",
      text: "#8A5E0E",
      dot: "#C98A16",
    },
  },
} as const;

export const gradients = {
  warmSurface: "linear-gradient(180deg, #FBF9F5 0%, #F7F3EC 100%)",
  subtlePaper: "linear-gradient(135deg, rgba(251, 249, 245, 0.9) 0%, rgba(244, 240, 232, 0.9) 100%)",
  heroGlow: "radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.06) 0%, rgba(79, 70, 229, 0.04) 40%, transparent 70%)",
  indigoViolet: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
  aiShimmer: "linear-gradient(90deg, #4F46E5 0%, #7C3AED 40%, #0F9F9A 70%, #4F46E5 100%)",
} as const;
