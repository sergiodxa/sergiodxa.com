import type { Scalar, Tag } from "@markdoc/markdoc";
import type { TutorialSchema } from "~/entities/tutorial";

import { parse, transform, type Config } from "@markdoc/markdoc";
import { z } from "zod";

import { Service } from "./service";

const PAGE_SIZE = 1000;

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

export class TutorialsService extends Service {
	async list({
		page = 1,
		size = PAGE_SIZE,
	}: { page?: number; size?: number } = {}) {
		return this.#paginate([], page, size);
	}

	async search({ query, page = 1 }: { query: string; page?: number }) {
		throw new Error("Not implemented");
	}

	async read(slug: string) {
		let { file } = await this.repos.github.getMarkdownFile(
			`tutorials/${slug}.md`
		);
		return z
			.object({
				content: RenderableTreeNodeSchema,
				slug: z.string(),
				tags: z.array(z.string()),
				title: z.string(),
			})
			.parse({
				...file.attributes,
				slug,
				content: this.#parseMarkdown(file.body),
			});
	}

	async recommendations(slug: string) {
		throw new Error("Not implemented");
	}

	async save(id: string, data: Partial<z.infer<typeof TutorialSchema>>) {
		throw new Error("Not implemented");
	}

	async create(data: z.infer<typeof TutorialSchema>) {
		throw new Error("Not implemented");
	}

	#paginate<Item>(items: Item[], page: number, size: number): Paginated<Item> {
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

	#parseMarkdown(markdown: string) {
		return transform(parse(markdown));
	}
}
