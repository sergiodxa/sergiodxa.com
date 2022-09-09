import { z } from "zod";

export interface ICollectedNotesService {
	getLatestNotes(
		page?: number
	): Promise<Array<Pick<z.infer<typeof noteSchema>, "id" | "title" | "path">>>;

	searchNotes(
		term: string,
		page?: number
	): Promise<Array<Pick<z.infer<typeof noteSchema>, "id" | "title" | "path">>>;

	getNotes(
		page?: number,
		term?: string
	): Promise<Array<Pick<z.infer<typeof noteSchema>, "id" | "title" | "path">>>;

	readNote(path: string): Promise<z.infer<typeof noteSchema>>;

	emit(webhook: z.infer<typeof webhookSchema>): Promise<void>;

	parseWebhookBody(data: unknown): z.infer<typeof webhookSchema>;
}

const BASE_URL = new URL("https://collectednotes.com/");

const noteVisibility = z.union([
	z.literal("public"),
	z.literal("private"),
	z.literal("public_unlisted"),
	z.literal("public_site"),
]);

const noteSchema = z.object({
	id: z.number(),
	site_id: z.number(),
	user_id: z.number(),
	body: z.string(),
	path: z.string(),
	headline: z.string(),
	title: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	visibility: noteVisibility.default("public"),
	poster: z.string().nullable(),
	curated: z.boolean(),
	ordering: z.number(),
	url: z.string(),
});

const notesReordered = z.object({
	event: z.literal("notes-reordered"),
	data: z.object({ notes: noteSchema.array() }),
});

const noteUpdated = z.object({
	event: z.literal("note-updated"),
	data: z.object({ note: noteSchema }),
});

const noteCreated = z.object({
	event: z.literal("note-created"),
	data: z.object({ note: noteSchema }),
});

const noteDeleted = z.object({
	event: z.literal("note-deleted"),
	data: z.object({ note: noteSchema }),
});

const webhookSchema = z.union([
	notesReordered,
	noteUpdated,
	noteCreated,
	noteDeleted,
]);

export class CollectedNotesService implements ICollectedNotesService {
	constructor(
		private kv: KVNamespace,
		private email: string,
		private token: string,
		private site: string
	) {}

	async getLatestNotes(page = 1) {
		let cached = await this.kv.get(`latest:${page}`, "json");
		if (cached !== null) {
			return noteSchema
				.pick({ id: true, title: true, path: true })
				.array()
				.parse(cached);
		}

		let url = new URL(`sites/${this.site}/notes`, BASE_URL);

		url.searchParams.set("page", page.toString());
		url.searchParams.set("visibility", "public_site");

		let response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				Authorization: `${this.email} ${this.token}`,
				"Content-Type": "application/json",
			},
		});

		let data = await response.json();

		let result = noteSchema
			.pick({ id: true, title: true, path: true })
			.array()
			.parse(data);

		await this.kv.put(`latest:${page}`, JSON.stringify(result), {
			expirationTtl: 60 * 60 * 24,
		});

		return result;
	}

	async searchNotes(term: string, page = 1) {
		let cached = await this.kv.get(`search:${term}:${page}`, "json");
		if (cached !== null) {
			return noteSchema
				.pick({ id: true, title: true, path: true })
				.array()
				.parse(cached);
		}

		let url = new URL(`sites/${this.site}/notes/search`, BASE_URL);

		url.searchParams.set("page", page.toString());
		url.searchParams.set("term", term);
		url.searchParams.set("visibility", "public_site");

		let response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				Authorization: `${this.email} ${this.token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) return [];

		let data = await response.json();

		let result = noteSchema
			.pick({ id: true, title: true, path: true })
			.array()
			.parse(data);

		await this.kv.put(`search:${term}:${page}`, JSON.stringify(result), {
			expirationTtl: 60 * 60 * 24,
		});

		return result;
	}

	async getNotes(page = 1, term = "") {
		if (term) return this.searchNotes(term, page);
		return this.getLatestNotes(page);
	}

	async readNote(path: string) {
		let cached = await this.kv.get(`note:${path}`, "json");
		if (cached !== null) return noteSchema.parse(cached);

		let url = new URL(`${this.site}/${path}.json`, BASE_URL);

		let response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				Authorization: `${this.email} ${this.token}`,
				"Content-Type": "application/json",
			},
		});

		let data = await response.json();

		let result = noteSchema.parse(data);

		await this.kv.put(`note:${path}`, JSON.stringify(result), {
			expirationTtl: 60 * 60 * 24,
		});

		return result;
	}

	async emit({ event, data }: z.infer<typeof webhookSchema>) {
		switch (event) {
			case "notes-reordered": {
				return await this.deleteLatestKeys();
			}
			case "note-updated":
			case "note-created":
			case "note-deleted": {
				let { note } = data;
				await this.kv.delete(`note:${note.path}`);
				await this.deleteLatestKeys();
				return;
			}
		}
	}

	parseWebhookBody(data: unknown): z.infer<typeof webhookSchema> {
		return webhookSchema.parse(data);
	}

	private async deleteLatestKeys() {
		let result = await this.kv.list({ prefix: "latest:" });
		let keys = result.keys.map((key) => key.name);
		await Promise.all(keys.map((key) => this.kv.delete(key)));
	}
}
