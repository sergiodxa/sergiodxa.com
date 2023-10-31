/** @type {import("prettier").Options} */
export default {
	plugins: ["prettier-plugin-tailwindcss"],
	trailingComma: "all",
	tabWidth: 2,
	useTabs: true,
	proseWrap: "always",
	tailwindConfig: "./tailwind.config.js",
};
