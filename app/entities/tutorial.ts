import { z } from "zod";
import { PostSchema } from "./post";

export const TutorialSchema = PostSchema.extend({
	type: z.literal("tutorial"),
	title: z.string(),
	slug: z.string(),
	excerpt: z.string(),
	content: z.string(),
	tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export type Tutorial = z.output<typeof TutorialSchema>;
