import type { Config } from "tailwindcss";

// Palette pulled and sharpened from the real Caritas University portal
// (maroon/white, near-black type) - not a generic Tailwind default.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#A61E1E",
          dark: "#7A1616",
          light: "#F6E6E6",
        },
        ink: {
          DEFAULT: "#1C1B1A",
          muted: "#6B6862",
          faint: "#9C988F",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F7F5F1",
        },
        border: {
          DEFAULT: "#E6E2DA",
          strong: "#D2CCBF",
        },
        success: { DEFAULT: "#2F7D4F", bg: "#EAF3EC" },
        warning: { DEFAULT: "#A9660A", bg: "#FBF1E1" },
        danger: { DEFAULT: "#B3261E", bg: "#FBEAEA" },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
