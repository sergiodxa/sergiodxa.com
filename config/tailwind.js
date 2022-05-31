module.exports = {
  content: ["./app/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
  ],
};
