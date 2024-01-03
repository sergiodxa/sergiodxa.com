import type { AppLoadContext } from "@remix-run/cloudflare";

import { z } from "zod";

import { Article } from "~/models/article.server";
import { Cache } from "~/modules/cache.server";
import { database } from "~/services/db.server";
import { isEmpty } from "~/utils/arrays";

const SearchResultSchema = z.object({ path: z.string(), title: z.string() });

export async function queryArticles(
	context: AppLoadContext,
	query: string | null,
) {
	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);
	let db = database(context.db);

	let key = query ? `articles:search:${query}` : "articles:list";

	let result = await cache.fetch(
		key,
		async () => {
			let articles = query
				? await Article.search({ db }, query)
				: await Article.list({ db });

			return JSON.stringify(
				articles.map((article) => {
					return { path: article.pathname, title: article.title };
				}),
			);
		},
		{ ttl: 60 * 60 * 24 },
	);

	let data = SearchResultSchema.array().parse(JSON.parse(result));

	if (isEmpty(data)) context.waitUntil(cache.delete(key));

	return data;
}
