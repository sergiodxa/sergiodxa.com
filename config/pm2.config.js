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
      ignore_watch: ["."],
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
