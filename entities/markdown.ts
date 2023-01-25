import matter from "front-matter";
import { z } from "zod";

export const MarkdownSchema = z.string().transform((content) => {
	let { attributes, body } = matter(content);

	return {
		attributes: z
			.record(z.union([z.string(), z.date(), z.string().array()]))
			.parse(attributes),
		body,
	};
});

export type Markdown = z.infer<typeof MarkdownSchema>;
