import "@remix-run/server-runtime";
import type { ExternalScriptsFunction } from "remix-utils/external-scripts";
import type { Env } from "~/server/env";
import type { Measurer } from "~/server/measure";

type HydrateFunction<LoaderData> = (data: LoaderData) => boolean;

declare global {
	namespace SDX {
		export type Handle<LoaderData = unknown> = {
			i18n?: string | string[];
			hydrate?: boolean | HydrateFunction<LoaderData>;
			scripts?: ExternalScriptsFunction;
		};
	}
}

declare module "@remix-run/server-runtime" {
	export interface AppLoadContext {
		db: D1Database;
		fs: Record<"backups", R2Bucket>;
		kv: Record<"cache" | "auth" | "redirects", KVNamespace>;
		env: Env;
		time: Measurer["time"];
		waitUntil(promise: Promise<unknown>): void;
	}
}
