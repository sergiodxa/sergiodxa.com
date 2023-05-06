/// <reference types="@cloudflare/workers-types" />

interface RuntimeEnv {
	auth: KVNamespace;
	airtable: KVNamespace;
	cn: KVNamespace;
	gh: KVNamespace;
	tutorials: KVNamespace;
	DSN?: string | undefined;
	[key: string]: unknown;
}
