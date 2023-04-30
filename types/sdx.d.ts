import "@remix-run/server-runtime";
import type {
	DynamicLinksFunction,
	ExternalScriptsFunction,
	StructuredDataFunction,
} from "remix-utils";
import type { Thing } from "schema-dts";
import type { BookmarksRepo } from "~/repositories/bookmarks";
import type { CollectedNotes } from "~/repositories/collected-notes";
import type { GithubRepository } from "~/repositories/github";
import type { KVTutorialRepository } from "~/repositories/kv-tutorial";
import type { NotesRepo } from "~/repositories/notes";
import type { Env } from "~/server/env";
import type { ArchiveService } from "~/services/archive";
import type { IAuthService } from "~/services/auth";
import type { BookmarksService } from "~/services/bookmarks";
import type { CollectedNotesWebhookService } from "~/services/cn-webhook";
import type { FeedService } from "~/services/feed";
import type { IGitHubService } from "~/services/gh";
import type { ILoggingService } from "~/services/logging";
import type { Measurer } from "~/services/measure";
import type { ReadNoteService } from "~/services/read-note";
import type { TutorialsService } from "~/services/tutorials";

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
