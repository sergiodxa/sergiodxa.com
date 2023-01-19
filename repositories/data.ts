import { z } from "zod";

import {
	ArticleSchema,
	BookmarkSchema,
	TutorialSchema,
	DataSchema,
} from "~/entities/data";

import { Repository } from "./repository";

export interface IDataRepo extends Repository<typeof Schema> {
	feed(): Promise<z.infer<z.ZodArray<typeof DataSchema>>>;

	tutorials(): Promise<z.infer<z.ZodArray<typeof TutorialSchema>>>;
	articles(): Promise<z.infer<z.ZodArray<typeof ArticleSchema>>>;
	bookmarks(): Promise<z.infer<z.ZodArray<typeof BookmarkSchema>>>;

	findTutorialBySlug(
		slug: string
	): Promise<z.infer<typeof TutorialSchema> | null>;

	findArticleBySlug(
		slug: string
	): Promise<z.infer<typeof ArticleSchema> | null>;

	createTutorial(
		input: Pick<
			z.input<typeof TutorialSchema>,
			"title" | "content" | "technologies" | "questions" | "slug"
		>
	): Promise<z.infer<typeof TutorialSchema>>;
}

const Schema = z.object({
	ids: z.string().uuid().array(),
	data: z.record(z.string().uuid(), DataSchema),
});

export class DataRepo extends Repository<typeof Schema> implements IDataRepo {
	protected schema = Schema;

	constructor(private kv: KVNamespace) {
		super();
	}

	async feed() {
		let feed = await this.kv.get("feed", "json");

		if (!feed) return [];
		let { ids, data } = this.schema.parse(feed);

		return ids.map((id) => data[id]);
	}

	async tutorials() {
		let feed = await this.feed();
		return feed.filter(this.#isTutorial);
	}

	async articles() {
		let feed = await this.feed();
		return feed.filter(this.#isArticle);
	}

	async bookmarks() {
		let feed = await this.feed();
		return feed.filter(this.#isBookmark);
	}

	async findTutorialBySlug(slug: string) {
		let feed = await this.tutorials();

		let tutorial = feed.find((tutorial) => tutorial.slug === slug);

		if (!tutorial) return null;
		return tutorial;
	}

	async findArticleBySlug(slug: string) {
		let feed = await this.articles();

		let article = feed.find((article) => article.slug === slug);

		if (!article) return null;
		return article;
	}

	async createTutorial(
		input: Pick<
			z.input<typeof TutorialSchema>,
			"title" | "content" | "technologies" | "questions" | "slug"
		>
	) {
		let createdAt = new Date();

		let parsed = TutorialSchema.parse({
			...input,
			type: "tutorial",
			id: crypto.randomUUID(),
			createdAt: createdAt.toISOString(),
			updatedAt: createdAt.toISOString(),
		});

		let feed = await this.schema
			.nullable()
			.optional()
			.default({ ids: [], data: {} })
			.promise()
			.parse(this.kv.get("feed", "json"));

		if (!feed) {
			feed = { ids: [], data: {} };
		}

		feed.data[parsed.id] = parsed;
		feed.ids.unshift(parsed.id);

		await this.kv.put("feed", JSON.stringify(feed));

		return parsed;
	}

	#isTutorial(value: unknown): value is z.infer<typeof TutorialSchema> {
		return TutorialSchema.pick({ type: true }).safeParse(value).success;
	}

	#isArticle(value: unknown): value is z.infer<typeof ArticleSchema> {
		return ArticleSchema.pick({ type: true }).safeParse(value).success;
	}

	#isBookmark(value: unknown): value is z.infer<typeof BookmarkSchema> {
		return BookmarkSchema.pick({ type: true }).safeParse(value).success;
	}
}
