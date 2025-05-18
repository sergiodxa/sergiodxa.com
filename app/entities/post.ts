import { z } from "zod";
import { UserSchema } from "./user";

export const PostSchema = z.object({
	id: z.string().uuid(),
	type: z.enum(["like", "tutorial", "article", "comment", "glossary"]),
	author: UserSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type Post = z.output<typeof PostSchema>;
