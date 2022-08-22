import { z } from "zod";

const BASE_URL = new URL("https://api.airtable.com/v0/");

const record = z.object({
	id: z.string(),
	createdTime: z.string(),
});

let bookmarkRecord = record.and(
	z.object({
		fields: z.object({
			title: z.string(),
			url: z.string().url(),
			created_at: z.string(),
		}),
	})
);

export class AirtableService {
	constructor(
		private apiKey: string,
		private base: string,
		private tableId: string
	) {}

	async getBookmarks(limit = 100) {
		let url = new URL(`${this.base}/${this.tableId}`, BASE_URL);
		url.searchParams.set("maxRecords", limit.toString());
		url.searchParams.set("sort[0][field]", "created_at");
		url.searchParams.set("sort[0][direction]", "desc");

		let response = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.apiKey}` },
		});

		if (!response.ok) return [];

		let result = await response.json();

		let schema = z.object({ records: bookmarkRecord.array() });

		return schema.parse(result).records.map((record) => {
			return {
				id: record.id,
				title: record.fields.title,
				url: record.fields.url,
				createdAt: record.fields.created_at,
			};
		});
	}
}
