import { logDevReady } from "@remix-run/cloudflare";
import * as build from "@remix-run/dev/server-build";
import * as Sentry from "@sentry/remix";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { cache } from "hono/cache";
import { handle } from "hono/cloudflare-pages";
import { logger } from "hono/logger";
import { cacheHeader } from "pretty-cache-header";
import { remix } from "remix-hono/handler";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";

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

if (process.env.NODE_ENV === "development") logDevReady(build);

type ContextEnv = { Bindings: RuntimeEnv };

const server = new Hono<ContextEnv>();

server.use("/write", (context, next) => {
	let { WRITE_PASSWORD } = EnvSchema.parse(context.env);
	return basicAuth({ username: "sergiodxa", password: WRITE_PASSWORD })(
		context,
		next,
	);
});

server.use(
	"*",
	logger(),
	(context, next) => {
		let { searchParams } = new URL(context.req.url);
		if (searchParams.has("_data")) return next();
		return cache({
			cacheName: "htmlDocuments",
			cacheControl: cacheHeader({ maxAge: "1m" }),
		})(context, next);
	},
	remix<ContextEnv>({
		build,
		mode: process.env.NODE_ENV as "development" | "production",
		getLoadContext(ctx) {
			if (ctx.env.DSN) {
				Sentry.init({
					dsn: ctx.env.DSN,
					tracesSampleRate: 1.0,
					allowUrls: ["*.sergiodxa.com"],
					attachStacktrace: true,
					beforeSend(event) {
						if (event.request?.url?.includes("sentry")) return null;
						event.user = {};

						let ip = getClientIPAddress(ctx.req.headers);
						if (ip) event.user.ip_address = ip;

						return event;
					},
				});
			}

			let env = EnvSchema.parse(ctx.env);

			let { hostname } = new URL(ctx.req.url);

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

			return {
				waitUntil: ctx.executionCtx.waitUntil.bind(ctx.executionCtx),
				kv: { tutorials: ctx.env.tutorials, auth: ctx.env.auth },
				env,
				services,
				repos,
				time: measurer.time.bind(measurer),
			};
		},
	}),
);

export const onRequest = handle(server);
