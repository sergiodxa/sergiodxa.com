import * as build from "virtual:react-router/server-build";
import type { ExecutionContext } from "@cloudflare/workers-types";
import { createRequestHandler } from "react-router";
import { CloudflareContext } from "./middleware/bindings";

const handler = createRequestHandler(build);

export default {
	async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
		let context = new Map([[CloudflareContext, { env, ctx }]]);
		return await handler(request, context);
	},

	async scheduled(
		_controller: ScheduledController,
		_env: Cloudflare.Env,
		_ctx: ExecutionContext,
	) {
		await fetch("https://blog.sergiodxa-cloudflare.workers.dev/glossary");
	},
};
