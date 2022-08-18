/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	serverBuildTarget: "cloudflare-pages",
	server: "./server/index.ts",
	devServerBroadcastDelay: 1000,
	ignoredRouteFiles: ["**/.*"],
};
