/** @type {import("tailwindcss").Config} */
module.exports = {
	content: ["./app/**/*.{ts,tsx}"],

	darkMode: "media",

	theme: {
		extend: {
			maxWidth: {
				prose: "65ch",
			},

			inset: {
				full: "100%",
			},

			scale: {
				500: "5",
			},

			fontSize: {
				"7xl": "5rem",
				"8xl": "6rem",
			},
		},
	},

	variants: {
		extend: {
			padding: ["first", "last"],
			typography: ["dark"],
		},
	},

	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
