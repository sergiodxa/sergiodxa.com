import type { Cache } from "~/services/cache.server";
import type { CollectedNotes } from "~/services/cn.server";

import { z } from "zod";

import {
	AttributesSchema,
	BodySchema,
	Markdown,
	MarkdownSchema,
} from "~/models/markdown.server";
import { hasAny } from "~/utils/arrays";

interface Services {
	cache: Cache;
	cn: CollectedNotes;
}

const ArchiveSchema = z.object({
	title: z.string(),
	path: z.string(),
	content: z.object({ attributes: AttributesSchema, body: BodySchema }),
	createdAt: z.string().datetime(),
});

export class Article {
	private constructor(
		readonly path: string,
		readonly createdAt: string,
		private readonly content: Markdown,
	) {}

	get title() {
		return this.content.attributes.title;
	}

	get body() {
		return this.content.body;
	}

	toJSON() {
		return {
			path: this.path,
			title: this.title,
			content: { attributes: this.content.attributes, body: this.body },
			createdAt: this.createdAt,
		};
	}

	static async list({ cache, cn }: Services, page = 1) {
		let key = `latest:${page}`;

		let cached = await cache.get(key);

		if (cached) {
			console.info("Cache Hit /articles");

			let result = ArchiveSchema.transform(({ path, createdAt, content }) => {
				return new Article(
					path,
					createdAt,
					new Markdown(content.body, content.attributes),
				);
			})
				.array()
				.safeParse(JSON.parse(cached));

			if (result.success) return result.data;
			else {
				console.info("Invalid Cache: /articles");
				await cache.delete(key);
			}
		} else console.info("Cache Miss /articles");

		try {
			let list = await cn.fetchNotes(page, AbortSignal.timeout(5000));

			let results = list.map((article) => {
				return new Article(
					article.path,
					new Date(article.created_at).toISOString(),
					new Markdown(article.body),
				);
			});

			if (hasAny(results)) {
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
			}

			return results;
		} catch (error) {
			throw new Error("Failed to fetch articles");
		}
	}

	static async search({ cache, cn }: Services, term: string, page = 1) {
		let key = `search:${term}:${page}`;
		let cached = await cache.get(key);

		if (cached) {
			console.info("Cache Hit /articles?q=%s", term);
			let result = ArchiveSchema.transform(({ path, createdAt, content }) => {
				return new Article(
					path,
					createdAt,
					new Markdown(content.body, content.attributes),
				);
			})
				.array()
				.safeParse(JSON.parse(cached));

			if (result.success) return result.data;
			else {
				console.log(result.error.message);
				console.info("Invalid Cache: /articles?q=%s");
				await cache.delete(key);
			}
		} else console.info("Cache Miss /articles?q=%s", term);

		let found = await cn.searchNotes(term, page, AbortSignal.timeout(5000));

		let results = found.map((article) => {
			return new Article(
				article.path,
				new Date(article.created_at).toISOString(),
				new Markdown(article.body),
			);
		});

		if (hasAny(results)) {
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
		}

		return results;
	}

	static async show({ cache, cn }: Services, path: string) {
		let key = `article:${path}`;

		let cached = await cache.get(key);

		if (cached) {
			let result = MarkdownSchema.and(
				z.object({ createdAt: z.string().datetime() }),
			).safeParse(JSON.parse(cached));

			if (result.success) {
				return new Article(
					path,
					result.data.createdAt,
					new Markdown(result.data.body, result.data.attributes),
				);
			} else await cache.delete(key);
		}

		let { title, body, created_at } = await cn.fetchNoteByPath(path);

		let markdown = new Markdown(`# ${title}\n${body}`);

		let article = new Article(
			path,
			new Date(created_at).toISOString(),
			markdown,
		);

		await cache.set(key, JSON.stringify(markdown), { expirationTtl: 3600 });

		return article;
	}
}
