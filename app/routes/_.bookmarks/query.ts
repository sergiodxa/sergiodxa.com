import type { AppLoadContext } from "@remix-run/cloudflare";

import { z } from "zod";

import { Like } from "~/models/like.server";
import { Cache } from "~/modules/cache.server";
import { database } from "~/services/db.server";

const SearchResultSchema = z.object({
	title: z.string(),
	url: z.string().url(),
	cached: z.string().url(),
});

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
					let date = article.createdAt
						.toISOString()
						.replaceAll("-", "")
						.replaceAll(":", "")
						.replaceAll(".", "")
						.replace("T", "");

					let url = article.url.toString();

					let cached = `https://web.archive.org/web/${date}/${url}`;

					return { title: article.title, url, cached };
				}),
			);
		},
		{ ttl: 60 * 60 * 24 },
	);

	return SearchResultSchema.array().parse(JSON.parse(result));
}
