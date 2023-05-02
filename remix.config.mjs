/** @type {import('@remix-run/dev').AppConfig} */
export default {
	serverBuildTarget: "cloudflare-pages",
	server: "./server/index.ts",
	devServerBroadcastDelay: 2000,
	ignoredRouteFiles: ["**/.*"],
	watchPaths: [
		"./server/env.ts",
		"./services/**/*",
		"./repositories/**/*",
		"./entities/**/*",
	],
	future: {
		v2_errorBoundary: true,
		v2_normalizeFormMethod: true,
	},
};
