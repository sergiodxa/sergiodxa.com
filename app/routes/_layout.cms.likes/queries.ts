import type { AppLoadContext } from "@remix-run/cloudflare";
import type { User } from "~/modules/session.server";
import type { UUID } from "~/utils/uuid";

import { eq } from "drizzle-orm";

import { Like } from "~/models/like.server";
import { Airtable } from "~/services/airtable.server";
import { Tables, database } from "~/services/db.server";

export async function importBookmarks(context: AppLoadContext, user: User) {
	let airtable = new Airtable(
		context.env.AIRTABLE_API_KEY,
		context.env.AIRTABLE_BASE,
		context.env.AIRTABLE_TABLE_ID,
	);

	let { records, offset } = await airtable.bookmarks();

	while (offset) {
		let next = await airtable.bookmarks(offset);
		records = records.concat(next.records);
		offset = next.offset;
	}

	let bookmarks = records.map((record) => {
		return {
			id: record.id,
			title: record.fields.title,
			url: record.fields.url,
			createdAt: new Date(record.createdTime),
		};
	});

	let db = database(context.db);

	await db.delete(Tables.posts).where(eq(Tables.posts.type, "like")).execute();

	await Promise.all(
		bookmarks.map((bookmark) => {
			return Like.create(
				{ db },
				{
					authorId: user.id,
					createdAt: bookmark.createdAt,
					updatedAt: bookmark.createdAt,
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
