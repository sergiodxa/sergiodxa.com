/** @type {import('@remix-run/dev').AppConfig} */
export default {
	serverBuildTarget: "cloudflare-pages",
	serverBuildPath: "dist/worker/index.js",
	serverDependenciesToBundle: [/~/],
	devServerBroadcastDelay: 2000,
	ignoredRouteFiles: ["**/.*"],
	watchPaths: ["./server/**/*.ts"],
	future: {
		v2_errorBoundary: true,
		v2_normalizeFormMethod: true,
		v2_meta: true,
		v2_routeConvention: true,
	},
};
