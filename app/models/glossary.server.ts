import type { BaseMeta, PostAttributes } from "~/models/post.server";
import type { Database, Tables } from "~/services/db.server";
import type { UUID } from "~/utils/uuid";

import Fuse from "fuse.js";

import { Post } from "~/models/post.server";

interface GlossaryMeta extends BaseMeta {
	slug: string;
	term: string;
	title?: string;
	definition: string;
}

type InsertGlossary = Omit<Tables.InsertPost, "id" | "type"> & GlossaryMeta;

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
		let posts = await Post.list<GlossaryMeta>(services, "glossary");
		return posts.map((post) => new Glossary(services, post));
	}

	static override async show(services: Services, id: UUID) {
		let post = await Post.show<GlossaryMeta>(services, "glossary", id);
		return new Glossary(services, post);
	}

	static override async create(services: Services, input: InsertGlossary) {
		return new Glossary(
			services,
			await Post.create<GlossaryMeta>(services, { ...input, type: "glossary" }),
		);
	}

	static override update(services: Services, id: UUID, input: InsertGlossary) {
		return Post.update<GlossaryMeta>(services, id, {
			...input,
			type: "glossary",
		});
	}

	static async search(services: Services, query: string) {
		let glossary = await Glossary.list(services);

		let trimmedQuery = query.trim().toLowerCase();

		let fuse = new Fuse(glossary, {
			keys: ["term", "title", "definition"],
			includeScore: true,
			findAllMatches: false,
		});

		return fuse.search(trimmedQuery);
	}
}
