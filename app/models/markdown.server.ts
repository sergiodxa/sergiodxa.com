import type { Scalar, Tag } from "@markdoc/markdoc";

import { parse, transform } from "@markdoc/markdoc";
import fm from "front-matter";
import { z } from "zod";

const TagSchema: z.ZodType<Tag> = z.object({
	$$mdtype: z.literal("Tag"),
	name: z.string(),
	attributes: z.record(z.any()),
	children: z.lazy(() => BodySchema.array()),
});

const ScalarSchema: z.ZodType<Scalar> = z.union([
	z.null(),
	z.boolean(),
	z.number(),
	z.string(),
	z.lazy(() => ScalarSchema.array()),
	z.record(z.lazy(() => ScalarSchema)),
]);

export const BodySchema = z.union([TagSchema, ScalarSchema]);

export const AttributesSchema = z.object({
	title: z.string().min(1).max(140),
	tags: z.string().array(),
});

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
	.pipe(z.object({ attributes: AttributesSchema, body: BodySchema }));

export type Body = z.infer<typeof MarkdownSchema>["body"];
export type Attributes = z.infer<typeof MarkdownSchema>["attributes"];

export class Markdown {
	readonly body: Body;
	readonly attributes: Attributes;

	constructor(content: string);
	constructor(body: Body, attributes: Attributes);
	constructor(...args: [string] | [Body, Attributes]) {
		if (args.length === 1) {
			let content = args.at(0);
			if (!content) throw new Error("The Markdown content is empty.");
			let { body, attributes } = MarkdownSchema.parse(fm(content).body.trim());
			this.body = body;
			this.attributes = attributes;
		} else {
			this.body = BodySchema.parse(args[0]);
			this.attributes = AttributesSchema.parse(args[1]);
		}
	}

	toJSON() {
		return { body: this.body, attributes: this.attributes };
	}
}
