import { z } from "zod";

export const MarkdownSchema = z
	.string()
	.transform((content) => {
		if (content.startsWith("# ")) {
			let [title, ...body] = content.split("\n");

			return {
				attributes: {
					title: title.slice(1).trim(),
					tags: [],
				},
				body: body.join("\n").trimStart(),
			};
		}

		let [tags, ...rest] = content.split("\n");
		let [title, ...body] = rest.join("\n").trim().split("\n");

		return {
			attributes: {
				title: title.slice(1).trim(),
				tags: tags
					.split("#")
					.map((tag) => tag.trim())
					.filter(Boolean),
			},
			body: body.join("\n").trimStart(),
		};
	})
	.pipe(
		z.object({
			attributes: z.object({
				title: z.string().min(1).max(140),
				tags: z.string().array(),
			}),
			body: z.string().min(1),
		})
	);

export type Markdown = z.infer<typeof MarkdownSchema>;
