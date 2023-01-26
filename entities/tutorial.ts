import { z } from "zod";

import { DateTimeSchema } from "./date-time";
import { SemanticVersionSchema } from "./semver";

export const TechnologySchema = z.object({
	name: z.string(),
	version: SemanticVersionSchema,
});

export const QuestionSchema = z.object({
	id: z.string().uuid(),
	content: z.string(),
	answer: z.string(),
	createdAt: DateTimeSchema,
	updatedAt: DateTimeSchema,
});

export const TutorialSchema = z.object({
	id: z.string().uuid(),
	slug: z.string(),
	title: z.string(),
	content: z.string(),
	technologies: TechnologySchema.array(),
	questions: QuestionSchema.array(),
	createdAt: DateTimeSchema,
	updatedAt: DateTimeSchema,
});
