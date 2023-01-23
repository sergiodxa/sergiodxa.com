import { z } from "zod";

import { BookmarkSchema } from "~/entities/bookmark";
import { NoteSchema } from "~/entities/note";

import { Service } from "./service";

const FeedSchema = z.object({
	notes: NoteSchema.pick({ id: true, title: true, path: true }).array().max(10),
	bookmarks: BookmarkSchema.pick({ id: true, title: true, url: true })
		.array()
		.max(10)
		.promise(),
});

export class FeedService extends Service {
	constructor(
		repos: SDX.Repos,
		private kv: { airtable: KVNamespace; cn: KVNamespace }
	) {
		super(repos);
	}

	async perform(): Promise<z.infer<typeof FeedSchema>> {
		let bookmarks = this.cachedBookmarks();
		let notes = await this.cachedNotes();

		return FeedSchema.parse({ notes: notes.slice(0, 10), bookmarks });
	}

	async cachedNotes() {
		let cached = await this.kv.cn.get("feed:notes", "json");
		if (cached)
			return NoteSchema.pick({ id: true, title: true, path: true })
				.array()
				.parse(cached);

		let notes = await NoteSchema.pick({ id: true, title: true, path: true })
			.array()
			.promise()
			.parse(this.repos.notes.fetchNotes());

		await this.kv.cn.put("feed:notes", JSON.stringify(notes), {
			expirationTtl: 3600,
		});

		return notes;
	}

	async cachedBookmarks() {
		let cached = await this.kv.airtable.get("feed:bookmarks", "json");
		if (cached) return BookmarkSchema.array().parse(cached);

		let bookmarks = await BookmarkSchema.array()
			.promise()
			.parse(this.repos.bookmarks.fetchBookmarks(10));

		await this.kv.airtable.put("feed:bookmarks", JSON.stringify(bookmarks), {
			expirationTtl: 3600,
		});

		return bookmarks;
	}
}
