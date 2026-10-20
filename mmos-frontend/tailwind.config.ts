import type { Config } from "tailwindcss";

// Design decision rationale (R-31 — every decision has a one-line reason):
// - White background: enterprise readability for long work sessions, professional tone
// - #0066FF accent: single strong blue for action hierarchy, electric but not neon
// - #111827 text: near-black for maximum contrast, passes WCAG AA
// - Inter: legible at 12-14px in dense data tables, clean enterprise character
// - 8-12px radius: consistent system, creates softness without pill-shapes
// - No glassmorphism, no glows, no grid backgrounds: all would be decoration without purpose

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core surface hierarchy (3 levels)
        background:    "#F8FAFC",   // page canvas — slightly off-white reduces eye strain
        surface:       "#FFFFFF",   // cards, panels
        "surface-2":   "#F1F5F9",   // inset areas, table rows, secondary inputs
        "surface-3":   "#E2E8F0",   // hover states, dividers
        // Borders
        border:        "#E2E8F0",   // default border
        "border-strong":"#CBD5E1",  // focused inputs, section separators
        // Single accent — R-29: one accent color only
        accent:        "#2563EB",   // primary action, links, active nav
        "accent-hover":"#1D4ED8",   // hover state of accent
        "accent-light":"#EFF6FF",   // accent tint for backgrounds
        "accent-muted":"#BFDBFE",   // accent for badges, tags
        // Semantic aliases (used throughout app as accent-success, accent-alert etc.)
        "accent-success": "#16A34A",
        "accent-warning": "#D97706",
        "accent-alert":   "#DC2626",
        "accent-info":    "#0284C7",
        // Semantic
        success:       "#16A34A",
        "success-bg":  "#F0FDF4",
        warning:       "#D97706",
        "warning-bg":  "#FFFBEB",
        danger:        "#DC2626",
        "danger-bg":   "#FEF2F2",
        info:          "#0284C7",
        "info-bg":     "#F0F9FF",
        // Text hierarchy (3 levels — R-25: all pass WCAG AA on white)
        "text-primary":   "#111827",  // 4.5:1+ on white
        "text-secondary": "#4B5563",  // 4.5:1+ on white
        "text-muted":     "#9CA3AF",  // 3:1+ used only for large text/labels
        "text-disabled":  "#D1D5DB",
        // Sidebar
        "sidebar-bg":     "#1E293B",  // dark sidebar, enterprise convention
        "sidebar-text":   "#CBD5E1",
        "sidebar-active": "#FFFFFF",
        "sidebar-hover":  "#334155",
        "sidebar-border": "#334155",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
      },
      borderRadius: {
        // Consistent system — R-11: not everything pill-shaped
        sm:  "4px",
        DEFAULT: "6px",
        md:  "8px",
        lg:  "10px",
        xl:  "12px",
        "2xl": "16px",
        "3xl": "20px",
        card: "12px",
        full: "9999px",
      },
      boxShadow: {
        // Elevation system — R-12: shadow supports hierarchy, not decoration
        xs:  "0 1px 2px 0 rgba(0,0,0,0.05)",
        sm:  "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        DEFAULT: "0 2px 8px 0 rgba(0,0,0,0.08), 0 1px 3px -1px rgba(0,0,0,0.06)",
        md:  "0 4px 12px -2px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06)",
        lg:  "0 8px 24px -4px rgba(0,0,0,0.1), 0 4px 8px -4px rgba(0,0,0,0.06)",
        xl:  "0 16px 40px -8px rgba(0,0,0,0.12)",
        // Focus ring — R-32: visible focus indicator for keyboard navigation
        "focus-ring": "0 0 0 3px rgba(37,99,235,0.25)",
        // Accent elevation — used only on primary CTA, max 1 element per screen
        "accent-glow": "0 4px 14px rgba(37,99,235,0.2)",
        // Inset for input fields
        inset: "inset 0 1px 2px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        // No decorative gradients. Only purposeful ones.
        // Sidebar gradient: creates depth distinction between nav and content
        "sidebar-gradient": "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
        // Accent gradient: used only on primary CTA button
        "accent-gradient": "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      },
      animation: {
        // Motion dial ENERGY 1 / MOTION 1 — hover states only, no scroll animations
        "fade-in": "fadeIn 0.15s ease-out",
        "slide-down": "slideDown 0.15s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
