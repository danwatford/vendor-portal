module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "bfw-yellow": "#FDDB00",
      },
      backgroundImage: {
        "header-logo": "url('/src/images/bfw-logo-365x105-1.png')",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
