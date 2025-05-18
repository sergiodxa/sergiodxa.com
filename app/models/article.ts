import { and, eq } from "drizzle-orm";
import * as schema from "~/db/schema";
import { ArticleSchema } from "~/entities/article";
import type { Article } from "~/entities/article";
import { getDB } from "~/middleware/drizzle";
import { measure } from "~/middleware/server-timing";

export async function findArticleBySlug(slug: Article["slug"]) {
	let db = getDB();

	let result = await measure("article", "Article.show", () => {
		return db.query.postMeta.findFirst({
			where: and(
				eq(schema.postMeta.key, "slug"),
				eq(schema.postMeta.value, slug),
			),
			with: { post: { with: { meta: true, author: true } } },
		});
	});

	if (!result) throw new Error(`Couldn't find article with slug ${slug}`);

	return ArticleSchema.parse({
		id: result.postId,
		authorId: result.post.authorId,
		type: result.post.type,
		createdAt: result.post.createdAt,
		updatedAt: result.post.updatedAt,
		author: {
			id: result.post.author.id,
			role: result.post.author.role,
			email: result.post.author.email,
			username: result.post.author.username,
			displayName: result.post.author.displayName,
			avatar: result.post.author.avatar,
			createdAt: result.post.author.createdAt,
			updatedAt: result.post.author.updatedAt,
		},
		// Meta
		title: result.post.meta.find((m) => m.key === "title")?.value,
		slug: result.post.meta.find((m) => m.key === "slug")?.value,
		locale: result.post.meta.find((m) => m.key === "locale")?.value,
		excerpt: result.post.meta.find((m) => m.key === "excerpt")?.value,
		content: result.post.meta.find((m) => m.key === "content")?.value,
		tags: result.post.meta.filter((m) => m.key === "tags").map((m) => m.value),
		canonicalUrl: result.post.meta.find((m) => m.key === "canonical_url")
			?.value,
	});
}
