/// <reference types="@cloudflare/workers-types" />

interface RuntimeEnv {
	auth: KVNamespace;
	airtable: KVNamespace;
	tutorials: KVNamespace;
	cache: KVNamespace;
	DB: D1Database;
	DSN?: string | undefined;
	[key: string]: unknown;
}
