import "@remix-run/server-runtime";
import type { ExternalScriptsFunction } from "remix-utils/external-scripts";
import type { Env } from "~/server/env";
import type { BookmarksRepo } from "~/server/repositories/bookmarks";
import type { CollectedNotes } from "~/server/repositories/collected-notes";
import type { GithubRepository } from "~/server/repositories/github";
import type { KVTutorialRepository } from "~/server/repositories/kv-tutorial";
import type { NotesRepo } from "~/server/repositories/notes";
import type { ArchiveService } from "~/server/services/archive";
import type { IAuthService } from "~/server/services/auth";
import type { BookmarksService } from "~/server/services/bookmarks";
import type { CollectedNotesWebhookService } from "~/server/services/cn-webhook";
import type { FeedService } from "~/server/services/feed";
import type { IGitHubService } from "~/server/services/gh";
import type { ILoggingService } from "~/server/services/logging";
import type { Measurer } from "~/server/services/measure";
import type { ArticlesService } from "~/server/services/new/articles";
import type { TutorialsService as NewTutorialsService } from "~/server/services/new/tutorials";
import type { ReadNoteService } from "~/server/services/read-note";
import type { TutorialsService } from "~/server/services/tutorials";

interface HydrateFunction<LoaderData> {
	(data: LoaderData): boolean;
}

declare global {
	namespace SDX {
		export type Handle<LoaderData = unknown> = {
			i18n?: string | string[];
			hydrate?: boolean | HydrateFunction<LoaderData>;
			scripts?: ExternalScriptsFunction;
		};

		export interface Repos {
			cn: InstanceType<typeof CollectedNotes>;
			notes: NotesRepo;
			bookmarks: BookmarksRepo;
			github: GithubRepository;
			tutorials: KVTutorialRepository;
		}

		export interface Services {
			notes: { read: ReadNoteService; webhook: CollectedNotesWebhookService };
			archive: ArchiveService;
			feed: FeedService;
			bookmarks: BookmarksService;
			auth: IAuthService;
			gh: IGitHubService;
			log: ILoggingService;
			tutorials: TutorialsService;
			new: { articles: ArticlesService; tutorials: NewTutorialsService };
		}
	}
}

declare module "@remix-run/server-runtime" {
	export interface AppLoadContext {
		env: Env;
		services: SDX.Services;
		repos: SDX.Repos;
		time: Measurer["time"];
	}
}
