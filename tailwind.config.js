/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lightblue: "#F4FBFF",
        darkNavyBlue: "#0B132A",
        hr: "#bfbfbf",
        body: "#131823",
        txt: "#6C86AD",
        txt2: "2F8AF5",
        body2: "#06070a",
        headers: "rgba(47, 138, 245, 0.4)",
        button: "rgba(47, 138, 245, 0.16)",
      },
    },
  },
  plugins: [],
};
