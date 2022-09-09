import "@remix-run/server-runtime";
import type {
	DynamicLinksFunction,
	ExternalScriptsFunction,
	StructuredDataFunction,
} from "remix-utils";
import type { Env } from "~/env";
import type { IAirtableService } from "~/services/airtable";
import type { ICollectedNotesService } from "~/services/cn";
import type { IGitHubService } from "~/services/gh";
import type { ILoggingService } from "~/services/logging";

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
		services: {
			airtable: IAirtableService;
			cn: ICollectedNotesService;
			gh: IGitHubService;
			log: ILoggingService;
		};
	}
}
