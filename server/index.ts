import type { AppLoadContext } from "@remix-run/cloudflare";

import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

import { envSchema } from "~/env";
import { AirtableService } from "~/services/airtable";
import { CollectedNotesService } from "~/services/cn";
import { GitHubService } from "~/services/gh";
import { LoggingService } from "~/services/logging";
import { measure } from "~/utils/measure";

import { AuthService } from "./services/auth";

const handleRequest = createPagesFunctionHandler({
	build,
	mode: process.env.NODE_ENV,
	getLoadContext(context): AppLoadContext {
		// Environment variables
		let env: AppLoadContext["env"] = envSchema.parse(context.env);

		let { hostname } = new URL(context.request.url);

		// Injected services objects to interact with third-party services
		let services: AppLoadContext["services"] = {
			auth: new AuthService(context.env.auth, env, hostname),
			airtable: new AirtableService(
				context.env.airtable,
				env.AIRTABLE_API_KEY,
				env.AIRTABLE_BASE,
				env.AIRTABLE_TABLE_ID
			),
			cn: new CollectedNotesService(
				context.env.cn,
				env.CN_EMAIL,
				env.CN_TOKEN,
				env.CN_SITE
			),
			gh: new GitHubService(context.env.gh, env.GITHUB_TOKEN),
			log: new LoggingService(context.env.LOGTAIL_SOURCE_TOKEN),
		};

		return { env, services };
	},
});

export async function onRequest(context: EventContext<any, any, any>) {
	try {
		return await measure("handle request", () => handleRequest(context));
	} catch (error) {
		console.error(error);
		if (error instanceof Error) {
			return new Response(error.message, { status: 500 });
		}
		return new Response("Internal Server Error", { status: 500 });
	}
}
