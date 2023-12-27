import type { AppLoadContext } from "@remix-run/cloudflare";
import type { User } from "~/modules/session.server";

import { eq } from "drizzle-orm";

import { Tutorial } from "~/models/db-tutorial.server";
import { MarkdownSchema } from "~/models/markdown.server";
import { Logger } from "~/modules/logger.server";
import { Tables, database } from "~/services/db.server";
import { GitHub } from "~/services/github.server";

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
				await Tutorial.create(
					{ db },
					{
						slug,
						title,
						content: markdown.attributes.plain,
						authorId: user.id,
						tags: markdown.attributes.tags,
						createdAt,
						updatedAt: createdAt,
						excerpt: extractExcerpt({
							body: markdown.attributes.plain,
							description: undefined,
							headline: "title: \n",
						}),
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

function pathToSlug(path: string) {
	return path.split("/").slice(2).join("/").slice(0, -3);
}
