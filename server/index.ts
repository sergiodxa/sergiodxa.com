import type { AppLoadContext } from "@remix-run/cloudflare";

import {
	createRequestHandler,
	logDevReady,
	redirect,
} from "@remix-run/cloudflare";
import * as build from "@remix-run/dev/server-build";
import * as Sentry from "@sentry/remix";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";

import { EnvSchema } from "./env";
import { Measurer } from "./measure";

// @ts-expect-error
if (process.env.NODE_ENV === "development") logDevReady(build);

// @ts-expect-error
let remix = createRequestHandler(build, build.mode);

export async function onRequest(
	ctx: EventContext<RuntimeEnv, any, Record<string, unknown>>,
) {
	let url = new URL(ctx.request.url);

	// Remove www. from the hostname
	if (url.hostname.includes("www.")) {
		url.hostname = url.hostname.slice(4);
		return redirect(url.href, 302);
	}

	// Initialize Sentry if DSN is configured
	if (ctx.env.DSN) {
		Sentry.init({
			dsn: ctx.env.DSN,
			tracesSampleRate: 1.0,
			allowUrls: ["*.sergiodxa.com"],
			attachStacktrace: true,
			beforeSend(event) {
				if (event.request?.url?.includes("sentry")) return null;
				event.user = {};

				let ip = getClientIPAddress(ctx.request.headers);
				if (ip) event.user.ip_address = ip;

				return event;
			},
		});
	}

	let env = EnvSchema.parse(ctx.env);
	let measurer = new Measurer();
	let waitUntil = ctx.waitUntil.bind(ctx);

	let response = await remix(ctx.request, {
		env,
		db: ctx.env.DB,
		kv: {
			cache: ctx.env.cache,
			auth: ctx.env.auth,
			redirects: ctx.env.redirects,
		},
		waitUntil,
		time: measurer.time.bind(measurer),
	} satisfies AppLoadContext);

	return response;
}
