import type { AppLoadContext } from "@remix-run/cloudflare";

import { Article } from "~/models/article.server";
import { Bookmark } from "~/models/bookmark.server";
import { Tutorial } from "~/models/tutorial.server";
import { Airtable } from "~/services/airtable.server";
import { Cache } from "~/services/cache.server";
import { CollectedNotes } from "~/services/cn.server";
import { GitHub } from "~/services/github.server";

export class Feed {
	static async bookmarks(context: AppLoadContext) {
		let cache = new Cache(context.kv.airtable);
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
		let cache = new Cache(context.kv.cn);
		let cn = new CollectedNotes(
			context.env.CN_EMAIL,
			context.env.CN_TOKEN,
			context.env.CN_SITE,
		);

		let articles = await Article.list({ cache, cn }, 1);

		return articles.map((article) => {
			return {
				id: String(article.path),
				type: "article",
				payload: {
					title: article.title,
					link: `/articles/${article.path}`,
					createdAt: new Date(article.createdAt).getTime(),
				},
			} as const;
		});
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
