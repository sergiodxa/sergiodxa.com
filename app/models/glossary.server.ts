import Fuse from "fuse.js";
import type { Database } from "~/db";
import type * as schema from "~/db/schema";
import { measure } from "~/middleware/server-timing";
import type { BaseMeta } from "~/models/post.server";
import { Post } from "~/models/post.server";
import type { UUID } from "~/utils/uuid";

interface GlossaryMeta extends BaseMeta {
	slug: string;
	term: string;
	title?: string;
	definition: string;
}

type InsertGlossary = Omit<schema.InsertPost, "id" | "type"> & GlossaryMeta;

interface Services {
	db: Database;
}

// @ts-expect-error TS is an idiot
export class Glossary extends Post<GlossaryMeta> {
	override readonly type = "glossary" as const;

	get slug() {
		return this.meta.slug;
	}

	get term() {
		return this.meta.term;
	}

	get title() {
		return this.meta.title;
	}

	get definition() {
		return this.meta.definition;
	}

	get pathname() {
		return `/glossary#${this.slug}`;
	}

	override toJSON() {
		return {
			...super.toJSON(),
			// Glossary Attributes
			title: this.title,
			slug: this.slug,
			term: this.term,
			definition: this.definition,
		};
	}

	static override async list(services: Services) {
		let posts = await measure("Glossary.list", () =>
			Post.list<GlossaryMeta>(services, "glossary"),
		);
		return posts.map((post) => new Glossary(services, post));
	}

	static override async show(services: Services, id: UUID) {
		let post = await measure("Glossary.show", () =>
			Post.show<GlossaryMeta>(services, "glossary", id),
		);
		return new Glossary(services, post);
	}

	static override async create(services: Services, input: InsertGlossary) {
		return new Glossary(
			services,
			await measure("Glossary.create", () =>
				Post.create<GlossaryMeta>(services, { ...input, type: "glossary" }),
			),
		);
	}

	static override update(services: Services, id: UUID, input: InsertGlossary) {
		return measure("Glossary.update", () =>
			Post.update<GlossaryMeta>(services, id, {
				...input,
				type: "glossary",
			}),
		);
	}

	static async search(services: Services, query: string) {
		let glossary = await measure("Glossary.search#list", () =>
			Glossary.list(services),
		);

		let trimmedQuery = query.trim().toLowerCase();

		let fuse = new Fuse(glossary, {
			keys: ["term", "title", "definition"],
			includeScore: true,
			findAllMatches: false,
			useExtendedSearch: true,
		});

		return fuse.search(trimmedQuery);
	}
}
