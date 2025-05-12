import type { AppLoadContext } from "@remix-run/cloudflare";
import type { UUID } from "~/utils/uuid";

import { z } from "zod";

import { Tutorial } from "~/models/tutorial.server";
import { database } from "~/services/db.server";

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
