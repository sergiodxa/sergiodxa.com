import { z } from "zod";

const NoteVisibilitySchema = z.union([
	z.literal("public"),
	z.literal("private"),
	z.literal("public_unlisted"),
	z.literal("public_site"),
]);

export const NoteSchema = z.object({
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

export class CollectedNotes {
	private BASE_URL = new URL("https://collectednotes.com/");

	constructor(
		private email: string,
		private token: string,
		private site: string,
	) {}

	async fetchNotes(page = 1, signal = new AbortSignal()) {
		let url = new URL(`sites/${this.site}/notes`, this.BASE_URL);

		url.searchParams.set("page", page.toString());
		url.searchParams.set("visibility", "public_site");

		let response = await this.fetch(url, signal);

		let data = await response.json();

		return NoteSchema.array().parse(data);
	}

	async searchNotes(term: string, page = 1, signal = new AbortSignal()) {
		let url = new URL(`sites/${this.site}/notes/search`, this.BASE_URL);

		url.searchParams.set("page", page.toString());
		url.searchParams.set("term", term);
		url.searchParams.set("visibility", "public_site");

		let response = await this.fetch(url, signal);

		if (!response.ok) return [];

		let data = await response.json();

		return NoteSchema.array().parse(data);
	}

	async fetchNoteByPath(path: string, signal = new AbortSignal()) {
		let url = new URL(`${this.site}/${path}.json`, this.BASE_URL);

		let response = await this.fetch(url, signal);

		if (!response.ok) throw new Error(`Note not found: ${path}`);

		let data = await response.json();

		return NoteSchema.parse(data);
	}

	private async fetch(url: URL, signal?: AbortSignal) {
		return fetch(url.toString(), {
			signal,
			headers: {
				Accept: "application/json",
				Authorization: `${this.email} ${this.token}`,
				"Content-Type": "application/json",
			},
		});
	}
}
