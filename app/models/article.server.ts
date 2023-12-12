import type { Cache } from "~/services/cache.server";
import type { CollectedNotes } from "~/services/cn.server";

import { z } from "zod";

import { Markdown, MarkdownSchema } from "./markdown.server";

interface Services {
	cache: Cache;
	cn: CollectedNotes;
}

const ArchiveSchema = z.object({
	id: z.number(),
	title: z.string(),
	path: z.string(),
	body: z.string(),
});

export class Article {
	private constructor(
		readonly path: string,
		private readonly content: Markdown,
	) {}

	get title() {
		return this.content.attributes.title;
	}

	get body() {
		return this.content.body;
	}

	toJSON() {
		return { path: this.path, title: this.title, content: this.content };
	}

	static async list({ cache, cn }: Services, page = 1) {
		let key = `latest:${page}`;

		let cached = await cache.get(key);

		if (cached) {
			let result = ArchiveSchema.transform(({ path, body }) => {
				return new Article(path, new Markdown(body));
			})
				.array()
				.safeParse(JSON.parse(cached));
			if (result.success) return result.data;
			else await cache.delete(key);
		}

		let results = await ArchiveSchema.transform(({ path, body }) => {
			return new Article(path, new Markdown(body));
		})
			.array()
			.promise()
			.parse(cn.fetchNotes(page));

		await cache.set(key, JSON.stringify(results), { expirationTtl: 3600 });

		await Promise.all(
			results.map((result) => {
				return cache.set(
					`article:${result.path}`,
					JSON.stringify(result.content),
					{ expirationTtl: 3600 },
				);
			}),
		);

		return results;
	}

	static async search({ cache, cn }: Services, term: string, page = 1) {
		let key = `search:${term}:${page}`;
		let cached = await cache.get(key);

		if (cached) {
			let result = ArchiveSchema.transform(({ path, body }) => {
				return new Article(path, new Markdown(body));
			})
				.array()
				.safeParse(JSON.parse(cached));
			if (result.success) return result.data;
			else await cache.delete(key);
		}

		let results = await ArchiveSchema.transform(({ path, body }) => {
			return new Article(path, new Markdown(body));
		})
			.array()
			.promise()
			.parse(cn.searchNotes(term, page));

		await cache.set(key, JSON.stringify(results), { expirationTtl: 3600 });

		await Promise.all(
			results.map((result) => {
				return cache.set(
					`article:${result.path}`,
					JSON.stringify(result.content),
					{ expirationTtl: 3600 },
				);
			}),
		);

		return results;
	}

	static async show({ cache, cn }: Services, path: string) {
		let key = `article:${path}`;

		let cached = await cache.get(key);

		if (cached) {
			let result = MarkdownSchema.safeParse(JSON.parse(cached));
			if (result.success) {
				return new Article(
					path,
					new Markdown(result.data.body, result.data.attributes),
				);
			} else await cache.delete(key);
		}

		let { title, body } = await cn.fetchNoteByPath(path);

		let markdown = new Markdown(`# ${title}\n${body}`);
		let tutorial = new Article(path, markdown);

		await cache.set(key, JSON.stringify(markdown), { expirationTtl: 3600 });

		return tutorial;
	}
}
