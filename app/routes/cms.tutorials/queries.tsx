import type { AppLoadContext } from "@remix-run/cloudflare";
import type { User } from "~/modules/session.server";
import type { UUID } from "~/utils/uuid";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { Tutorial } from "~/models/db-tutorial.server";
import { Logger } from "~/modules/logger.server";
import { Markdown } from "~/modules/md.server";
import { Tables, database } from "~/services/db.server";
import { GitHub } from "~/services/github.server";

export const MarkdownSchema = z
	.string()
	.transform((content) => {
		if (content.startsWith("# ")) {
			let [title, ...body] = content.split("\n");

			let plain = body.join("\n").trimStart();

			return {
				attributes: {
					title: title.slice(1).trim(),
					tags: [],
				},
				body: plain,
			};
		}

		let [tags, ...rest] = content.split("\n");
		let [title, ...body] = rest.join("\n").trim().split("\n");
		let plain = body.join("\n").trimStart();

		return {
			attributes: {
				title: title.slice(1).trim(),
				tags: tags
					.split("#")
					.map((tag) => tag.trim())
					.filter(Boolean),
			},
			body: plain,
		};
	})
	.pipe(
		z.object({
			attributes: z.object({
				title: z.string().min(1),
				tags: z.string().array(),
			}),
			body: z.string(),
		}),
	);

export async function importTutorials(context: AppLoadContext, user: User) {
	let logger = new Logger(context);

	let gh = new GitHub(context.env.GH_APP_ID, context.env.GH_APP_PEM);

	let filePaths = await gh.listMarkdownFiles("tutorials");
	let db = database(context.db);

	await Promise.all(
		filePaths.map(async (filePath) => {
			let slug = pathToSlug(filePath);
			let tutorial = await gh.fetchMarkdownFile(`tutorials/${slug}.md`);

			try {
				let markdown = MarkdownSchema.parse(tutorial.content);
				let title = markdown.attributes.title;
				let createdAt = new Date(tutorial.createdAt ?? Date.now());

				let plainBody = await Markdown.plain(markdown.body);

				await Tutorial.create(
					{ db },
					{
						slug,
						title,
						content: markdown.body,
						authorId: user.id,
						tags: markdown.attributes.tags,
						createdAt,
						updatedAt: createdAt,
						excerpt: extractExcerpt(plainBody.toString()),
					},
				);
			} catch (exception) {
				if (exception instanceof Error) {
					void logger.info(`error importing ${filePath}: ${exception.message}`);
				}
			}
		}),
	);
}

export async function resetTutorials(context: AppLoadContext) {
	let db = database(context.db);
	await db.delete(Tables.posts).where(eq(Tables.posts.type, "tutorial"));
}

export async function deleteTutorial(context: AppLoadContext, id: UUID) {
	let db = database(context.db);
	await Tutorial.destroy({ db }, id);
}

function extractExcerpt(body: string) {
	return `${body.slice(0, 139)}…`.replaceAll("\n", " ");
}

function pathToSlug(path: string) {
	return path.split("/").slice(2).join("/").slice(0, -3);
}
