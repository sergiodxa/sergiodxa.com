import { z } from "zod";

import { BookmarkSchema } from "~/entities/bookmark";
import { NoteSchema } from "~/entities/note";

import { Service } from "./service";

const FeedSchema = z.object({
	notes: NoteSchema.pick({
		id: true,
		title: true,
		path: true,
		created_at: true,
	}).array(),
	bookmarks: BookmarkSchema.pick({
		id: true,
		title: true,
		url: true,
		created_at: true,
	}).array(),
});

export class FeedService extends Service {
	constructor(
		repos: SDX.Repos,
		private kv: { airtable: KVNamespace; cn: KVNamespace }
	) {
		super(repos);
	}

	async perform(): Promise<z.infer<typeof FeedSchema>> {
		let [notes, bookmarks] = await Promise.all([
			this.cachedNotes(),
			this.cachedBookmarks(),
		]);

		return FeedSchema.parse({ notes: notes, bookmarks });
	}

	async cachedNotes() {
		let cached = await this.kv.cn.get("feed:notes", "json");
		if (cached) {
			return NoteSchema.pick({
				id: true,
				title: true,
				path: true,
				created_at: true,
			})
				.array()
				.parse(cached);
		}

		let hasMore = true;
		let page = 1;
		let totalNotes: z.infer<typeof NoteSchema>[] = [];
		while (hasMore) {
			let notes = await this.repos.notes.fetchNotes(page);

			if (notes.length < 40) hasMore = false;
			totalNotes.push(...notes);
			page += 1;
		}

		let notes = await NoteSchema.pick({
			id: true,
			title: true,
			path: true,
			created_at: true,
		})
			.array()
			.parse(totalNotes);

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
			.parse(this.repos.bookmarks.fetchBookmarks(100));

		await this.kv.airtable.put("feed:bookmarks", JSON.stringify(bookmarks), {
			expirationTtl: 3600,
		});

		return bookmarks;
	}
}
