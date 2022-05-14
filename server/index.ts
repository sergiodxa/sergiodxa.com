import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import * as build from "@remix-run/dev/server-build";

const PORT = Number(process.env.PORT ?? "3000");
const HOST = process.env.HOST ?? "localhost";

let server = express();

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
  createRequestHandler({ build: build, mode: process.env.NODE_ENV })
);

server.listen(PORT, HOST, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});