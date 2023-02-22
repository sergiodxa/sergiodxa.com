import { z } from "zod";

type EntryType = "tutorials" | "articles" | "bookmarks" | "authors";

const BASE_URL = new URL("https://cdn.contentful.com");

export const TutorialFieldsSchema = z.object({
	title: z.string(),
	slug: z.string(),
	content: z.string(),
	author: z.array(
		z.object({
			sys: z.object({
				type: z.literal("Link"),
				linkType: z.literal("Entry"),
				id: z.string(),
			}),
		})
	),
	uses: z.string().array(),
});

export const ArticleFieldsSchema = z.object({
	title: z.string(),
	slug: z.string(),
	content: z.string(),
	author: z.array(
		z.object({
			sys: z.object({
				type: z.literal("Link"),
				linkType: z.literal("Entry"),
				id: z.string(),
			}),
		})
	),
});

export const BookmarkFieldsSchema = z.object({
	title: z.string(),
	url: z.string().url(),
});

export const AuthorFieldsSchema = z.object({
	name: z.string(),
});

export const EntryMetadataSchema = z.object({
	tags: z
		.object({
			sys: z.object({
				type: z.literal("Link"),
				linkType: z.literal("Tag"),
				id: z.string(),
			}),
		})
		.array(),
});

export const EntrySysSchema = z.object({
	id: z.string(),
	type: z.literal("Entry"),
	space: z.object({
		sys: z.object({
			type: z.literal("Link"),
			linkType: z.literal("Space"),
			id: z.string(),
		}),
	}),
	contentType: z.object({
		sys: z.object({
			type: z.literal("Link"),
			linkType: z.literal("ContentType"),
			id: z.union([
				z.literal("tutorials"),
				z.literal("articles"),
				z.literal("bookmarks"),
				z.literal("authors"),
			]),
		}),
	}),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	revision: z.number(),
});

export const TutorialEntrySchema = z.object({
	metadata: EntryMetadataSchema,
	sys: z.object({
		contentType: z.object({
			sys: z.object({
				type: z.literal("Link"),
				linkType: z.literal("ContentType"),
				id: z.literal("tutorials"),
			}),
		}),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	}),
	fields: TutorialFieldsSchema,
});

export const ArticleEntrySchema = z.object({
	metadata: EntryMetadataSchema,
	sys: z.object({
		contentType: z.object({
			sys: z.object({
				type: z.literal("Link"),
				linkType: z.literal("ContentType"),
				id: z.literal("articles"),
			}),
		}),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	}),
	fields: ArticleFieldsSchema,
});

export const BookmarkEntrySchema = z.object({
	metadata: EntryMetadataSchema,
	sys: z.object({
		contentType: z.object({
			sys: z.object({
				type: z.literal("Link"),
				linkType: z.literal("ContentType"),
				id: z.literal("bookmarks"),
			}),
		}),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	}),
	fields: BookmarkFieldsSchema,
});

export const AuthorEntrySchema = z.object({
	metadata: EntryMetadataSchema,
	sys: z.object({
		contentType: z.object({
			sys: z.object({
				type: z.literal("Link"),
				linkType: z.literal("ContentType"),
				id: z.literal("authors"),
			}),
		}),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	}),
	fields: AuthorFieldsSchema,
});

export const EntrySchema = z.union([
	TutorialEntrySchema,
	ArticleEntrySchema,
	BookmarkEntrySchema,
	AuthorEntrySchema,
]);

export class Contentful {
	#space: string;
	#environment = "master";
	#accessToken: string;

	constructor(space: string, accessToken: string) {
		this.#space = space;
		this.#accessToken = accessToken;
	}

	async getEntries(type: EntryType, skip = 0, limit = 1000, locale = "en-US") {
		let url = new URL(
			`/spaces/${this.#space}/environments/${this.#environment}/entries`,
			BASE_URL
		);

		url.searchParams.set("content_type", type);
		url.searchParams.set("skip", skip.toString());
		url.searchParams.set("limit", limit.toString());
		url.searchParams.set("locale", locale);

		let response = await fetch(url.toString(), {
			method: "GET",
			headers: { Authorization: `Bearer ${this.#accessToken}` },
		});

		let body = await response.json();

		switch (type) {
			case "tutorials": {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: TutorialEntrySchema.array(),
						// includes: z.object({ Entry: AuthorEntrySchema.array() }),
					})
					.parse(body);
			}
			case "articles": {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: ArticleEntrySchema.array(),
						// includes: z.object({ Entry: AuthorEntrySchema.array() }),
					})
					.parse(body);
			}
			case "bookmarks": {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: BookmarkEntrySchema.array(),
					})
					.parse(body);
			}
			case "authors": {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: AuthorEntrySchema.array(),
					})
					.parse(body);
			}
			default: {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: EntrySchema.array(),
					})
					.parse(body);
			}
		}
	}

	async getEntry(type: EntryType, slug: string, locale = "en-US") {
		let url = new URL(
			`/spaces/${this.#space}/environments/${this.#environment}/entries`,
			BASE_URL
		);

		url.searchParams.set("content_type", type);
		url.searchParams.set("fields.slug", slug);
		url.searchParams.set("limit", "1");
		url.searchParams.set("locale", locale);

		let response = await fetch(url.toString(), {
			method: "GET",
			headers: { Authorization: `Bearer ${this.#accessToken}` },
		});

		let body = await response.json();

		switch (type) {
			case "tutorials": {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: TutorialEntrySchema.array().max(1),
						// includes: z.object({ Entry: AuthorEntrySchema.array() }),
					})
					.parse(body)
					.items.at(0)!;
			}
			case "articles": {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: ArticleEntrySchema.array().max(1),
						// includes: z.object({ Entry: AuthorEntrySchema.array() }),
					})
					.parse(body)
					.items.at(0)!;
			}
			case "bookmarks": {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: BookmarkEntrySchema.array().max(1),
					})
					.parse(body)
					.items.at(0)!;
			}
			case "authors": {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: AuthorEntrySchema.array().max(1),
					})
					.parse(body)
					.items.at(0)!;
			}
			default: {
				return z
					.object({
						sys: z.object({ type: z.literal("Array") }),
						total: z.number(),
						skip: z.number(),
						limit: z.number(),
						items: EntrySchema.array().max(1),
					})
					.parse(body)
					.items.at(0)!;
			}
		}
	}
}
