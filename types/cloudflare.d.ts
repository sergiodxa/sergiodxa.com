/// <reference types="@cloudflare/workers-types" />

interface Env {
	auth: KVNamespace;
	airtable: KVNamespace;
	cn: KVNamespace;
	gh: KVNamespace;
	tutorials: KVNamespace;
	[key: string]: unknown;
}
