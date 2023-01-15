import { NoteSchema } from "~/entities/note";
import { Repository } from "~/repositories/repository";

export interface INotesRepo extends Repository<typeof NoteSchema> {}

export class NotesRepo
	extends Repository<typeof NoteSchema>
	implements INotesRepo
{
	protected schema = NoteSchema;

	private BASE_URL = new URL("https://collectednotes.com/");

	constructor(
		private email: string,
		private token: string,
		private site: string
	) {
		super();
	}

	async fetchNotes(page = 1) {
		let url = new URL(`sites/${this.site}/notes`, this.BASE_URL);

		url.searchParams.set("page", page.toString());
		url.searchParams.set("visibility", "public_site");

		let response = await this.fetch(url);

		let data = await response.json();

		return this.schema.array().parse(data);
	}

	async searchNotes(term: string, page = 1) {
		let url = new URL(`sites/${this.site}/notes/search`, this.BASE_URL);

		url.searchParams.set("page", page.toString());
		url.searchParams.set("term", term);
		url.searchParams.set("visibility", "public_site");

		let response = await this.fetch(url);

		if (!response.ok) return [];

		let data = await response.json();

		return this.schema.array().parse(data);
	}

	async fetchNoteByPath(path: string) {
		let url = new URL(`${this.site}/${path}.json`, this.BASE_URL);

		let response = await this.fetch(url);

		if (!response.ok) throw new NoteNotFoundError(path);

		let data = await response.json();

		return this.schema.parse(data);
	}

	private async fetch(url: URL) {
		return fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				Authorization: `${this.email} ${this.token}`,
				"Content-Type": "application/json",
			},
		});
	}
}

export class NoteNotFoundError extends Error {
	constructor(path: string) {
		super(`Note not found: ${path}`);
	}
}
