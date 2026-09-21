/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f9f5",
          100: "#e0f0e6",
          200: "#bfe0cc",
          300: "#93c9a8",
          400: "#5fab7d",
          500: "#3a8f5f",
          600: "#2b7349",
          700: "#235c3b",
          800: "#1e4a31",
          900: "#193d29",
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out both",
        slideUp: "slideUp 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
