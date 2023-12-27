import type { AppLoadContext } from "@remix-run/cloudflare";

import { z } from "zod";

import { Article } from "~/models/article.server";
import { Bookmark } from "~/models/bookmark.server";
import { Tutorial } from "~/models/tutorial.server";
import { Cache } from "~/modules/cache.server";
import { Airtable } from "~/services/airtable.server";
import { Cache as OldCache } from "~/services/cache.server";
import { database } from "~/services/db.server";
import { GitHub } from "~/services/github.server";

const ItemPayloadSchema = z.object({
	title: z.string(),
	link: z.string(),
	createdAt: z.number(),
});

const ArticleItemSchema = z.object({
	type: z.literal("article"),
	id: z.string().uuid(),
	payload: ItemPayloadSchema,
});

const BookmarkItemSchema = z.object({
	type: z.literal("bookmark"),
	id: z.string().uuid(),
	payload: ItemPayloadSchema,
});

const TutorialItemSchema = z.object({
	type: z.literal("tutorial"),
	id: z.string().uuid(),
	payload: ItemPayloadSchema,
});

const ItemSchema = z.discriminatedUnion("type", [
	ArticleItemSchema,
	BookmarkItemSchema,
	TutorialItemSchema,
]);

type Item = z.output<typeof ItemSchema>;

type ArticleItem = Extract<Item, { type: "article" }>;
type BookmarkItem = Extract<Item, { type: "bookmark" }>;
type TutorialItem = Extract<Item, { type: "tutorial" }>;

export class Feed {
	static sort(
		articles: Array<ArticleItem>,
		bookmarks: Array<BookmarkItem>,
		tutorials: Array<TutorialItem>,
	) {
		return [...articles, ...bookmarks, ...tutorials].sort(
			(a, b) => b.payload.createdAt - a.payload.createdAt,
		);
	}

	static async bookmarks(context: AppLoadContext) {
		let cache = new OldCache(context.kv.airtable);
		let airtable = new Airtable(
			context.env.AIRTABLE_API_KEY,
			context.env.AIRTABLE_BASE,
			context.env.AIRTABLE_TABLE_ID,
		);

		let bookmarks = await Bookmark.list({ cache, airtable });

		return bookmarks.map((bookmark) => {
			return {
				id: String(bookmark.id),
				type: "bookmark",
				payload: {
					title: bookmark.title,
					link: bookmark.url,
					createdAt: new Date(bookmark.createdAt).getTime(),
				},
			} as const;
		});
	}

	static async articles(context: AppLoadContext) {
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

	static async tutorials(context: AppLoadContext) {
		let kv = context.kv.tutorials;
		let gh = new GitHub(context.env.GH_APP_ID, context.env.GH_APP_PEM);

		let tutorials = await Tutorial.list({ kv, gh });

		return tutorials
			.filter((tutorial) => tutorial.createdAt)
			.map((tutorial) => {
				return {
					id: String(tutorial.slug),
					type: "tutorial",
					payload: {
						title: tutorial.title,
						link: `/tutorials/${tutorial.slug}`,
						createdAt: new Date(tutorial.createdAt!).getTime(),
					},
				} as const;
			});
	}
}
