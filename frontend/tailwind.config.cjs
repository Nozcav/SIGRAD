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
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "60%": { opacity: "1", transform: "scale(1.03)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        meshMove: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(3%, -4%) scale(1.08)" },
        },
        neonPulse: {
          "0%, 100%": {
            boxShadow:
              "0 0 10px 2px rgba(74,222,128,0.55), 0 0 25px 6px rgba(16,185,129,0.35), 0 0 45px 12px rgba(16,185,129,0.15)",
          },
          "50%": {
            boxShadow:
              "0 0 16px 4px rgba(163,230,53,0.75), 0 0 38px 10px rgba(74,222,128,0.5), 0 0 65px 20px rgba(16,185,129,0.25)",
          },
        },
        navbarFlow: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.55" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        countPop: {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        toastIn: {
          "0%": { opacity: "0", transform: "translateX(30px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        toastProgress: {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out both",
        slideUp: "slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        popIn: "popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        gradientShift: "gradientShift 3s ease infinite",
        meshMove: "meshMove 12s ease-in-out infinite",
        neonPulse: "neonPulse 1.6s ease-in-out infinite",
        navbarFlow: "navbarFlow 8s ease-in-out infinite",
        ripple: "ripple 0.6s ease-out",
        shimmer: "shimmer 1.8s linear infinite",
        toastIn: "toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        toastProgress: "toastProgress linear forwards",
        countPop: "countPop 0.4s ease-out",
      },
      backgroundSize: {
        200: "200% 200%",
      },
    },
  },
  plugins: [],
};
