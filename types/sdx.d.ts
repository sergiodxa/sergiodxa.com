import "@remix-run/server-runtime";
import type {
	DynamicLinksFunction,
	ExternalScriptsFunction,
	StructuredDataFunction,
} from "remix-utils";
import type { IAirtableService } from "~/airtable";
import type { IAuthService } from "~/auth";
import type { ICollectedNotesService } from "~/cn";
import type { Env } from "~/env";
import type { IGitHubService } from "~/gh";
import type { ILoggingService } from "~/logging";

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
			auth: IAuthService;
			airtable: IAirtableService;
			cn: ICollectedNotesService;
			gh: IGitHubService;
			log: ILoggingService;
		};
	}
}
