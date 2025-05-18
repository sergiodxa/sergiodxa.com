import { z } from "zod";
import { PostSchema } from "./post";

export const LikeSchema = PostSchema.extend({
	type: z.literal("like"),
	title: z.string(),
	url: z.string().url(),
});

export type Like = z.output<typeof LikeSchema>;
