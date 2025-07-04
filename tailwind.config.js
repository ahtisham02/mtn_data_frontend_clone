/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "plus-jakarta": ['"Plus Jakarta Sans"', "sans-serif"],
      },
      colors: {
        background: "#f0f9ff",
        "footer-bg": "#e0f2fe",
        foreground: "#1c1917",
        card: "#ffffff",
        "card-foreground": "#1c1917",
        muted: "#78716c",
        "muted-foreground": "#a8a29e",
        accent: "#337AFF",
  "accent-hover": "#60A5FA",
        border: "#d6d3d1",
      },
      animation: {
        aurora: "aurora 20s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        stream: "stream 1.5s ease-in-out infinite",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        stream: {
          "0%, 100%": { transform: "scaleY(0.1)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
  safelist: ["font-plus-jakarta"],
};
