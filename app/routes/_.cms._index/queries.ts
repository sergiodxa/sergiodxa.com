import type { AppLoadContext } from "@remix-run/cloudflare";
import type { UUID } from "~/utils/uuid";

import { count, eq } from "drizzle-orm";

import { Like } from "~/models/like.server";
import { Cache } from "~/modules/cache.server";
import { Tables, database } from "~/services/db.server";

export async function queryStats(context: AppLoadContext) {
	let db = database(context.db);

	let [articles, likes, tutorials, glossary] = await Promise.all(
		[
			"article" as const,
			"like" as const,
			"tutorial" as const,
			"glossary" as const,
		].map(async (type) => {
			let results = await db
				.select({ value: count() })
				.from(Tables.posts)
				.where(eq(Tables.posts.type, type));
			return results.at(0)?.value ?? 0;
		}),
	);

	return { articles, likes, tutorials, glossary };
}

export async function createQuickLike(
	context: AppLoadContext,
	url: URL,
	userId: UUID,
) {
	let db = database(context.db);

	let likes = await Like.list({ db });

	if (likes.some((like) => like.url.toString() === url.toString())) return;

	let response = await fetch(url, {
		method: "GET",
		redirect: "follow",
		headers: { Accept: "text/html", "User-Agent": "SDX Like Bot" },
	});

	if (!response.ok) throw new Error("Can't load the URL to like.");

	let html = await response.text();

	let cheerio = await import("cheerio");
	let $ = cheerio.load(html);

	let title = $("h1").text().trim();
	if (!title) title = $("title").text().trim();

	if (!title) throw new Error("Couldn't find title for this URL");

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
			.map((initialKey) => {
				let key = initialKey
					.replace("tutorials:search:", "")
					.replace("feed:", "");
				if (!key.startsWith("tech:")) return key;
				return key.replace("tech:", "");
			})
			.sort((a, b) => a.localeCompare(b)),
	};
}
