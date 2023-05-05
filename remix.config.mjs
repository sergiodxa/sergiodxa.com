/** @type {import('@remix-run/dev').AppConfig} */
export default {
	devServerBroadcastDelay: 2000,
	ignoredRouteFiles: ["**/.*"],
	serverBuildPath: "dist/worker/index.js",
	serverBuildTarget: "cloudflare-pages",
	serverDependenciesToBundle: [/~/],
	serverModuleFormat: "esm",
	watchPaths: ["./server/**/*.ts"],
	future: {
		v2_errorBoundary: true,
		v2_normalizeFormMethod: true,
		v2_meta: true,
		v2_routeConvention: true,
	},
};
