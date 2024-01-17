import { logDevReady } from "@remix-run/cloudflare";
import * as build from "@remix-run/dev/server-build";
import * as Sentry from "@sentry/remix";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { cache } from "hono/cache";
import { handle } from "hono/cloudflare-pages";
import { logger } from "hono/logger";
import { cacheHeader } from "pretty-cache-header";
import { remix } from "remix-hono/handler";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";

import { EnvSchema } from "~/server/env";
import { Measurer } from "~/server/measure";

if (process.env.NODE_ENV === "development") logDevReady(build);

type ContextEnv = { Bindings: RuntimeEnv };

const server = new Hono<ContextEnv>();

server.use("*", (context, next) => {
	let url = new URL(context.req.url);
	if (!url.origin.includes("www.")) return next();
	url.hostname = url.hostname.slice(4);
	return c.redirect(url.href, 302);
});

server.use("/write", (context, next) => {
	let { WRITE_PASSWORD } = EnvSchema.parse(context.env);
	return basicAuth({ username: "sergiodxa", password: WRITE_PASSWORD })(
		context,
		next,
	);
});

server.use(
	"*",
	logger(),
	(context, next) => {
		let { searchParams } = new URL(context.req.url);
		if (searchParams.has("_data")) return next();
		return cache({
			cacheName: "htmlDocuments",
			cacheControl: cacheHeader({ maxAge: "1m" }),
		})(context, next);
	},
	remix<ContextEnv>({
		// @ts-expect-error This is expected due an old version of remix-hono
		build,
		mode: process.env.NODE_ENV as "development" | "production",
		getLoadContext(ctx) {
			if (ctx.env.DSN) {
				Sentry.init({
					dsn: ctx.env.DSN,
					tracesSampleRate: 1.0,
					allowUrls: ["*.sergiodxa.com"],
					attachStacktrace: true,
					beforeSend(event) {
						if (event.request?.url?.includes("sentry")) return null;
						event.user = {};

						let ip = getClientIPAddress(ctx.req.headers);
						if (ip) event.user.ip_address = ip;

						return event;
					},
				});
			}

			let env = EnvSchema.parse(ctx.env);

			let measurer = new Measurer();

			return {
				env,
				db: ctx.env.DB,
				kv: {
					cache: ctx.env.cache,
					auth: ctx.env.auth,
					redirects: ctx.env.redirects,
				},
				waitUntil: ctx.executionCtx.waitUntil.bind(ctx.executionCtx),
				time: measurer.time.bind(measurer),
			};
		},
	}),
);

export const onRequest = handle(server);
