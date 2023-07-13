import type { Scalar, Tag } from "@markdoc/markdoc";

import * as semver from "semver";
import { z } from "zod";

import { TutorialSchema } from "~/server/entities/tutorial";

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

interface Recommendation {
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

export class TutorialsService extends Service {
	async list({
		page = 1,
		size = PAGE_SIZE,
	}: { page?: number; size?: number } = {}) {
		void this.#fillTutorialsFromRepo();
		let list = await this.repos.tutorials.list();
		return this.#paginate(list, page, size);
	}

	async search({
		query,
		page = 1,
		size = PAGE_SIZE,
	}: {
		query: string;
		page?: number;
		size?: number;
	}) {
		let tutorials = await this.repos.tutorials.list();

		query = query.toLowerCase();

		if (query.trim().length === 0) {
			return this.#paginate(tutorials, page, size);
		}

		let techsInQuery = this.#findTechnologiesInString(query);

		for (let techInQuery of techsInQuery) {
			if (techInQuery.version) {
				query = query.replace(
					`tech:${techInQuery.name}@${techInQuery.version}`,
					"",
				);
			} else {
				query = query.replace(`tech:${techInQuery.name}`, "");
			}

			tutorials = tutorials.filter((tutorial) => {
				for (let tagInTutorial of tutorial.tags) {
					let techInTutorial = this.#getPackageNameAndVersion(tagInTutorial);
					if (techInQuery.name.includes("*")) {
						if (
							!techInTutorial.name.includes(techInQuery.name.replace("*", ""))
						) {
							continue;
						}
					} else if (techInTutorial.name !== techInQuery.name) {
						continue;
					}
					if (!techInQuery.version) return true;
					if (semver.gte(techInTutorial.version, techInQuery.version)) {
						return true;
					}
				}

				return false;
			});
		}

		for (let word of query.trim()) {
			tutorials = tutorials.filter((tutorial) => {
				let title = tutorial.title.toLowerCase();

				if (title.includes(word)) return true;

				return false;
			});
		}

		return this.#paginate(tutorials, page, size);
	}

	async read(slug: string) {
		let tutorial = await this.repos.tutorials.read(slug);
		if (tutorial) return tutorial;

		let { file } = await this.repos.github.getMarkdownFile(
			`tutorials/${slug}.md`,
		);

		let result = TutorialSchema.parse({
			...file.attributes,
			slug,
			content: file.body,
		});

		await this.repos.tutorials.save(slug, result);

		return result;
	}

	async recommendations(slug: string) {
		let [list, tutorial] = await Promise.all([
			this.repos.tutorials.list(),
			this.repos.tutorials.read(slug),
		]);

		if (!tutorial) return [];

		list = list.filter((item) => !item.slug.includes(slug));

		let result: Recommendation[] = [];

		for (let item of list) {
			for (let tag of this.#shuffle(tutorial.tags)) {
				let { name, version } = this.#getPackageNameAndVersion(tag);

				let match = this.#shuffle(item.tags).find((itemTag) => {
					let { name: itemName, version: itemVersion } =
						this.#getPackageNameAndVersion(itemTag);
					if (itemName !== name) return false;
					return semver.gte(version, itemVersion);
				});

				if (match) {
					result.push({ title: item.title, tag: match, slug: item.slug });
				}
			}
		}

		return this.#shuffle(this.#dedupeBySlug(result)).slice(0, 3);
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

	#shuffle<Value>(list: Value[]) {
		let result = [...list];

		for (let i = result.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}

		return result;
	}

	#getPackageNameAndVersion(tag: string) {
		if (!tag.startsWith("@")) {
			let [name, version] = tag.split("@");
			return { name, version };
		}

		let [, name, version] = tag.split("@");
		return { name: `@${name}`, version };
	}

	#dedupeBySlug(items: Recommendation[]): Recommendation[] {
		let result: Recommendation[] = [];

		for (let item of items) {
			if (!result.find((resultItem) => resultItem.slug === item.slug)) {
				result.push(item);

				if (result.length >= 3) break;

				continue;
			}
		}

		return result;
	}

	/**
	 * can find the technologies name and version from a string
	 * @example
	 * this.#findTechnologiesInString(`hello world tech:@remix-run/react@1.10.0 tech:react@18 tech:@types/react-dom@18.5`)
	 */
	#findTechnologiesInString(value: string) {
		if (!value.includes("tech:")) return [];

		return value
			.split(" ")
			.filter((value) => value.includes("tech:"))
			.map((value) => {
				value = value.slice("tech:".length);
				return this.#getPackageNameAndVersion(value);
			});
	}

	async #fillTutorialsFromRepo() {
		let data = await this.repos.github.getListOfMarkdownFiles("tutorials");
		await Promise.all(data.map((path) => this.read(path)));
	}
}
