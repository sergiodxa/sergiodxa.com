import type { AppLoadContext } from "@remix-run/cloudflare";

import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

import { AirtableService } from "~/airtable";
import { AuthService } from "~/auth";
import { CollectedNotesService } from "~/cn";
import { envSchema } from "~/env";
import { GitHubService } from "~/gh";
import { LoggingService } from "~/logging";

const handleRequest = createPagesFunctionHandler({
	build,
	mode: process.env.NODE_ENV,
	getLoadContext(context): AppLoadContext {
		// Environment variables
		let env: AppLoadContext["env"] = envSchema.parse(context.env);

		let { hostname } = new URL(context.request.url);

		// Injected services objects to interact with third-party services
		let services: AppLoadContext["services"] = {
			auth: new AuthService(
				context.env.auth,
				env,
				hostname,
				new GitHubService(context.env.gh, env.GITHUB_TOKEN)
			),
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
	return await handleRequest(context);
}
