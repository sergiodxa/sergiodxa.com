import type { AppLoadContext } from "@remix-run/cloudflare";

import { z } from "zod";

import { Article } from "~/models/article.server";
import { Like } from "~/models/like.server";
import { Tutorial } from "~/models/tutorial.server";
import { Cache } from "~/modules/cache.server";
import { database } from "~/services/db.server";

const PayloadSchema = z.object({
	title: z.string(),
	link: z.string(),
	createdAt: z.number(),
});

const ArticleItemSchema = z.object({
	type: z.literal("article"),
	id: z.string().uuid(),
	payload: PayloadSchema,
});

const BookmarkItemSchema = z.object({
	type: z.literal("bookmark"),
	id: z.string().uuid(),
	payload: PayloadSchema,
});

const TutorialItemSchema = z.object({
	type: z.literal("tutorial"),
	id: z.string().uuid(),
	payload: PayloadSchema,
});

type ArticleItem = Awaited<ReturnType<typeof queryArticles>>[number];
type BookmarkItem = Awaited<ReturnType<typeof queryBookmarks>>[number];
type TutorialItem = Awaited<ReturnType<typeof queryTutorials>>[number];

export async function queryArticles(context: AppLoadContext) {
	let db = database(context.db);

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let result = await cache.fetch("feed:articles", async () => {
		let articles = await Article.list({ db });
		let items = articles.map<ArticleItem>((article) => {
			return {
				id: article.id,
				type: "article",
				payload: {
					title: article.title,
					link: article.pathname,
					createdAt: new Date(article.createdAt).getTime(),
				},
			};
		});
		return JSON.stringify(items);
	});

	return ArticleItemSchema.array().parse(JSON.parse(result));
}

export async function queryBookmarks(context: AppLoadContext) {
	let db = database(context.db);

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let result = await cache.fetch("feed:bookmarks", async () => {
		let likes = await Like.list({ db });
		let items = likes.map<BookmarkItem>((bookmark) => {
			return {
				id: bookmark.id,
				type: "bookmark",
				payload: {
					title: bookmark.title,
					link: bookmark.url.toString(),
					createdAt: new Date(bookmark.createdAt).getTime(),
				},
			};
		});
		return JSON.stringify(items);
	});

	return BookmarkItemSchema.array().parse(JSON.parse(result));
}

export async function queryTutorials(context: AppLoadContext) {
	let db = database(context.db);

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let result = await cache.fetch("feed:tutorials", async () => {
		let tutorials = await Tutorial.list({ db });
		let items = tutorials.map<TutorialItem>((article) => {
			return {
				id: article.id,
				type: "tutorial",
				payload: {
					title: article.title,
					link: article.pathname,
					createdAt: new Date(article.createdAt).getTime(),
				},
			};
		});
		return JSON.stringify(items);
	});

	return TutorialItemSchema.array().parse(JSON.parse(result));
}

export function sort(
	articles: Array<ArticleItem>,
	bookmarks: Array<BookmarkItem>,
	tutorials: Array<TutorialItem>,
) {
	return [...articles, ...bookmarks, ...tutorials].sort(
		(a, b) => b.payload.createdAt - a.payload.createdAt,
	);
}