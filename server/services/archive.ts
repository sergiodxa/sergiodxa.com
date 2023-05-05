import { z } from "zod";

import { Service } from "./service";

const ArchiveSchema = z.object({
	id: z.number(),
	title: z.string(),
	path: z.string(),
});

export class ArchiveService extends Service {
	constructor(repos: SDX.Repos, private kv: KVNamespace) {
		super(repos);
	}

	async perform(
		page = 1,
		term: string | null = null
	): Promise<z.infer<z.ZodArray<typeof ArchiveSchema>>> {
		if (term) return await this.cachedSearch(term, page);
		return await this.cachedLatest(page);
	}

	private async cachedSearch(term: string, page = 1) {
		let key = `search:${term}:${page}`;
		let cached = await this.kv.get(key, "json");
		if (cached) return ArchiveSchema.array().parse(cached);

		let results = await ArchiveSchema.array()
			.promise()
			.parse(this.repos.notes.searchNotes(term, page));

		await this.kv.put(key, JSON.stringify(results), { expirationTtl: 3600 });

		return results;
	}

	private async cachedLatest(page = 1) {
		let key = `latest:${page}`;
		let cached = await this.kv.get(key, "json");
		if (cached) return ArchiveSchema.array().parse(cached);

		let results = await ArchiveSchema.array()
			.promise()
			.parse(this.repos.notes.fetchNotes(page));

		await this.kv.put(key, JSON.stringify(results), { expirationTtl: 3600 });

		return results;
	}
}
