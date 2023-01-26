import { z } from "zod";

const PREFIX = "tutorial:";

export class KVTutorialRepository {
	#kv: KVNamespace;

	constructor(kv: KVNamespace) {
		this.#kv = kv;
	}

	async list() {
		let keys: KVNamespaceListKey<unknown>[] = [];

		let hasMore = true;
		while (hasMore) {
			let result = await this.#kv.list({ prefix: PREFIX });
			keys.push(...result.keys);
			if (result.list_complete) hasMore = false;
		}

		return z
			.object({
				name: z.string(),
				expiration: z.number().optional(),
				metadata: z.unknown(),
			})
			.array()
			.parse(keys);
	}

	async read(id: string) {
		let result = await this.#kv.getWithMetadata(id, "json");

		return z.object({}).parse(result);
	}
}
