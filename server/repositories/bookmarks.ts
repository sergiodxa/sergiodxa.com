import { z } from "zod";

import { BookmarkSchema } from "~/server/entities/bookmark";
import { Repository } from "~/server/repositories/repository";

export interface IBookmarksRepo extends Repository<typeof BookmarkSchema> {
	fetchBookmarks(): Promise<z.infer<z.ZodArray<typeof BookmarkSchema>>>;
}

let BookmarkRecordSchema = z.object({
	id: z.string(),
	createdTime: z.string(),
	fields: z.object({
		title: z.string(),
		url: z.string().url(),
		created_at: z.string(),
	}),
});

export class BookmarksRepo
	extends Repository<typeof BookmarkSchema>
	implements IBookmarksRepo
{
	protected schema = BookmarkSchema;

	private BASE_URL = new URL("https://api.airtable.com/v0/");

	constructor(
		private apiKey: string,
		private base: string,
		private tableId: string,
	) {
		super();
	}

	async fetchBookmarks(limit = 100) {
		let url = new URL(`${this.base}/${this.tableId}`, this.BASE_URL);
		url.searchParams.set("maxRecords", limit.toString());
		url.searchParams.set("sort[0][field]", "created_at");
		url.searchParams.set("sort[0][direction]", "desc");

		let response = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.apiKey}` },
		});

		if (!response.ok) return [];

		let data = await response.json();
		let { records } = z
			.object({ records: BookmarkRecordSchema.array() })
			.parse(data);

		return BookmarkSchema.array().parse(
			records.map((record) => {
				return {
					id: record.id,
					title: record.fields.title,
					url: record.fields.url,
					created_at: record.createdTime,
				};
			}),
		);
	}
}
