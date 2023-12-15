import type { Airtable } from "~/services/airtable.server";
import type { Cache } from "~/services/cache.server";

import { z } from "zod";

interface Services {
	cache: Cache;
	airtable: Airtable;
}

const Schema = z.object({
	id: z.string(),
	title: z.string(),
	url: z.string().url(),
	createdAt: z.string(),
});

export class Bookmark {
	constructor(
		readonly id: string,
		readonly title: string,
		readonly url: string,
		readonly createdAt: string,
	) {}

	toJSON() {
		return {
			id: this.id,
			title: this.title,
			url: this.url,
			createdAt: this.createdAt,
		};
	}

	static async list({ cache, airtable }: Services) {
		console.log("Bookmark.list");
		let cached = await cache.get("bookmarks");

		if (cached) {
			console.info("Cache Hit: /bookmarks");
			let result = Schema.transform(
				(record) =>
					new Bookmark(record.id, record.title, record.url, record.createdAt),
			)
				.array()
				.safeParse(JSON.parse(cached));

			if (result.success) return result.data;
			else {
				console.info("Invalid cache: /bookmarks");
				await cache.delete("bookmarks");
			}
		} else console.info("Cache Miss: /bookmarks");

		let records = await airtable.bookmarks(100);

		let bookmarks = records.map(
			(record) =>
				new Bookmark(
					record.id,
					record.fields.title,
					record.fields.url,
					record.createdTime,
				),
		);

		await cache.set("bookmarks", JSON.stringify(bookmarks));

		return bookmarks;
	}
}
