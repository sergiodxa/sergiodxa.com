import type { z } from "zod";

import { NoteEventSchema } from "~/entities/note";

import { Service } from "./service";

export class CollectedNotesWebhookService extends Service {
	constructor(repos: SDX.Repos, private kv: KVNamespace) {
		super(repos);
	}

	async perform(input: unknown) {
		await this.emit(NoteEventSchema.parse(input));
	}

	private async emit({ event, data }: z.infer<typeof NoteEventSchema>) {
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

	private async deleteLatestKeys() {
		let result = await this.kv.list({ prefix: "latest:" });
		let keys = result.keys.map((key) => key.name);
		await Promise.all(
			keys
				.map((key) => this.kv.delete(key))
				.concat(this.kv.delete("feed:notes"))
		);
	}
}
