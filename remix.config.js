/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  cacheDirectory: ".cache",
  publicPath: "/build/",
  server: "server/index.ts",
  serverBuildPath: "server/build/index.js",
  serverBuildTarget: "node-cjs",
};
