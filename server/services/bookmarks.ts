import { z } from "zod";

export const BookmarkSchema = z.object({
	id: z.number(),
	title: z.string().min(1),
	url: z.string().url(),
	createdAt: z.string(),
});

export type Bookmark = z.infer<typeof BookmarkSchema>;

export interface IBookmarksService {
	getBookmarks(limit?: number): Promise<Bookmark[]>;
}

export class BookmarksService implements IBookmarksService {
	#db: D1Database;

	constructor(db: D1Database) {
		this.#db = db;
	}

	async getBookmarks(limit = Number.MAX_SAFE_INTEGER): Promise<Bookmark[]> {
		let { results, duration } = await this.#db
			.prepare("SELECT * FROM Bookmark ORDER BY createdAt DESC")
			.all<Bookmark[]>();

		console.log(`getBookmarks took ${duration}ms`);

		return BookmarkSchema.array().parse(results).slice(0, limit);
	}
}
