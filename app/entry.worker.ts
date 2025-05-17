import * as build from "virtual:react-router/server-build";
import type { ExecutionContext } from "@cloudflare/workers-types";
import { createRequestHandler } from "react-router";
import { CloudflareContext } from "./middleware/bindings";

const handler = createRequestHandler(build);

export default {
	async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
		let context = new Map([[CloudflareContext, { env, ctx, cf: request.cf }]]);
		return await handler(request, context);
	},
};
