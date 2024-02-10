import type { AppLoadContext } from "@remix-run/cloudflare";

import { Cache } from "~/modules/cache.server";

export async function clearCache(context: AppLoadContext) {
	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let cacheKeys = await Promise.all([
		cache.list("tutorials:search:"),
		cache.list("feed:tutorials:"),
	]);

	await Promise.all(cacheKeys.flat().map((key) => cache.delete(key)));
	await cache.delete("tutorials:list");
	await cache.delete("feed:tutorials");
}
