/** @type {import('@remix-run/dev').AppConfig} */
export default {
	devServerBroadcastDelay: 2000,
	ignoredRouteFiles: ["**/.*"],
	serverBuildPath: "dist/worker/index.js",
	serverModuleFormat: "esm",
	tailwind: true,
	watchPaths: ["./server/**/*.ts"],
	serverConditions: ["worker"],
	serverDependenciesToBundle: "all",
	serverMainFields: ["browser", "module", "main"],
	serverMinify: true,
	serverPlatform: "neutral",
	future: {
		v2_errorBoundary: true,
		v2_normalizeFormMethod: true,
		v2_meta: true,
		v2_routeConvention: true,
	},
};
