import type { AppLoadContext } from "@remix-run/cloudflare";

import { z } from "zod";

import { Like } from "~/models/like.server";
import { Cache } from "~/modules/cache.server";
import { database } from "~/services/db.server";

const SearchResultSchema = z.object({ title: z.string(), url: z.string() });

export async function queryBookmarks(context: AppLoadContext) {
	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);
	let db = database(context.db);

	let key = "bookmarks:list";

	let result = await cache.fetch(
		key,
		async () => {
			let bookmarks = await Like.list({ db });

			return JSON.stringify(
				bookmarks.map((article) => {
					return { title: article.title, url: article.url.toString() };
				}),
			);
		},
		{ ttl: 60 * 60 * 24 },
	);

	return SearchResultSchema.array().parse(JSON.parse(result));
}
