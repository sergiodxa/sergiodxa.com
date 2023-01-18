import type { AppLoadContext } from "@remix-run/cloudflare";

import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

import { BookmarksRepo } from "~/repositories/bookmarks";
import { DataRepo } from "~/repositories/data";
import { NotesRepo } from "~/repositories/notes";
import { envSchema } from "~/server/env";
import { ArchiveService } from "~/services/archive";
import { AuthService } from "~/services/auth";
import { BookmarksService } from "~/services/bookmarks";
import { FeedService } from "~/services/feed";
import { GitHubService } from "~/services/gh";
import { LoggingService } from "~/services/logging";
import { CollectedNotes } from "~/services/notes";
import { Tutorials } from "~/services/tutorials";

const handleRequest = createPagesFunctionHandler({
	build,
	mode: process.env.NODE_ENV,
	getLoadContext(context): AppLoadContext {
		// Environment variables
		let env: AppLoadContext["env"] = envSchema.parse(context.env);

		let { hostname } = new URL(context.request.url);

		// Repositories to interact with the outside world
		let repos: SDX.Repos = {
			notes: new NotesRepo(env.CN_EMAIL, env.CN_TOKEN, env.CN_SITE),
			bookmarks: new BookmarksRepo(
				env.AIRTABLE_API_KEY,
				env.AIRTABLE_BASE,
				env.AIRTABLE_TABLE_ID
			),
			data: new DataRepo(context.env.data),
		};

		// Services to contain business logic
		let services: SDX.Services = {
			notes: {
				read: new CollectedNotes.ReadNoteService(repos, context.env.cn),
				webhook: new CollectedNotes.WebhookService(repos, context.env.cn),
			},
			tutorials: {
				search: new Tutorials.SearchTutorials(repos),
				list: new Tutorials.ListTutorials(repos),
				read: new Tutorials.ReadTutorial(repos),
				rss: new Tutorials.RSSFeedTutorials(repos),
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
		};

		return { env, services, repos };
	},
});

export async function onRequest(context: EventContext<any, any, any>) {
	return await handleRequest(context);
}
