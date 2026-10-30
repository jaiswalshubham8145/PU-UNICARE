import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        sans: ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Clash Display"', '"Outfit"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', '"Fraunces"', 'serif'],
        editorial: ['"Instrument Serif"', 'serif'],
        sovereign: ['"Fraunces"', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
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
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          blue: "hsl(var(--primary-blue))",
          indigo: "hsl(var(--primary-indigo))",
          teal: "hsl(var(--primary-teal))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          light: "hsl(var(--accent-light))",
          dark: "hsl(var(--accent-dark))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          elevated: "hsl(var(--card-elevated))",
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
        forest: {
          DEFAULT: "hsl(var(--forest))",
          light: "#6EE7B7",
          dark: "#34D399",
        },
        sapphire: {
          DEFAULT: "hsl(var(--sapphire))",
          light: "#3B82F6",
          dark: "#1E3F73",
        },
        burgundy: {
          DEFAULT: "hsl(var(--burgundy))",
          light: "#8B263E",
          dark: "#40121d",
        },
        brass: {
          DEFAULT: "hsl(var(--gold))",
          light: "#F3E5AB",
          dark: "#C2A05A",
        },
        priority: {
          critical: "hsl(var(--priority-critical))",
          high: "hsl(var(--priority-high))",
          medium: "hsl(var(--priority-medium))",
          low: "hsl(var(--priority-low))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        glow: "0 0 45px rgba(52, 211, 153, 0.55)",
        card: "var(--shadow-card)",
        glass: "var(--shadow-glass)",
        luxury: "0 10px 40px -10px rgba(52, 211, 153, 0.45), 0 4px 16px -4px rgba(0, 0, 0, 0.2)",
        "luxury-dark": "0 10px 40px -10px rgba(0, 0, 0, 0.7), 0 0 45px rgba(52, 211, 153, 0.45)",
        "luxury-hover": "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 55px rgba(52, 211, 153, 0.5), 0 0 25px rgba(224, 200, 139, 0.3)",
        "gold-glow": "0 0 50px rgba(224, 200, 139, 0.55), 0 0 100px rgba(194, 160, 90, 0.3)",
        "emerald-glow": "0 0 55px rgba(52, 211, 153, 0.6), 0 0 110px rgba(46, 204, 113, 0.35)",
        "sapphire-glow": "0 0 50px rgba(96, 165, 250, 0.5), 0 0 100px rgba(37, 99, 235, 0.3)",
        premium: "0 20px 50px -15px rgba(0, 0, 0, 0.3), 0 0 45px rgba(52, 211, 153, 0.45)",
      },
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-card": "var(--gradient-card)",
        "gradient-surface": "var(--gradient-surface)",
        "gradient-primary": "var(--gradient-primary)",
        "gradient-teal": "var(--gradient-teal)",
        "gradient-indigo": "var(--gradient-indigo)",
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
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(45 95% 55% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(45 95% 55% / 0.5)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(45 95% 55% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(45 95% 55% / 0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "float": "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
