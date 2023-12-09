import type { Attributes } from "~/entities/markdown";
import type { GitHub } from "~/services/github";

import { z } from "zod";

import { AttributesSchema, Markdown } from "~/services/markdown";
import { isEmpty } from "~/utils/arrays";

export class Tutorial {
	private constructor(
		public readonly slug: string,
		private file: Markdown,
	) {}

	get title() {
		return this.file.attributes.title;
	}

	get tags() {
		return this.file.attributes.tags;
	}

	get body() {
		return this.file.body;
	}

	toJSON() {
		return {
			path: Tutorial.slugToPath(this.slug),
			slug: this.slug,
			title: this.title,
			tags: this.tags,
			body: this.body,
		};
	}

	static async list(
		{ gh, kv }: { gh: GitHub; kv: KVNamespace },
		query?: string,
	) {
		let tutorials: Array<Attributes & { slug: string }> = [];

		let list = await kv.list({ prefix: "tutorial:", limit: 1000 });

		for (let key in list.keys) {
			let item = list.keys[key];

			if (!item.metadata) {
				console.info("Missing Metadata in Key: %s", key);
				await kv.delete(key);
				continue;
			}

			let result = AttributesSchema.extend({
				slug: z.string(),
			}).safeParse(item.metadata);

			if (!result.success) {
				console.info("Invalid Metadata in Key: %s", key);
				await kv.delete(key);
				continue;
			}

			tutorials.push(result.data);
		}

		if (isEmpty(tutorials)) {
			console.info("Cache Miss: /tutorials");

			let filePaths = await gh.listMarkdownFiles("tutorials");
			for await (let filePath of filePaths) {
				let slug = Tutorial.pathToSlug(filePath);
				let tutorial = await Tutorial.show({ gh, kv }, slug);
				tutorials.push({ slug, title: tutorial.title, tags: tutorial.tags });
			}
		} else console.info("Cache Hit: /tutorials");

		if (query) {
			tutorials.filter((tutorial) => {
				for (let word of query.toLowerCase().split(" ")) {
					if (tutorial.title.toLowerCase().includes(word)) return true;
				}
				return false;
			});
		}

		return tutorials;
	}

	static async show(
		{ gh, kv }: { gh: GitHub; kv: KVNamespace },
		slug: string,
	): Promise<Tutorial> {
		let cached = await kv.get<Markdown>(Tutorial.slugToKey(slug), "json");

		if (cached) {
			console.info("Cache Hit: /tutorials/%s", slug);
			try {
				let markdown = new Markdown(cached.body, cached.attributes);
				return new Tutorial(slug, markdown);
			} catch {
				await kv.delete(Tutorial.slugToKey(slug));
			}
		} else console.info("Cache Miss: /tutorials/%s", slug);

		let content = await gh.fetchMarkdownFile(`tutorials/${slug}.md`);

		let markdown = new Markdown(content);
		let tutorial = new Tutorial(slug, markdown);

		await kv.put(Tutorial.slugToKey(slug), JSON.stringify(markdown), {
			metadata: { slug, tags: tutorial.tags, title: tutorial.title },
			expirationTtl: 60 * 60 * 24 * 7,
		});

		return tutorial;
	}

	private static pathToSlug(path: string) {
		return path.split("/").slice(2).join("/").slice(0, -3);
	}

	private static slugToKey(slug: string) {
		return `tutorial:${slug}`;
	}

	private static slugToPath(slug: string) {
		return `tutorials/${slug}.md`;
	}
}

// export namespace _Tutorial {
// 	export class List {
// 		constructor(
// 			private kv: KVNamespace,
// 			private gh: GitHub,
// 		) {}

// 		async perform({
// 			page = 1,
// 			size = PAGE_SIZE,
// 		}: { page?: number; size?: number } = {}) {
// 			void this.#fillTutorialsFromRepo();
// 			let list = await this.#list();
// 			return this.#paginate(list, page, size);
// 		}

// 		async #list() {
// 			let keys: KVNamespaceListKey<{ tags: string[]; title: string }>[] = [];

// 			let hasMore = true;
// 			while (hasMore) {
// 				let result = await this.kv.list<{ tags: string[]; title: string }>({
// 					prefix: PREFIX,
// 				});

// 				keys.push(...result.keys);
// 				if (result.list_complete) hasMore = false;
// 			}

// 			return z
// 				.object({
// 					slug: z
// 						.string()
// 						.transform((value) => value.split(":").at(1))
// 						.pipe(z.string()),
// 					tags: z.string().array(),
// 					title: z.string(),
// 				})
// 				.array()
// 				.parse(
// 					keys.map((key) => {
// 						return {
// 							slug: key.name,
// 							tags: key.metadata?.tags,
// 							title: key.metadata?.title,
// 						};
// 					}),
// 				);
// 		}

// 		#paginate<Item>(
// 			items: Item[],
// 			page: number,
// 			size: number,
// 		): Paginated<Item> {
// 			let total = items.length;
// 			let last = Math.ceil(total / size);
// 			let first = 1;
// 			let next = page < last ? page + 1 : null;
// 			let prev = page > first ? page - 1 : null;

// 			return {
// 				items: items.slice((page - 1) * size, page * size),
// 				total,
// 				page: { size, current: page, first, next, prev, last },
// 			};
// 		}

// 		async #fillTutorialsFromRepo() {
// 			let files = await this.gh.listMarkdownFiles("tutorials");
// 			let read = new Read(this.kv, this.gh);
// 			await Promise.all(
// 				files.map(async (file) => {
// 					let tutorial = await read.perform(file);
// 					if (!tutorial) return;
// 					await this.kv.put(
// 						`${PREFIX}${tutorial.slug}`,
// 						JSON.stringify(tutorial),
// 						{
// 							expirationTtl: 60 * 60 * 24 * 7,
// 							metadata: { tags: tutorial.tags, title: tutorial.title },
// 						},
// 					);
// 				}),
// 			);
// 		}
// 	}

// 	export class Read {
// 		constructor(
// 			private kv: KVNamespace,
// 			private gh: GitHub,
// 		) {}

// 		async perform(file: string) {
// 			let result = await this.gh.fetchMarkdownFile(file);
// 			let kvResult = await this.kv.get(`${PREFIX}${result.path}`, "json");
// 			if (!kvResult) return null;

// 			return TutorialSchema.parse(result);
// 		}
// 	}

// 	export class Save {
// 		constructor(private kv: KVNamespace) {}

// 		async save(slug: string, data: z.infer<typeof TutorialSchema>) {
// 			await this.kv.put(`${PREFIX}${slug}`, JSON.stringify(data), {
// 				expirationTtl: 60 * 60 * 24 * 7,
// 				metadata: { tags: data.tags, title: data.title },
// 			});
// 		}
// 	}
// }
