import { createAPIClient } from "@sergiodxa/api-client";
import { z } from "zod";

export const ID = z.number();

export const Email = z.string().email();

export const ISODate = z.string().datetime();

export const NoteVisibility = z.enum([
	"private",
	"public",
	"public_unlisted",
	"public_site",
]);

export const NoteSchema = z.object({
	id: ID,
	siteId: ID,
	userId: ID,
	body: z.string(),
	path: z.string(),
	headline: z.string(),
	title: z.string(),
	createdAt: ISODate,
	updatedAt: ISODate,
	visibility: NoteVisibility,
	url: z.string().url(),
	poster: z.string().nullable(),
	curated: z.boolean(),
	ordering: z.number(),
});

export const SiteSchema = z.object({
	id: ID,
	userId: ID,
	name: z.string(),
	headline: z.string(),
	about: z.string(),
	host: z.string().nullable(),
	createdAt: ISODate,
	updatedAt: ISODate,
	site_path: z.string(),
	published: z.boolean(),
	tinyletter: z.string(),
	domain: z.string(),
	webhookUrl: z.string().url(),
	paymentPlatform: z.string().nullable(),
	is_premium: z.boolean(),
	total_notes: z.number(),
});

export const UserSchema = z.object({
	id: ID,
	email: Email,
	name: z.string(),
	role: z.string(),
	banned: z.boolean(),
	avatarKey: z.string().url(),
	createdAt: ISODate,
	updatedAt: ISODate,
});

export const LinkSchema = z.object({
	id: z.number(),
	noteId: z.number(),
	url: z.string(),
	kind: z.union([z.literal("internal"), z.literal("external")]),
	host: z.string(),
	title: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const CollectedNotes = createAPIClient({
	baseURL: new URL("https://collectednotes.com"),
	measure(_, fn) {
		return fn();
	},
	credentials({ headers, token }) {
		if (token) headers.set("Authorization", token);
	},
	fetch: {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		redirect: "error",
	},
	endpoints: {
		"GET /sites/:sitePath/notes": {
			search: z.object({
				page: z
					.number()
					.transform((value) => value.toString())
					.optional()
					.default(1),
				visibility: NoteVisibility.optional().default("public"),
			}),
			expects: { success: NoteSchema.array() },
		},

		"GET /sites": {
			expects: { success: SiteSchema.array() },
		},

		"POST /sites/:sitePath/notes": {
			body: z.object({
				note: NoteSchema.pick({ body: true, visibility: true }),
			}),
			expects: { success: NoteSchema },
		},

		"PUT /:sitePath/:notePath": {
			body: z.object({
				note: NoteSchema.pick({ body: true, visibility: true }),
			}),
			expects: { success: NoteSchema },
		},

		"DELETE /sites/:sitePath/notes/:notePath": {
			expects: { success: z.object({}) },
		},

		"GET /accounts/me": {
			expects: { success: UserSchema },
		},

		"POST /sites/:sitePath/notes/reorder": {
			body: z.object({ ids: ID.array() }),
			expects: { success: ID.array() },
		},

		"GET /sites/:sitePath/notes/search": {
			search: z.object({
				term: z.string().transform(encodeURIComponent),
				visibility: NoteVisibility.optional().default("public"),
				page: z
					.number()
					.transform((value) => value.toString())
					.optional()
					.default(1),
			}),
			expects: { success: NoteSchema.array() },
		},

		"GET /:sitePath/:notePath/body": {
			expects: { success: z.object({ note: NoteSchema, body: z.string() }) },
		},

		"GET /sites/:sitePath/notes/:notePath/links": {
			expects: { success: LinkSchema.array() },
		},

		"GET /:sitePath": {
			search: z.object({
				visibility: NoteVisibility.optional().default("public"),
			}),
			expects: {
				success: z.object({ site: SiteSchema, notes: NoteSchema.array() }),
			},
		},

		"GET /:sitePath/:notePath": {
			expects: { success: NoteSchema },
		},
	},
});
