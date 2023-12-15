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

		return Bookmark.list({ cache, airtable });
	}

	static async articles(context: AppLoadContext) {
		let cache = new Cache(context.kv.cn);
		let cn = new CollectedNotes(
			context.env.CN_EMAIL,
			context.env.CN_TOKEN,
			context.env.CN_SITE,
		);

		return Article.list({ cache, cn }, 1);
	}

	static async tutorials(context: AppLoadContext) {
		let kv = context.kv.tutorials;
		let gh = new GitHub(context.env.GH_APP_ID, context.env.GH_APP_PEM);

		return Tutorial.list({ kv, gh });
	}
}
