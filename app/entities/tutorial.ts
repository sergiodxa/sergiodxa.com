import { z } from "zod";

import { RenderableTreeNodeSchema } from "~/entities/markdown";

export const TutorialSchema = z.object({
	content: RenderableTreeNodeSchema,
	slug: z.string(),
	tags: z.string().array(),
	title: z.string(),
});
