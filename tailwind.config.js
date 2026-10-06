/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/site/**/*.{ts,tsx}",
    "./data/**/*.ts",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        "ink-2": "#141414",
        ivory: "#FAF8F3",
        gold: {
          DEFAULT: "#C9A24B",
          deep: "#B8913A",
          light: "#E6C972",
          soft: "#EBC166",
          ink: "#5B4300",
        },
        surface: {
          lowest: "#0e0e0e",
          low: "#1c1b1b",
          DEFAULT: "#201f1f",
          high: "#2a2a2a",
          highest: "#353534",
        },
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#d1c5b2",
        "outline-variant": "#4e4637",
        outline: "#9a8f7e",
      },
      fontFamily: {
        serif: ['"EB Garamond"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-hero": ["64px", { lineHeight: "72px", letterSpacing: "-0.01em" }],
        "headline-lg": ["44px", { lineHeight: "52px", letterSpacing: "-0.01em" }],
        "headline-md": ["32px", { lineHeight: "40px" }],
        "headline-sm": ["24px", { lineHeight: "32px", letterSpacing: "0.01em" }],
        "body-lg": ["18px", { lineHeight: "28px" }],
        "body-md": ["15px", { lineHeight: "24px", letterSpacing: "0.01em" }],
        "body-sm": ["13px", { lineHeight: "20px", letterSpacing: "0.01em" }],
        eyebrow: ["11px", { lineHeight: "16px", letterSpacing: "0.22em" }],
      },
      spacing: { margin: "4rem", gutter: "2rem" },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #B8913A 0%, #E6C972 50%, #B8913A 100%)",
      },
      boxShadow: {
        gold: "0 0 24px rgba(201,162,75,0.45)",
        console:
          "0 24px 48px -12px rgba(0,0,0,0.8), 0 0 24px 0 rgba(201,162,75,0.12)",
      },
    },
  },
  plugins: [],
};
