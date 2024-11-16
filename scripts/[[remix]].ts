import { createRequestHandler, logDevReady } from "@remix-run/cloudflare";

import * as build from "~/build";
import { EnvSchema } from "~/server/env";
import { BookmarksRepo } from "~/server/repositories/bookmarks";
import { CollectedNotes } from "~/server/repositories/collected-notes";
import { GithubRepository } from "~/server/repositories/github";
import { KVTutorialRepository } from "~/server/repositories/kv-tutorial";
import { NotesRepo } from "~/server/repositories/notes";
import { ArchiveService } from "~/server/services/archive";
import { AuthService } from "~/server/services/auth";
import { BookmarksService } from "~/server/services/bookmarks";
import { CollectedNotesWebhookService } from "~/server/services/cn-webhook";
import { FeedService } from "~/server/services/feed";
import { GitHubService } from "~/server/services/gh";
import { LoggingService } from "~/server/services/logging";
import { Measurer } from "~/server/services/measure";
import { ArticlesService } from "~/server/services/new/articles";
import { TutorialsService as NewTutorialsService } from "~/server/services/new/tutorials";
import { ReadNoteService } from "~/server/services/read-note";
import { TutorialsService } from "~/server/services/tutorials";

let remixHandler: ReturnType<typeof createRequestHandler>;

if (process.env.NODE_ENV === "development") {
	logDevReady(build);
}

export const onRequest: PagesFunction<RuntimeEnv> = async (ctx) => {
	let env = EnvSchema.parse(ctx.env);

	if (!remixHandler) {
		remixHandler = createRequestHandler(
			build,
			env.CF_PAGES ? "production" : "development",
		);
	}

	let { hostname } = new URL(ctx.request.url);

	// Repositories to interact with the database
	let repos: SDX.Repos = {
		cn: new CollectedNotes(`${env.CN_EMAIL} ${env.CN_TOKEN}`),
		notes: new NotesRepo(env.CN_EMAIL, env.CN_TOKEN, env.CN_SITE),
		bookmarks: new BookmarksRepo(
			env.AIRTABLE_API_KEY,
			env.AIRTABLE_BASE,
			env.AIRTABLE_TABLE_ID,
		),
		github: new GithubRepository(env.GITHUB_TOKEN),
		tutorials: new KVTutorialRepository(ctx.env.tutorials),
	};

	// Injected services objects to interact with third-party services
	let services: SDX.Services = {
		notes: {
			read: new ReadNoteService(repos, ctx.env.cn),
			webhook: new CollectedNotesWebhookService(repos, ctx.env.cn),
		},
		archive: new ArchiveService(repos, ctx.env.cn),
		feed: new FeedService(repos, {
			airtable: ctx.env.airtable,
			cn: ctx.env.cn,
			tutorials: ctx.env.tutorials,
		}),
		auth: new AuthService(
			ctx.env.auth,
			env,
			hostname,
			new GitHubService(ctx.env.gh, env.GITHUB_TOKEN),
		),
		bookmarks: new BookmarksService(repos, ctx.env.airtable),
		gh: new GitHubService(ctx.env.gh, env.GITHUB_TOKEN),
		log: new LoggingService(env.LOGTAIL_SOURCE_TOKEN),
		tutorials: new TutorialsService(repos),
		new: {
			articles: new ArticlesService(`${env.CN_EMAIL} ${env.CN_TOKEN}`),
			tutorials: new NewTutorialsService(`${env.CN_EMAIL} ${env.CN_TOKEN}`),
		},
	};

	let measurer = new Measurer();

	let response = await remixHandler(ctx.request, {
		env,
		services,
		repos,
		time: measurer.time.bind(measurer),
	});

	measurer.toHeaders(response.headers);

	return response;
};
