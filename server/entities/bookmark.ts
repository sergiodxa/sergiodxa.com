import { z } from "zod";

export const BookmarkSchema = z.object({
	id: z.string(),
	title: z.string(),
	// description: z.string(),
	// comment: z.string().nullable(),
	url: z.string().url(),

	// Timestamps
	created_at: z.string(),
});
