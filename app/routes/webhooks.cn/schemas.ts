import { z } from "zod";

const NoteVisibilitySchema = z.union([
	z.literal("public"),
	z.literal("private"),
	z.literal("public_unlisted"),
	z.literal("public_site"),
]);

const NoteSchema = z.object({
	id: z.number(),
	site_id: z.number(),
	user_id: z.number(),
	body: z.string(),
	path: z.string(),
	headline: z.string(),
	title: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	visibility: NoteVisibilitySchema.default("public"),
	poster: z.string().nullable(),
	curated: z.boolean(),
	ordering: z.number(),
	url: z.string(),
});

const NotesReorderedEventSchema = z.object({
	event: z.literal("notes-reordered"),
	data: z.object({ notes: NoteSchema.array() }),
});

const NoteUpdatedEventSchema = z.object({
	event: z.literal("note-updated"),
	data: z.object({ note: NoteSchema }),
});

const NoteCreatedEventSchema = z.object({
	event: z.literal("note-created"),
	data: z.object({ note: NoteSchema }),
});

const NoteDeletedEventSchema = z.object({
	event: z.literal("note-deleted"),
	data: z.object({ note: NoteSchema }),
});

export const Schema = z.union([
	NotesReorderedEventSchema,
	NoteUpdatedEventSchema,
	NoteCreatedEventSchema,
	NoteDeletedEventSchema,
]);
