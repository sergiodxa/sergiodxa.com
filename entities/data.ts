import * as semver from "semver";
import { z } from "zod";

export const DateTime = z
	.string()
	.datetime()
	.transform((value) => new Date(value))
	.pipe(z.date());

export const TechnologySchema = z.object({
	name: z.string(),
	version: z.string().refine((value) => semver.valid(value), "version"),
});

export const QuestionSchema = z.object({
	id: z.string().uuid(),
	type: z.literal("question"),
	content: z.string(),
	answer: z.string(),
	createdAt: DateTime,
	updatedAt: DateTime,
});

export const TutorialSchema = z.object({
	id: z.string().uuid(),
	type: z.literal("tutorial"),
	slug: z.string(),
	title: z.string(),
	content: z.string(),
	technologies: TechnologySchema.array(),
	questions: QuestionSchema.array(),
	createdAt: DateTime,
	updatedAt: DateTime,
});

export const CommentSchema = z.object({
	id: z.string().uuid(),
	type: z.literal("comment"),
	content: z.string(),
	createdAt: DateTime,
	updatedAt: DateTime,
});

export const ArticleSchema = z.object({
	id: z.string().uuid(),
	type: z.literal("article"),
	slug: z.string(),
	title: z.string().max(140),
	content: z.string(),
	comments: CommentSchema.array(),
	createdAt: DateTime,
	updatedAt: DateTime,
});

export const BookmarkSchema = z.object({
	id: z.string().uuid(),
	type: z.literal("bookmark"),
	title: z.string(),
	description: z.string(),
	url: z.string().url(),
	note: z.string(),
	createdAt: DateTime,
	updatedAt: DateTime,
});

export const DataSchema = z.discriminatedUnion("type", [
	TutorialSchema,
	ArticleSchema,
	BookmarkSchema,
]);
