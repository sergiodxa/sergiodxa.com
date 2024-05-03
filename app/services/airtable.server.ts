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

type BookmarkRecord = z.infer<typeof BookmarkRecordSchema>;

export class Airtable {
	protected schema = BookmarkSchema;

	private BASE_URL = new URL("https://api.airtable.com/v0/");

	protected apiKey: string;
	protected base: string;
	protected tableId: string;

	constructor(apiKey: string, base: string, tableId: string) {
		this.apiKey = apiKey;
		this.base = base;
		this.tableId = tableId;
	}

	async bookmarks(offset?: string) {
		let url = new URL(`${this.base}/${this.tableId}`, this.BASE_URL);
		url.searchParams.set("sort[0][field]", "created_at");
		url.searchParams.set("sort[0][direction]", "desc");

		if (offset) url.searchParams.set("offset", offset);

		let response = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.apiKey}` },
		});

		if (!response.ok) return { records: [] as BookmarkRecord[], offset: null };

		let body = await z
			.object({
				records: BookmarkRecordSchema.array(),
				offset: z.string().optional(),
			})
			.promise()
			.parse(response.json());

		return body;
	}
}
