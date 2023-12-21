/// <reference types="@cloudflare/workers-types" />

interface RuntimeEnv {
	auth: KVNamespace;
	airtable: KVNamespace;
	cn: KVNamespace;
	gh: KVNamespace;
	tutorials: KVNamespace;
	DB: D1Database;
	DSN?: string | undefined;
	[key: string]: unknown;
}
