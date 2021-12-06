const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "bfw-yellow": "#FDDB00",
        "bfw-link": "#F6C70B",
        text: "#4A4A4A",
        "menu-text": "#2C2C2B",
      },
      backgroundImage: {
        "header-logo": "url('/src/images/bfw-logo-365x105-1.png')",
      },
      fontFamily: {
        sans: ["Myriad Pro Regular", ...defaultTheme.fontFamily["sans"]],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
