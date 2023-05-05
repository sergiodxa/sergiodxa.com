import { z } from "zod";

import { Service } from "./service";

const BookmarkSchema = z.object({ title: z.string(), url: z.string() });

export class BookmarksService extends Service {
	constructor(repos: SDX.Repos, private kv: KVNamespace) {
		super(repos);
	}

	async perform(): Promise<z.infer<z.ZodArray<typeof BookmarkSchema>>> {
		let cached = await this.kv.get("bookmarks", "json");
		if (cached) return BookmarkSchema.array().parse(cached);

		let bookmarks = await BookmarkSchema.array()
			.promise()
			.parse(this.repos.bookmarks.fetchBookmarks());

		await this.kv.put("bookmarks", JSON.stringify(bookmarks), {
			expirationTtl: 3600,
		});

		return bookmarks;
	}
}
