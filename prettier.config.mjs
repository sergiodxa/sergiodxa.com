import tailwindcss from "prettier-plugin-tailwindcss";

/** @type {import("prettier").Options} */
const config = {
	plugins: [tailwindcss],
	trailingComma: "all",
	tabWidth: 2,
	useTabs: true,
	proseWrap: "always",
	tailwindConfig: "./tailwind.config.js",
};

export default config;
