import type { Scalar, Tag } from "@markdoc/markdoc";

import { parse, transform } from "@markdoc/markdoc";
import { z } from "zod";

export const TagSchema: z.ZodType<Tag> = z.object({
	$$mdtype: z.literal("Tag"),
	name: z.string(),
	attributes: z.record(z.any()),
	children: z.lazy(() => RenderableTreeNodeSchema.array()),
});

export const ScalarSchema: z.ZodType<Scalar> = z.union([
	z.null(),
	z.boolean(),
	z.number(),
	z.string(),
	z.lazy(() => ScalarSchema.array()),
	z.record(z.lazy(() => ScalarSchema)),
]);

export const RenderableTreeNodeSchema = z.union([TagSchema, ScalarSchema]);

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
				body: transform(parse(body.join("\n").trimStart())),
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
			body: transform(parse(body.join("\n").trimStart())),
		};
	})
	.pipe(
		z.object({
			attributes: z.object({
				title: z.string().min(1).max(140),
				tags: z.string().array(),
			}),
			body: RenderableTreeNodeSchema,
		})
	);

export type Markdown = z.infer<typeof MarkdownSchema>;
