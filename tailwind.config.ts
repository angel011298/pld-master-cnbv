import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Brand scale (institutional blue rebrand: #004FAE)
        brand: {
          50:  "#E8EFF8",
          100: "#CFDDF0",
          200: "#9DBBE0",
          300: "#6A98D0",
          400: "#3876C0",
          500: "#004FAE",
          600: "#003F8C",
          700: "#00306B",
          800: "#00224B",
          900: "#00132C",
        },
        // Cool, slightly tinted neutral scale
        neutral: {
          0:   "#FFFFFF",
          25:  "#FAFBFC",
          50:  "#F4F5F7",
          100: "#ECEEF1",
          200: "#DEE1E6",
          300: "#C4C9D1",
          400: "#9BA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#2E3440",
          800: "#1A1D23",
          900: "#0B0D10",
        },
        success: {
          DEFAULT: "#00A86B",
          bg: "#E6F7F0",
        },
        warning: {
          DEFAULT: "#F59E0B",
          bg: "#FEF3E2",
        },
        danger: {
          DEFAULT: "#E5484D",
          bg: "#FEEAEA",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Rebrand-specific
        "xs": "4px",
        "2xl": "24px",
        "3xl": "32px",
        pill: "9999px",
      },
      letterSpacing: {
        tightest: "-0.045em",
        display: "-0.03em",
        eyebrow: "0.18em",
      },
      boxShadow: {
        "rb-xs": "0 1px 0 rgba(11, 13, 16, 0.04)",
        "rb-sm": "0 1px 2px rgba(11, 13, 16, 0.05), 0 1px 3px rgba(11, 13, 16, 0.04)",
        "rb-md": "0 4px 8px rgba(11, 13, 16, 0.04), 0 2px 4px rgba(11, 13, 16, 0.04)",
        "rb-lg": "0 12px 24px rgba(11, 13, 16, 0.06), 0 4px 8px rgba(11, 13, 16, 0.04)",
        "rb-xl": "0 24px 48px rgba(11, 13, 16, 0.08), 0 8px 16px rgba(11, 13, 16, 0.04)",
        focus: "0 0 0 4px rgba(0, 79, 174, 0.18)",
      },
      transitionTimingFunction: {
        "rb-out": "cubic-bezier(0.22, 1, 0.36, 1)",
        "rb-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
