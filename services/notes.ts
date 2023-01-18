import type { RenderableTreeNode, Scalar } from "@markdoc/markdoc";

import { Tag } from "@markdoc/markdoc";
import { z } from "zod";

import { NoteEventSchema } from "~/entities/note";
import { parseMarkdown } from "~/md.server";
import { Service } from "~/services/service";
import { generateID } from "~/utils/generate-id";

let TagSchema: z.ZodType<Tag> = z.object({
	$$mdtype: z.literal("Tag"),
	name: z.string(),
	attributes: z.record(z.any()),
	children: z.lazy(() => RenderableTreeNodeSchema.array()),
});

let ScalarSchema: z.ZodType<Scalar> = z.union([
	z.null(),
	z.boolean(),
	z.number(),
	z.string(),
	z.lazy(() => ScalarSchema.array()),
	z.record(z.lazy(() => ScalarSchema)),
]);

let RenderableTreeNodeSchema = z.union([TagSchema, ScalarSchema]);

let NoteSchema = z.object({
	path: z.string(),
	body: RenderableTreeNodeSchema,
	title: z.string(),
	headline: z.string(),
	wordCount: z.number(),
	datePublished: z
		.string()
		.transform((v) => new Date(v))
		.pipe(z.date()),
	dateModified: z
		.string()
		.transform((v) => new Date(v))
		.pipe(z.date()),
});

export namespace CollectedNotes {
	export class ReadNoteService extends Service {
		constructor(repos: SDX.Repos, private kv: KVNamespace) {
			super(repos);
		}

		async perform(path: string): Promise<z.infer<typeof NoteSchema>> {
			let cached = await this.kv.get(`note:${path}`, "json");
			if (cached) return NoteSchema.parse(cached);

			let note = await this.repos.notes.fetchNoteByPath(path);
			let result: z.infer<typeof NoteSchema> = NoteSchema.parse({
				path,
				body: this.parseBody(note.body),
				title: note.title,
				headline: note.headline,
				wordCount: note.body.split(/\s+/).length,
				datePublished: note.created_at,
				dateModified: note.updated_at,
			});

			await this.kv.put(`note:${path}`, JSON.stringify(result), {
				expirationTtl: 60 * 60 * 24,
			});

			return result;
		}

		parseBody(body: string): RenderableTreeNode {
			return parseMarkdown(body, {
				nodes: {
					heading: {
						children: ["inline"],
						attributes: {
							id: { type: String },
							level: { type: Number, required: true, default: 1 },
						},
						transform(node, config) {
							let attributes = node.transformAttributes(config);
							let children = node.transformChildren(config);

							let id = generateID(children, attributes);

							if (node.attributes["level"] === 1) {
								return new Tag(
									`h${node.attributes["level"]}`,
									{ ...attributes, id },
									children
								);
							}

							return new Tag("a", { href: `#${id}` }, [
								new Tag(
									`h${node.attributes["level"]}`,
									{ ...attributes, id },
									children
								),
							]);
						},
					},
				},
			});
		}
	}

	export class WebhookService extends Service {
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
}
