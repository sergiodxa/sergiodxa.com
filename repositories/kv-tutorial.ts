import { z } from "zod";

import { TutorialSchema } from "~/entities/tutorial";

import { KVRepository } from "./repository";

export class KVTutorialRepository extends KVRepository {
	prefix = "tutorial:";

	async list() {
		let keys: KVNamespaceListKey<unknown>[] = [];

		let hasMore = true;
		while (hasMore) {
			let result = await this.kv.list({ prefix: this.prefix });
			keys.push(...result.keys);
			if (result.list_complete) hasMore = false;
		}

		return z
			.object({
				name: z
					.string()
					.transform((value) => value.split(":").at(1))
					.pipe(z.string()),
				expiration: z.number().optional(),
				metadata: z.object({ tags: z.string().array(), title: z.string() }),
			})
			.array()
			.parse(keys);
	}

	async read(slug: string) {
		let result = await this.kv.get(`${this.prefix}${slug}`, "json");
		if (!result) return null;

		return TutorialSchema.parse(result);
	}

	async save(slug: string, data: z.infer<typeof TutorialSchema>) {
		await this.kv.put(`${this.prefix}${slug}`, JSON.stringify(data), {
			expirationTtl: 60 * 60 * 24 * 7,
			metadata: { tags: data.tags, title: data.title },
		});
	}
}
