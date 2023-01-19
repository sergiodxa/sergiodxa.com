/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	serverBuildTarget: "cloudflare-pages",
	server: "./server/index.ts",
	devServerBroadcastDelay: 2000,
	ignoredRouteFiles: ["**/.*"],
	watchPaths: ["./server/env.ts", "./repositories/**/*", "./services/**/*"],
};
