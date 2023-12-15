import "@remix-run/server-runtime";
import type { ExternalScriptsFunction } from "remix-utils/external-scripts";
import type { Env } from "~/server/env";
import type { BookmarksRepo } from "~/server/repositories/bookmarks";
import type { GithubRepository } from "~/server/repositories/github";
import type { KVTutorialRepository } from "~/server/repositories/kv-tutorial";
import type { NotesRepo } from "~/server/repositories/notes";
import type { FeedService } from "~/server/services/feed";
import type { Measurer } from "~/server/services/measure";

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
			notes: NotesRepo;
			bookmarks: BookmarksRepo;
			github: GithubRepository;
			tutorials: KVTutorialRepository;
		}

		export interface Services {
			feed: FeedService;
		}
	}
}

declare module "@remix-run/server-runtime" {
	export interface AppLoadContext {
		kv: Record<"tutorials" | "airtable" | "auth" | "cn", KVNamespace>;
		waitUntil(promise: Promise<unknown>): void;
		env: Env;
		services: SDX.Services;
		time: Measurer["time"];
	}
}
