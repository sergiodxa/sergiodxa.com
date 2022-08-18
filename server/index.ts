import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

// import { envSchema } from "./env";

const handleRequest = createPagesFunctionHandler({
	build,
	mode: process.env.NODE_ENV,
	getLoadContext(context) {
		// let env = envSchema.parse(context.env);
		return { env: context.env };
	},
});

export function onRequest(context: EventContext<any, any, any>) {
	return handleRequest(context);
}
