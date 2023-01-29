import type { AppLoadContext } from "@remix-run/cloudflare";

import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

import { BookmarksRepo } from "~/repositories/bookmarks";
import { GithubRepository } from "~/repositories/github";
import { KVTutorialRepository } from "~/repositories/kv-tutorial";
import { NotesRepo } from "~/repositories/notes";
import { envSchema } from "~/server/env";
import { ArchiveService } from "~/services/archive";
import { AuthService } from "~/services/auth";
import { BookmarksService } from "~/services/bookmarks";
import { CollectedNotesWebhookService } from "~/services/cn-webhook";
import { FeedService } from "~/services/feed";
import { GitHubService } from "~/services/gh";
import { LoggingService } from "~/services/logging";
import { ReadNoteService } from "~/services/read-note";
import { TutorialsService } from "~/services/tutorials";

const handleRequest = createPagesFunctionHandler({
	build,
	mode: process.env.NODE_ENV,
	getLoadContext(context): AppLoadContext {
		// Environment variables
		let env: AppLoadContext["env"] = envSchema.parse(context.env);

		let { hostname } = new URL(context.request.url);

		// Repositories to interact with the database
		let repos: SDX.Repos = {
			notes: new NotesRepo(env.CN_EMAIL, env.CN_TOKEN, env.CN_SITE),
			bookmarks: new BookmarksRepo(
				env.AIRTABLE_API_KEY,
				env.AIRTABLE_BASE,
				env.AIRTABLE_TABLE_ID
			),
			github: new GithubRepository(env.GITHUB_TOKEN),
			tutorials: new KVTutorialRepository(context.env.tutorials),
		};

		// Injected services objects to interact with third-party services
		let services: SDX.Services = {
			notes: {
				read: new ReadNoteService(repos, context.env.cn),
				webhook: new CollectedNotesWebhookService(repos, context.env.cn),
			},
			archive: new ArchiveService(repos, context.env.cn),
			feed: new FeedService(repos, {
				airtable: context.env.airtable,
				cn: context.env.cn,
			}),
			auth: new AuthService(
				context.env.auth,
				env,
				hostname,
				new GitHubService(context.env.gh, env.GITHUB_TOKEN)
			),
			bookmarks: new BookmarksService(repos, context.env.airtable),
			gh: new GitHubService(context.env.gh, env.GITHUB_TOKEN),
			log: new LoggingService(context.env.LOGTAIL_SOURCE_TOKEN),
			tutorials: new TutorialsService(repos),
		};

		return { env, services, repos };
	},
});

export async function onRequest(context: EventContext<any, any, any>) {
	return await handleRequest(context);
}
