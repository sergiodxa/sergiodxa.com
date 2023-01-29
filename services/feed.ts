import { z } from "zod";

import { BookmarkSchema } from "~/entities/bookmark";
import { NoteSchema } from "~/entities/note";

import { Service } from "./service";

const TutorialSchema = z.object({
	slug: z
		.string()
		.transform((value) => value.split(":").at(1))
		.pipe(z.string()),
	tags: z.string().array(),
	title: z.string(),
});

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
	tutorials: TutorialSchema.array(),
});

export class FeedService extends Service {
	constructor(
		repos: SDX.Repos,
		private kv: { airtable: KVNamespace; cn: KVNamespace }
	) {
		super(repos);
	}

	async perform(): Promise<z.infer<typeof FeedSchema>> {
		let [notes, bookmarks, tutorials] = await Promise.all([
			this.cachedNotes(),
			this.cachedBookmarks(),
			this.cachedTutorials(),
		]);

		return FeedSchema.parse({ notes, bookmarks, tutorials });
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

		let notes = await NoteSchema.pick({
			id: true,
			title: true,
			path: true,
			created_at: true,
		})
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
			.parse(this.repos.bookmarks.fetchBookmarks(100));

		await this.kv.airtable.put("feed:bookmarks", JSON.stringify(bookmarks), {
			expirationTtl: 3600,
		});

		return bookmarks;
	}

	async cachedTutorials() {
		let cached = await this.kv.airtable.get("feed:tutorials", "json");
		await this.kv.airtable.delete("feed:tutorials");
		if (cached) return TutorialSchema.array().parse(cached);

		let tutorials = await TutorialSchema.array()
			.promise()
			.parse(this.repos.tutorials.list());

		this.kv.airtable.put("feed:tutorials", JSON.stringify(tutorials), {
			expirationTtl: 3600,
		});

		return tutorials;
	}
}
