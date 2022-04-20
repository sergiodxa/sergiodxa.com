module.exports = {
  apps: [
    {
      name: "TailwindCSS",
      script: "npm run dev:css",
      ignore_watch: ["."],
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "Remix",
      script: "npm run dev:app",
      watch: ["./remix.config.js"],
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "Server",
      script: "npm run dev:http",
      watch: ["./server/build/index.js"],
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
