import type { AppLoadContext } from "@remix-run/cloudflare";

import { z } from "zod";

import { Article } from "~/models/db-article.server";
import { Cache } from "~/services/cache.server";
import { database } from "~/services/db.server";

const SearchResultSchema = z.object({ path: z.string(), title: z.string() });

export async function queryArticles(
	context: AppLoadContext,
	query: string | null,
	noCache: boolean,
) {
	let cache = new Cache(context.kv.cache);
	let db = database(context.db);

	let key = query ? `articles:search:${query}` : "articles:list";

	if (!noCache) {
		let cached = await cache.get(key);
		if (cached) return SearchResultSchema.array().parse(JSON.parse(cached));
	}

	let articles = query
		? await Article.search({ db }, query)
		: await Article.list({ db });

	let result = SearchResultSchema.array().parse(
		articles.map((article) => {
			return { path: article.pathname, title: article.title };
		}),
	);

	context.waitUntil(
		cache.set(key, JSON.stringify(result), {
			expirationTtl: 60 * 60 * 24,
		}),
	);

	return result;
}
