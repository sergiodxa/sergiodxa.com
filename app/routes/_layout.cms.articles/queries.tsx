import type { AppLoadContext } from "@remix-run/cloudflare";
import type { User } from "~/modules/session.server";

import { eq } from "drizzle-orm";
import fm from "front-matter";
import { z } from "zod";

import { Article } from "~/models/article.server";
import { Logger } from "~/modules/logger.server";
import { Markdown } from "~/modules/md.server";
import { CollectedNotes } from "~/services/cn.server";
import { Tables, database } from "~/services/db.server";

const AttributesSchema = z
	.object({
		title: z.string(),
		date: z.date(),
		description: z.string(),
		lang: z.string(),
		tags: z.string(),
		path: z.string(),
		canonical_url: z.string().url(),
		next: z.object({
			title: z.string(),
			path: z.string(),
			description: z.string(),
		}),
		translate_from: z.object({
			url: z.string().url(),
			lang: z.string(),
			title: z.string(),
		}),
		translated_to: z.object({ lang: z.string(), path: z.string() }).array(),
	})
	.partial();

const FrontMatterSchema = z.object({
	attributes: AttributesSchema,
	body: z.string(),
});

export async function importArticles(
	context: AppLoadContext,
	user: User,
	page: number,
) {
	let logger = new Logger(context);

	let cn = new CollectedNotes(
		context.env.CN_EMAIL,
		context.env.CN_TOKEN,
		context.env.CN_SITE,
	);

	let articles = await cn.fetchNotes(page);

	let db = database(context.db);

	for await (let article of articles) {
		try {
			let { body, attributes } = FrontMatterSchema.parse(fm(article.body));

			body = stripTitle(body);

			let plainBody = await Markdown.plain(body);

			await Article.create(
				{ db },
				{
					title: attributes.title ?? article.title,
					slug: attributes.path ?? article.path,
					locale: attributes.lang ?? "en",
					content: body,
					excerpt: extractExcerpt({
						body: plainBody.toString().replace("\n", " "),
						headline: article.headline,
						description: attributes.description,
					}),
					authorId: user.id,
					createdAt: attributes.date ?? new Date(article.created_at),
					updatedAt: new Date(article.updated_at),
					canonical_url: attributes.canonical_url,
				},
			);
		} catch (exception) {
			if (exception instanceof Error) {
				void logger.info(
					`error importing ${article.title}: ${exception.message}`,
				);
			}
		}
	}
}

export async function resetArticles(context: AppLoadContext) {
	let db = database(context.db);
	await db.delete(Tables.posts).where(eq(Tables.posts.type, "article"));
}

function stripTitle(body: string) {
	if (!body.startsWith("# ")) return body;
	let [, ...rest] = body.split("\n");
	return rest.join("\n").trim();
}

function extractExcerpt(input: {
	body: string;
	headline: string;
	description?: string;
}) {
	if (input.description) return input.description;
	if (!input.headline.includes("title: \n")) {
		return `${input.headline.slice(0, -3)}…`;
	}
	return `${input.body.slice(0, 139)}…`.replaceAll("\n", " ");
}