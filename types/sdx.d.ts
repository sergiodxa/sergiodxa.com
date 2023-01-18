import "@remix-run/server-runtime";
import type {
	DynamicLinksFunction,
	ExternalScriptsFunction,
	StructuredDataFunction,
} from "remix-utils";
import type { Thing } from "schema-dts";
import type { BookmarksRepo } from "~/repositories/bookmarks";
import type { DataRepo } from "~/repositories/data";
import type { NotesRepo } from "~/repositories/notes";
import type { Env } from "~/server/env";
import type { ArchiveService } from "~/services/archive";
import type { IAuthService } from "~/services/auth";
import type { BookmarksService } from "~/services/bookmarks";
import type { FeedService } from "~/services/feed";
import type { IGitHubService } from "~/services/gh";
import type { ILoggingService } from "~/services/logging";
import type { CollectedNotes } from "~/services/notes";
import type { Tutorials } from "~/services/tutorials";

interface HydrateFunction<LoaderData> {
	(data: LoaderData): boolean;
}

declare global {
	namespace SDX {
		export type Handle<
			LoaderData = unknown,
			StructuredDataThing extends Thing = Thing
		> = {
			i18n?: string | string[];
			hydrate?: boolean | HydrateFunction<LoaderData>;
			scripts?: ExternalScriptsFunction;
			dynamicLinks?: DynamicLinksFunction<LoaderData>;
			structuredData?: StructuredDataFunction<LoaderData, StructuredDataThing>;
		};

		export interface Repos {
			notes: NotesRepo;
			bookmarks: BookmarksRepo;
			data: DataRepo;
		}

		export interface Services {
			notes: {
				read: CollectedNotes.ReadNoteService;
				webhook: CollectedNotes.WebhookService;
			};
			tutorials: {
				search: Tutorials.SearchTutorials;
				list: Tutorials.ListTutorials;
				read: Tutorials.ReadTutorial;
				rss: Tutorials.RSSFeedTutorials;
			};
			archive: ArchiveService;
			feed: FeedService;
			bookmarks: BookmarksService;
			auth: IAuthService;
			gh: IGitHubService;
			log: ILoggingService;
		}
	}
}

declare module "@remix-run/server-runtime" {
	export interface AppLoadContext {
		env: Env;
		services: SDX.Services;
		repos: SDX.Repos;
	}
}
