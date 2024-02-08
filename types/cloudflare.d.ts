/// <reference types="@cloudflare/workers-types" />

interface RuntimeEnv {
	auth: KVNamespace;
	cache: KVNamespace;
	redirects: KVNamspace;
	backups: R2Bucket;
	DB: D1Database;
	DSN?: string | undefined;
	[key: string]: unknown;
}
