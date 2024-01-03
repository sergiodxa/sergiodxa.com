import type { AppLoadContext } from "@remix-run/cloudflare";
import type { UUID } from "~/utils/uuid";

import { count, eq } from "drizzle-orm";

import { Like } from "~/models/like.server";
import { Cache } from "~/modules/cache.server";
import { Tables, database } from "~/services/db.server";

export async function queryStats(context: AppLoadContext) {
	let db = database(context.db);

	let [articles, likes, tutorials] = await Promise.all(
		["article" as const, "like" as const, "tutorial" as const].map(
			async (type) => {
				let results = await db
					.select({ value: count() })
					.from(Tables.posts)
					.where(eq(Tables.posts.type, type));
				return results.at(0)?.value ?? 0;
			},
		),
	);

	return { articles, likes, tutorials };
}

export async function createQuickLike(
	context: AppLoadContext,
	url: URL,
	userId: UUID,
) {
	let response = await fetch(url, {
		method: "GET",
		redirect: "follow",
		headers: { Accept: "text/html", "User-Agent": "SDX Like Bot" },
	});

	if (!response.ok) throw new Error("Can't create like for this URL");

	let html = await response.text();

	let title = html.match(/<title>(?<title>.+?)<\/title>/)?.groups?.title.trim();

	if (!title) throw new Error("Couldn't find title for this URL");

	let db = database(context.db);

	await Like.create({ db }, { title, url: url.toString(), authorId: userId });
}

export async function queryLastDaySearch(context: AppLoadContext) {
	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let [articles, tutorials, feedArticles, feedTutorials] = await Promise.all([
		cache.list("articles:search:"),
		cache.list("tutorials:search:"),
		cache.list("feed:articles:search:"),
		cache.list("feed:tutorials:search:"),
	]);

	return {
		articles: [...articles, ...feedArticles]
			.map((key) => key.replace("articles:search:", "").replace("feed:", ""))
			.sort((a, b) => a.localeCompare(b)),
		tutorials: [...tutorials, ...feedTutorials]
			.map((key) => {
				key = key.replace("tutorials:search:", "").replace("feed:", "");
				if (!key.startsWith("tech:")) return key;
				return key.replace("tech:", "");
			})
			.sort((a, b) => a.localeCompare(b)),
	};
}
