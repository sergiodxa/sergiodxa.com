/// <reference types="@cloudflare/workers-types" />

interface RuntimeEnv {
	auth: KVNamespace;
	cache: KVNamespace;
	redirects: KVNamspace;
	DB: D1Database;
	DSN?: string | undefined;
	[key: string]: unknown;
}
