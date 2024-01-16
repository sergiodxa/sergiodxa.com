/** @type {import('@remix-run/dev').AppConfig} */
export default {
	devServerBroadcastDelay: 1000,
	ignoredRouteFiles: ["**/.*"],
	server: "./server/index.ts",
	serverBuildPath: "functions/[[path]].js",
	serverConditions: ["worker"],
	serverDependenciesToBundle: "all",
	serverMainFields: ["browser", "module", "main"],
	serverMinify: true,
	serverModuleFormat: "esm",
	serverPlatform: "neutral",
	tailwind: true,
	watchPaths: ["./server/**/*.ts"],
	future: {
		v3_relativeSplatPath: true,
		v3_fetcherPersist: true,
	},
	serverNodeBuiltinsPolyfill: { modules: {} },
};
