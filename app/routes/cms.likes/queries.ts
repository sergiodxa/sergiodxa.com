import type { AppLoadContext } from "@remix-run/cloudflare";
import type { User } from "~/modules/session.server";
import type { UUID } from "~/utils/uuid";

import { Bookmark } from "~/models/bookmark.server";
import { Like } from "~/models/like.server";
import { Airtable } from "~/services/airtable.server";
import { Cache } from "~/services/cache.server";
import { Tables, database } from "~/services/db.server";

export async function importBookmarks(context: AppLoadContext, user: User) {
	let airtable = new Airtable(
		context.env.AIRTABLE_API_KEY,
		context.env.AIRTABLE_BASE,
		context.env.AIRTABLE_TABLE_ID,
	);

	let cache = new Cache(context.kv.airtable);

	let bookmarks = await Bookmark.list({ airtable, cache });

	let db = database(context.db);

	await db.delete(Tables.postMeta).execute();
	await db.delete(Tables.posts).execute();

	await Promise.all(
		bookmarks.map((bookmark) => {
			return Like.create(
				{ db },
				{
					authorId: user.id,
					createdAt: new Date(bookmark.createdAt),
					updatedAt: new Date(bookmark.createdAt),
					title: bookmark.title,
					url: bookmark.url,
				},
			);
		}),
	);
}

export async function deleteLike(context: AppLoadContext, id: UUID) {
	let db = database(context.db);
	await Like.destroy({ db }, id);
}
