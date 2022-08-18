import "@remix-run/server-runtime";
import type { Env } from "../server/env";
import type {
	DynamicLinksFunction,
	ExternalScriptsFunction,
	StructuredDataFunction,
} from "remix-utils";

interface HydrateFunction<LoaderData> {
	(data: LoaderData): boolean;
}

declare global {
	namespace SDX {
		export type Handle<LoaderData = unknown> = {
			i18n?: string | string[];
			hydrate?: boolean | HydrateFunction<LoaderData>;
			scripts?: ExternalScriptsFunction;
			dynamicLinks?: DynamicLinksFunction<LoaderData>;
			structuredData?: StructuredDataFunction<LoaderData>;
		};
	}
}

declare module "@remix-run/server-runtime" {
	export interface AppLoadContext {
		env: Env;
	}
}
