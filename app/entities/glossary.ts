import { z } from "zod";
import { PostSchema } from "./post";

export const GlossarySchema = PostSchema.extend({
	type: z.literal("glossary"),
	slug: z.string(),
	term: z.string(),
	title: z.string().optional(),
	definition: z.string(),
});

export type Glossary = z.output<typeof GlossarySchema>;
