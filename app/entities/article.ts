import { z } from "zod";
import { PostSchema } from "./post";

export const ArticleSchema = PostSchema.extend({
	type: z.literal("article"),
	title: z.string(),
	slug: z.string(),
	locale: z.string(),
	excerpt: z.string(),
	content: z.string(),
	tags: z.union([z.string(), z.array(z.string())]).optional(),
	canonicalUrl: z.string().optional(),
});

export type Article = z.output<typeof ArticleSchema>;
