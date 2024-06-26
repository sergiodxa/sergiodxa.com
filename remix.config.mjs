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
		unstable_singleFetch: true,
		v3_fetcherPersist: true,
		v3_relativeSplatPath: true,
		v3_throwAbortReason: true,
	},
	serverNodeBuiltinsPolyfill: { modules: {} },
};
