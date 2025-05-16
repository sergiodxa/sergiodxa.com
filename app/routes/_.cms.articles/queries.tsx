import { and, eq } from "drizzle-orm";
import { href } from "react-router";
import { z } from "zod";
import { postMeta, posts } from "~/db/schema";
import { getBindings } from "~/middleware/bindings";
import { getCache } from "~/middleware/cache";
import { getDB } from "~/middleware/drizzle";
import { Article } from "~/models/article.server";
import type { UUID } from "~/utils/uuid";

export const MarkdownSchema = z
	.string()
	.transform((content) => {
		if (content.startsWith("# ")) {
			let [title, ...body] = z
				.string()
				.array()
				.min(1)
				.parse(content.split("\n"));

			let plain = body.join("\n").trimStart();

			return {
				// biome-ignore lint/style/noNonNullAssertion: I check this exists
				attributes: { title: title!.slice(1).trim() },
				body: plain,
			};
		}

		let [title, ...body] = z
			.string()
			.array()
			.min(1)
			.parse(content.trim().split("\n"));
		let plain = body.join("\n").trimStart();

		return {
			// biome-ignore lint/style/noNonNullAssertion: I check this exists
			attributes: { title: title!.slice(1).trim() },
			body: plain,
		};
	})
	.pipe(
		z.object({
			attributes: z.object({ title: z.string().min(1) }),
			body: z.string(),
		}),
	);

export async function deleteArticle(id: UUID) {
	let db = getDB();
	await Article.destroy({ db }, id);
}

export async function moveToTutorial(id: UUID) {
	let bindings = getBindings();
	let db = getDB();

	let article = await db.query.posts.findFirst({
		where: eq(posts.id, id),
		with: { meta: { where: eq(postMeta.key, "slug") } },
	});

	if (!article) throw new Error("Article not found");

	let slugMeta = article.meta.find((meta) => meta.key === "slug");
	if (!slugMeta) throw new Error("Slug meta not found");

	await db.update(posts).set({ type: "tutorial" }).where(eq(posts.id, id));

	let result = await db.query.posts.findMany({
		where: and(eq(posts.id, id), eq(posts.type, "article")),
	});

	if (result.length > 0) throw new Error("Article not moved");

	let cache = getCache();

	await Promise.all([
		cache.delete("tutorials:list"),
		cache.delete("articles:list"),
		cache.delete("feed:tutorials"),
		cache.delete("feed:articles"),
	]);

	let from = href("/:postType/*", {
		postType: "articles",
		"*": slugMeta.value,
	});

	let to = href("/:postType/*", {
		postType: "tutorials",
		"*": slugMeta.value,
	});

	await bindings.kv.redirects.put(
		slugMeta.value,
		JSON.stringify({ from, to }),
		{ metadata: { from, to } },
	);
}
