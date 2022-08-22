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

export interface IAirtableService {
	getBookmarks(
		limit: number
	): Promise<{ id: string; title: string; url: string; createdAt: string }[]>;
}

export class AirtableService implements IAirtableService {
	constructor(
		private kv: KVNamespace,
		private apiKey: string,
		private base: string,
		private tableId: string
	) {}

	async getBookmarks(limit = 100) {
		let result = await this.cache(async () => {
			let url = new URL(`${this.base}/${this.tableId}`, BASE_URL);
			url.searchParams.set("maxRecords", limit.toString());
			url.searchParams.set("sort[0][field]", "created_at");
			url.searchParams.set("sort[0][direction]", "desc");

			let response = await fetch(url.toString(), {
				headers: { Authorization: `Bearer ${this.apiKey}` },
			});

			if (!response.ok) return [];

			return await response.json();
		});

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

	private async cache(callback: () => Promise<unknown>) {
		let cached = await this.kv.get("bookmarks", "json");
		if (cached !== null) return cached;
		let result = await callback();
		await this.kv.put("bookmarks", JSON.stringify(result), {
			expirationTtl: 60 * 5,
		});
		return result;
	}
}
