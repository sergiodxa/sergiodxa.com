import { PrismaClient } from "@prisma/client";
import * as build from "@remix-run/dev/server-build";
import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import { logger } from "~/services/logger.server";

const PORT = Number(process.env.PORT ?? "3000");
const HOST = process.env.HOST ?? "localhost";

const server = express();
const db = new PrismaClient();

server.use(compression());

server.disable("x-powered-by");

server.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

server.use(express.static("public", { maxAge: "1h" }));

server.use(morgan("tiny"));

server.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext(): SDX.Context {
      return { db, logger };
    },
  })
);

server.listen(PORT, HOST, () => {
  logger.info(`HTTP server listening on ${HOST}:${PORT}`);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
});

process.on("exit", (pid) => {
  logger.info("Exiting...", { pid });
});
