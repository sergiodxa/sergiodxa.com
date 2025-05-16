import { z } from "zod";
import { getDB } from "~/middleware/drizzle";
import { Tutorial } from "~/models/tutorial.server";
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
				attributes: {
					// biome-ignore lint/style/noNonNullAssertion: I check this exists
					title: title!.slice(1).trim(),
					tags: [],
				},
				body: plain,
			};
		}

		let [tags] = z.string().array().min(1).parse(content.split("\n"));
		let [title, ...body] = z
			.string()
			.array()
			.min(1)
			.parse(content.trim().split("\n"));
		let plain = body.join("\n").trimStart();

		return {
			attributes: {
				// biome-ignore lint/style/noNonNullAssertion: I check this exists
				title: title!.slice(1).trim(),
				// biome-ignore lint/style/noNonNullAssertion: I check this exists
				tags: tags!
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

export async function deleteTutorial(id: UUID) {
	let db = getDB();
	await Tutorial.destroy({ db }, id);
}
