import type { BaseMeta, PostAttributes } from "~/models/post.server";
import type { Database, Tables } from "~/services/db.server";
import type { UUID } from "~/utils/uuid";

import { Post } from "~/models/post.server";

interface GlossaryMeta extends BaseMeta {
	slug: string;
	term: string;
	definition: string;
}

type InsertGlossary = Omit<Tables.InsertPost, "id" | "type"> & GlossaryMeta;

interface Services {
	db: Database;
}

// @ts-expect-error TS is an idiot
export class Glossary extends Post<GlossaryMeta> {
	override readonly type = "glossary" as const;

	constructor(
		services: Services,
		input: PostAttributes<GlossaryMeta> | PostAttributes<GlossaryMeta>,
	) {
		super(services, input);
	}

	get slug() {
		return this.meta.slug;
	}

	get term() {
		return this.meta.term;
	}

	get definition() {
		return this.meta.definition;
	}

	override toJSON() {
		return {
			...super.toJSON(),
			// Glossary Attributes
			slug: this.slug,
			term: this.term,
			definition: this.definition,
		};
	}

	static override async list(services: Services) {
		let posts = await Post.list<GlossaryMeta>(services, "glossary");
		return posts.map((post) => new this(services, post));
	}

	static override async show(services: Services, id: UUID) {
		let post = await Post.show<GlossaryMeta>(services, "glossary", id);
		return new this(services, post);
	}

	static override async create(services: Services, input: InsertGlossary) {
		return new this(
			services,
			await Post.create<GlossaryMeta>(services, { ...input, type: "glossary" }),
		);
	}
}
