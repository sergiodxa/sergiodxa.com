import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import * as build from "@remix-run/dev/server-build";

const PORT = Number(process.env.PORT || "3000");
const HOST = process.env.HOST || "localhost";

let app = express();

app.use(compression());

app.disable("x-powered-by");

app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  createRequestHandler({ build: build, mode: process.env.NODE_ENV })
);

app.listen(PORT, HOST, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
