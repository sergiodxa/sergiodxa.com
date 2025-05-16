import { and, eq } from "drizzle-orm";
import Fuse from "fuse.js";
import type { Database } from "~/db";
import * as schema from "~/db/schema";
import type { BaseMeta } from "~/models/post.server";
import { Post } from "~/models/post.server";
import { Markdown } from "~/utils/markdown";
import type { UUID } from "~/utils/uuid";
import { assertUUID } from "~/utils/uuid";

interface ArticleMeta extends BaseMeta {
	slug: string;
	title: string;
	locale: string;
	content: string;
	excerpt?: string;
	canonical_url?: string;
}

type InsertArticle = Omit<schema.InsertPost, "id" | "type"> & ArticleMeta;

interface Services {
	db: Database;
}

// @ts-expect-error TS is an idiot
export class Article extends Post<ArticleMeta> {
	override readonly type = "article" as const;

	get title() {
		return this.meta.title;
	}

	get slug() {
		return this.meta.slug;
	}

	get locale() {
		return this.meta.locale;
	}

	get content() {
		return this.meta.content;
	}

	get excerpt() {
		return this.meta.excerpt;
	}

	get canonicalUrl() {
		return this.meta.canonical_url;
	}

	get pathname() {
		return `/articles/${this.slug}`;
	}

	get wordCount() {
		let titleLength = this.title.split(/\s+/).length;
		return Markdown.plain(this.content).split(/\s+/).length + titleLength;
	}

	get renderable() {
		return Markdown.parse(`# ${this.title}\n${this.content}`);
	}

	override toJSON() {
		return {
			...super.toJSON(),
			// Article Attributes
			slug: this.slug,
			locale: this.locale,
			title: this.title,
			content: this.content,
			excerpt: this.excerpt,
			canonicalUrl: this.canonicalUrl,
		};
	}

	static override async list(services: Services) {
		let posts = await Post.list<ArticleMeta>(services, "article");
		return posts.map((post) => new Article(services, post));
	}

	static async search(services: Services, initialQuery: string) {
		let articles = await Article.list(services);

		let query = initialQuery.trim().toLowerCase();

		let fuse = new Fuse(articles, {
			keys: ["title", "content"],
			includeScore: true,
			findAllMatches: false,
			useExtendedSearch: true,
		});

		return fuse.search(query);
	}

	static async findById(services: Services, id: UUID) {
		let post = await Post.show<ArticleMeta>(services, "article", id);
		return new Article(services, post);
	}

	static override async show(
		services: Services,
		slug: schema.SelectPostMeta["value"],
	) {
		let result = await services.db.query.postMeta.findFirst({
			columns: { postId: true },
			where: and(
				eq(schema.postMeta.key, "slug"),
				eq(schema.postMeta.value, slug),
			),
		});

		assertUUID(result?.postId);

		let post = await Post.show<ArticleMeta>(services, "article", result.postId);
		return new Article(services, post);
	}

	static override async create(services: Services, input: InsertArticle) {
		let post = await Post.create<ArticleMeta>(services, {
			...input,
			type: "article",
		});

		return new Article(services, post);
	}

	static override update(services: Services, id: UUID, input: InsertArticle) {
		return Post.update<ArticleMeta>(services, id, {
			...input,
			type: "article",
		});
	}
}
