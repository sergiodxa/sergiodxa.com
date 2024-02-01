import type { AppLoadContext } from "@remix-run/cloudflare";

import { z } from "zod";

import { Article } from "~/models/article.server";
import { Glossary } from "~/models/glossary.server";
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

const GlossaryItemSchema = z.object({
	type: z.literal("glossary"),
	id: z.string().uuid(),
	payload: PayloadSchema,
});

type ArticleItem = Awaited<ReturnType<typeof queryArticles>>[number];
type BookmarkItem = Awaited<ReturnType<typeof queryBookmarks>>[number];
type TutorialItem = Awaited<ReturnType<typeof queryTutorials>>[number];
type GlossaryItem = Awaited<ReturnType<typeof queryGlossary>>[number];

export async function queryArticles(
	context: AppLoadContext,
	query: string | null,
) {
	let db = database(context.db);

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let result: string;
	if (query) {
		result = await cache.fetch(
			`feed:articles:search:${query}`,
			async () => {
				let articles = await Article.search({ db }, query);
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
			},
			{ ttl: 60 * 60 * 24 },
		);
	} else {
		result = await cache.fetch(
			"feed:articles",
			async () => {
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
			},
			{ ttl: 60 * 60 * 24 },
		);
	}

	return ArticleItemSchema.array().parse(JSON.parse(result));
}

export async function queryBookmarks(
	context: AppLoadContext,
	query: string | null,
) {
	let db = database(context.db);

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let result: string;

	if (query) {
		result = await cache.fetch(
			`feed:bookmarks:search:${query}`,
			async () => {
				let likes = await Like.search({ db }, query);
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
			},
			{ ttl: 60 * 60 * 24 },
		);
	} else {
		result = await cache.fetch(
			"feed:bookmarks",
			async () => {
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
			},
			{ ttl: 60 * 60 * 24 },
		);
	}

	return BookmarkItemSchema.array().parse(JSON.parse(result));
}

export async function queryTutorials(
	context: AppLoadContext,
	query: string | null,
) {
	let db = database(context.db);

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let result: string;

	if (query) {
		result = await cache.fetch(
			`feed:tutorials:search:${query}`,
			async () => {
				let tutorials = await Tutorial.search({ db }, query);
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
			},
			{ ttl: 60 * 60 * 24 },
		);
	} else {
		result = await cache.fetch(
			"feed:tutorials",
			async () => {
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
			},
			{ ttl: 60 * 60 * 24 },
		);
	}

	return TutorialItemSchema.array().parse(JSON.parse(result));
}

export async function queryGlossary(
	context: AppLoadContext,
	query: string | null,
) {
	let db = database(context.db);

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let result: string;
	if (query) {
		result = await cache.fetch(
			`feed:glossary:search:${query}`,
			async () => {
				let glossary = await Glossary.search({ db }, query);
				let items = glossary.map<GlossaryItem>((item) => {
					return {
						id: item.id,
						type: "glossary",
						payload: {
							title: item.term,
							link: item.pathname,
							createdAt: new Date(item.createdAt).getTime(),
						},
					};
				});
				return JSON.stringify(items);
			},
			{ ttl: 60 * 60 * 24 },
		);
	} else {
		result = await cache.fetch(
			"feed:glossary",
			async () => {
				let glossary = await Glossary.list({ db });
				let items = glossary.map<GlossaryItem>((item) => {
					return {
						id: item.id,
						type: "glossary",
						payload: {
							title: item.term,
							link: item.pathname,
							createdAt: new Date(item.createdAt).getTime(),
						},
					};
				});
				return JSON.stringify(items);
			},
			{ ttl: 60 * 60 * 24 },
		);
	}

	return GlossaryItemSchema.array().parse(JSON.parse(result));
}

export function sort(
	items: Array<ArticleItem | BookmarkItem | TutorialItem | GlossaryItem>,
) {
	return items.sort((a, b) => b.payload.createdAt - a.payload.createdAt);
}
