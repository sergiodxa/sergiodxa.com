import type { AppLoadContext } from "@remix-run/cloudflare";

import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

import { envSchema } from "~/env";
import { AirtableService } from "~/services/airtable";
import { CollectedNotesService } from "~/services/cn";
import { GitHubService } from "~/services/gh";

const handleRequest = createPagesFunctionHandler({
	build,
	mode: process.env.NODE_ENV,
	getLoadContext(context): AppLoadContext {
		// Environment variables
		let env: AppLoadContext["env"] = envSchema.parse(context.env);

		// Injected services objects to interact with third-party services
		let services: AppLoadContext["services"] = {
			airtable: new AirtableService(
				env.AIRTABLE_API_KEY,
				env.AIRTABLE_BASE,
				env.AIRTABLE_TABLE_ID
			),
			cn: new CollectedNotesService(env.CN_EMAIL, env.CN_TOKEN, env.CN_SITE),
			gh: new GitHubService(env.GITHUB_TOKEN),
		};

		return { env, services };
	},
});

export function onRequest(context: EventContext<any, any, any>) {
	return handleRequest(context);
}
