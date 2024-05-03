import type { AppLoadContext } from "@remix-run/cloudflare";

import { z } from "zod";

import { Tutorial } from "~/models/tutorial.server";
import { Cache } from "~/modules/cache.server";
import { database } from "~/services/db.server";
import { isEmpty } from "~/utils/arrays";

const SearchResultSchema = z.object({
	path: z.string(),
	title: z.string(),
});

export async function queryTutorials(
	context: AppLoadContext,
	query: string | null,
) {
	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);
	let db = database(context.db);

	let key = query ? `tutorials:search:${query}` : "tutorials:list";

	let result = await cache.fetch(
		key,
		async () => {
			let tutorials = query
				? await Tutorial.search({ db }, query)
				: await Tutorial.list({ db });

			return JSON.stringify(
				tutorials.map((tutorial) => {
          if (tutorial instanceof Tutorial) {
            return {
              path: tutorial.pathname,
              title: tutorial.title,
            };
          }

          return {
            path: tutorial.item.pathname,
            title: tutorial.item.title,
          }
				}),
			);
		},
		{ ttl: 60 * 60 * 24 },
	);

	let data = SearchResultSchema.array().parse(JSON.parse(result));

	if (isEmpty(data)) context.waitUntil(cache.delete(key));

	return data;
}
