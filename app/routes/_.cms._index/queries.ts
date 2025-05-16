import { count, eq } from "drizzle-orm";
import { posts } from "~/db/schema";
import { getBindings } from "~/middleware/bindings";
import { getDB } from "~/middleware/drizzle";
import { Like } from "~/models/like.server";
import type { UUID } from "~/utils/uuid";

export async function queryStats() {
	let db = getDB();

	let [articles, likes, tutorials, glossary] = await Promise.all(
		[
			"article" as const,
			"like" as const,
			"tutorial" as const,
			"glossary" as const,
		].map(async (type) => {
			let results = await db
				.select({ value: count() })
				.from(posts)
				.where(eq(posts.type, type));
			return results.at(0)?.value ?? 0;
		}),
	);

	return { articles, likes, tutorials, glossary };
}

export async function createQuickLike(url: URL, userId: UUID) {
	let db = getDB();

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

export async function queryLastDaySearch() {
	let [articles, tutorials, feedArticles, feedTutorials] = await Promise.all([
		listCache("articles:search:"),
		listCache("tutorials:search:"),
		listCache("feed:articles:search:"),
		listCache("feed:tutorials:search:"),
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

async function listCache(prefix?: string, limit = 1000) {
	let bindings = getBindings();
	let list = await bindings.kv.cache.list({ prefix, limit });
	return list.keys.map((key) => key.name);
}
