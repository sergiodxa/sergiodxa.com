import type { AppLoadContext } from "@remix-run/cloudflare";
import type { UUID } from "~/utils/uuid";

import { z } from "zod";

import { and, eq } from "drizzle-orm";
import { Article } from "~/models/article.server";
import { Cache } from "~/modules/cache.server";
import { Redirects } from "~/modules/redirects.server";
import { Tables, database } from "~/services/db.server";

export const MarkdownSchema = z
	.string()
	.transform((content) => {
		if (content.startsWith("# ")) {
			let [title, ...body] = content.split("\n");

			let plain = body.join("\n").trimStart();

			return {
				attributes: { title: title.slice(1).trim() },
				body: plain,
			};
		}

		let [title, ...body] = content.trim().split("\n");
		let plain = body.join("\n").trimStart();

		return {
			attributes: { title: title.slice(1).trim() },
			body: plain,
		};
	})
	.pipe(
		z.object({
			attributes: z.object({ title: z.string().min(1) }),
			body: z.string(),
		}),
	);

export async function deleteArticle(context: AppLoadContext, id: UUID) {
	let db = database(context.db);
	await Article.destroy({ db }, id);
}

export async function moveToTutorial(context: AppLoadContext, id: UUID) {
	let redirects = new Redirects(context);
	let db = database(context.db);

	let article = await db.query.posts.findFirst({
		where: eq(Tables.posts.id, id),
		with: { meta: { where: eq(Tables.postMeta.key, "slug") } },
	});

	if (!article) throw new Error("Article not found");

	let slugMeta = article.meta.find((meta) => meta.key === "slug");
	if (!slugMeta) throw new Error("Slug meta not found");

	await db
		.update(Tables.posts)
		.set({ type: "tutorial" })
		.where(eq(Tables.posts.id, id));

	let result = await db.query.posts.findMany({
		where: and(eq(Tables.posts.id, id), eq(Tables.posts.type, "article")),
	});

	if (result.length > 0) throw new Error("Article not moved");

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);
	await Promise.all([
		cache.delete("tutorials:list"),
		cache.delete("articles:list"),
		cache.delete("feed:tutorials"),
		cache.delete("feed:articles"),
	]);

	await redirects.add(
		slugMeta.value,
		`/articles/${slugMeta.value}`,
		`/tutorials/${slugMeta.value}`,
	);
}
