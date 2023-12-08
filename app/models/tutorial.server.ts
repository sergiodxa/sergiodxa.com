import type { Scalar, Tag } from "@markdoc/markdoc";
import type { Markdown } from "~/entities/markdown";
import type { GitHub } from "~/services/github";

import { z } from "zod";

import { TutorialSchema } from "~/entities/tutorial";
import { isEmpty } from "~/utils/arrays";

const PAGE_SIZE = 1000;
const PREFIX = "tutorial:";

interface Paginated<Type> {
	items: Type[];
	total: number;
	page: {
		size: number;
		current: number;
		first: number;
		next: number | null;
		prev: number | null;
		last: number;
	};
}

export interface Recommendation {
	title: string;
	tag: string;
	slug: string;
}

let TagSchema: z.ZodType<Tag> = z.object({
	$$mdtype: z.literal("Tag"),
	name: z.string(),
	attributes: z.record(z.any()),
	children: z.lazy(() => RenderableTreeNodeSchema.array()),
});

let ScalarSchema: z.ZodType<Scalar> = z.union([
	z.null(),
	z.boolean(),
	z.number(),
	z.string(),
	z.lazy(() => ScalarSchema.array()),
	z.record(z.lazy(() => ScalarSchema)),
]);

let RenderableTreeNodeSchema = z.union([TagSchema, ScalarSchema]);

export class Tutorial {
	private constructor(
		readonly path: string,
		private file: Markdown,
	) {}

	get slug() {
		return this.path.slice("content/tutorials/".length).slice(0, -3);
	}

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
			path: this.path,
			slug: this.slug,
			title: this.title,
			tags: this.tags,
			body: this.body,
		};
	}

	cache(kv: KVNamespace) {
		return kv.put(`${PREFIX}:${this.slug}`, JSON.stringify(this));
	}

	static async list(
		{ gh, kv }: { gh: GitHub; kv: KVNamespace },
		query?: string,
	): Promise<Tutorial[]> {
		let tutorials: Tutorial[] = [];

		if (isEmpty(tutorials)) {
			let filePaths = await gh.listMarkdownFiles("tutorials");

			for await (let filePath of filePaths) {
				let { path, file } = await gh.fetchMarkdownFile(filePath);
				tutorials.push(new Tutorial(path, file));
			}
		}

		if (query) {
			tutorials.filter((tutorial) => {
				for (let word of query.toLowerCase().split(" ")) {
					if (tutorial.file.attributes.title.toLowerCase().includes(word)) {
						return true;
					}
				}
				return false;
			});
		}

		for (let tutorial of tutorials) tutorial.cache(kv);

		return tutorials;
	}

	static async show(
		{ gh, kv }: { gh: GitHub; kv: KVNamespace },
		slug: string,
	): Promise<Tutorial> {
		let { path, file } = await gh.fetchMarkdownFile(`tutorials/${slug}.md`);
		return new Tutorial(path, file);
	}
}

export namespace _Tutorial {
	export class List {
		constructor(
			private kv: KVNamespace,
			private gh: GitHub,
		) {}

		async perform({
			page = 1,
			size = PAGE_SIZE,
		}: { page?: number; size?: number } = {}) {
			void this.#fillTutorialsFromRepo();
			let list = await this.#list();
			return this.#paginate(list, page, size);
		}

		async #list() {
			let keys: KVNamespaceListKey<{ tags: string[]; title: string }>[] = [];

			let hasMore = true;
			while (hasMore) {
				let result = await this.kv.list<{ tags: string[]; title: string }>({
					prefix: PREFIX,
				});

				keys.push(...result.keys);
				if (result.list_complete) hasMore = false;
			}

			return z
				.object({
					slug: z
						.string()
						.transform((value) => value.split(":").at(1))
						.pipe(z.string()),
					tags: z.string().array(),
					title: z.string(),
				})
				.array()
				.parse(
					keys.map((key) => {
						return {
							slug: key.name,
							tags: key.metadata?.tags,
							title: key.metadata?.title,
						};
					}),
				);
		}

		#paginate<Item>(
			items: Item[],
			page: number,
			size: number,
		): Paginated<Item> {
			let total = items.length;
			let last = Math.ceil(total / size);
			let first = 1;
			let next = page < last ? page + 1 : null;
			let prev = page > first ? page - 1 : null;

			return {
				items: items.slice((page - 1) * size, page * size),
				total,
				page: { size, current: page, first, next, prev, last },
			};
		}

		async #fillTutorialsFromRepo() {
			let files = await this.gh.listMarkdownFiles("tutorials");
			let read = new Read(this.kv, this.gh);
			await Promise.all(
				files.map(async (file) => {
					let tutorial = await read.perform(file);
					if (!tutorial) return;
					await this.kv.put(
						`${PREFIX}${tutorial.slug}`,
						JSON.stringify(tutorial),
						{
							expirationTtl: 60 * 60 * 24 * 7,
							metadata: { tags: tutorial.tags, title: tutorial.title },
						},
					);
				}),
			);
		}
	}

	export class Read {
		constructor(
			private kv: KVNamespace,
			private gh: GitHub,
		) {}

		async perform(file: string) {
			let result = await this.gh.fetchMarkdownFile(file);
			let kvResult = await this.kv.get(`${PREFIX}${result.path}`, "json");
			if (!kvResult) return null;

			return TutorialSchema.parse(result);
		}
	}

	export class Save {
		constructor(private kv: KVNamespace) {}

		async save(slug: string, data: z.infer<typeof TutorialSchema>) {
			await this.kv.put(`${PREFIX}${slug}`, JSON.stringify(data), {
				expirationTtl: 60 * 60 * 24 * 7,
				metadata: { tags: data.tags, title: data.title },
			});
		}
	}
}
