import { z } from "zod";

const BookmarkSchema = z.object({
	id: z.string(),
	title: z.string(),
	// description: z.string(),
	// comment: z.string().nullable(),
	url: z.string().url(),

	// Timestamps
	created_at: z.string(),
});

let BookmarkRecordSchema = z.object({
	id: z.string(),
	createdTime: z.string(),
	fields: z.object({
		title: z.string(),
		url: z.string().url(),
		created_at: z.string(),
	}),
});

export class Airtable {
	protected schema = BookmarkSchema;

	private BASE_URL = new URL("https://api.airtable.com/v0/");

	constructor(
		protected apiKey: string,
		protected base: string,
		protected tableId: string,
	) {}

	async bookmarks(limit = 100) {
		let url = new URL(`${this.base}/${this.tableId}`, this.BASE_URL);
		url.searchParams.set("maxRecords", limit.toString());
		url.searchParams.set("sort[0][field]", "created_at");
		url.searchParams.set("sort[0][direction]", "desc");

		let response = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.apiKey}` },
		});

		if (!response.ok) return [];

		let data = await response.json();

		return z
			.object({ records: BookmarkRecordSchema.array() })
			.transform(({ records }) => records)
			.parse(data);
	}
}
