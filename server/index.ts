import * as build from "@remix-run/dev/server-build";
import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";

import { HOST, NODE_ENV, PORT } from "~/env";
import { InMemoryCache } from "~/services/cache.server";
import { db } from "~/services/db.server";
import { logger } from "~/services/logger.server";

const server = express();
const cache = new InMemoryCache();
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
		mode: NODE_ENV,
		getLoadContext(): SDX.Context {
			return { db, logger, cache };
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
