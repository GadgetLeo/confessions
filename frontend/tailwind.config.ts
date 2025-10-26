import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Dark mode colors (primary theme)
        "deep-space": {
          1: "#0a0118",
          2: "#1a0b2e",
          3: "#2d1b4e",
        },

        // Light mode colors
        "light": {
          1: "#fefefe",
          2: "#fafafa",
          3: "#f5f5f5",
        },

        // Gradients
        primary: {
          purple: {
            start: "#7c3aed",
            end: "#6d28d9",
          },
          cyan: {
            start: "#06b6d4",
            end: "#3b82f6",
          },
        },

        // Text colors (responsive to theme)
        text: {
          // Dark mode
          primary: "#ffffff",
          secondary: "#c4b5fd",
          muted: "#a78bfa",
          // Light mode
          "primary-light": "#0f0a1e",
          "secondary-light": "#6d28d9",
          "muted-light": "#9ca3af",
        },

        // Semantic colors
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ec4899",
        info: "#3b82f6",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "Inter", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Fira Code", "monospace"],
      },
      fontSize: {
        hero: "clamp(2.5rem, 5vw, 4rem)",
        h1: "clamp(2rem, 4vw, 3rem)",
        h2: "clamp(1.5rem, 3vw, 2rem)",
        h3: "clamp(1.25rem, 2.5vw, 1.5rem)",
        body: "clamp(1rem, 2vw, 1.125rem)",
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
        "4xl": "6rem",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        sm: "0 2px 8px rgba(139, 92, 246, 0.1)",
        md: "0 4px 16px rgba(139, 92, 246, 0.15)",
        lg: "0 8px 32px rgba(139, 92, 246, 0.2)",
        xl: "0 16px 64px rgba(139, 92, 246, 0.25)",
        "glow-purple": "0 0 20px rgba(147, 51, 234, 0.5)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.5)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.5)",
      },
      backdropBlur: {
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "shimmer": "shimmer 1.5s infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
