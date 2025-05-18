import Fuse from "fuse.js";
import type { Database } from "~/db";
import type * as schema from "~/db/schema";
import { measure } from "~/middleware/server-timing";
import type { BaseMeta } from "~/models/post.server";
import { Post } from "~/models/post.server";

interface Services {
	db: Database;
}

interface LikeMeta extends BaseMeta {
	title: string;
	url: string;
}

type InsertLike = Omit<schema.InsertPost, "id" | "type"> & LikeMeta;

// @ts-expect-error TS is an idiot
export class Like extends Post<LikeMeta> {
	override readonly type = "like" as const;

	get title() {
		return this.meta.title;
	}

	get url() {
		return new URL(this.meta.url);
	}

	override toJSON() {
		return {
			...super.toJSON(),
			// Like Attributes
			title: this.title,
			url: this.url.toJSON(),
		};
	}

	static override async list({ db }: Services) {
		let posts = await measure("Like.list", "Like.list", () =>
			Post.list<LikeMeta>({ db }, "like"),
		);
		return posts.map((post) => new Like({ db }, post));
	}

	static async search({ db }: Services, query: string) {
		let likes = await measure("Like.search", "Like.search#list", () =>
			Like.list({ db }),
		);

		let trimmedQuery = query.trim().toLowerCase();

		let fuse = new Fuse(likes, {
			keys: ["title"],
			includeScore: true,
			findAllMatches: false,
			useExtendedSearch: true,
		});

		return fuse.search(trimmedQuery);
	}

	static override async show({ db }: Services, id: schema.SelectPost["id"]) {
		let post = await measure("Like.show", "Like.show", () =>
			Post.show<LikeMeta>({ db }, "like", id),
		);
		return new Like({ db }, post);
	}

	static override async create(
		{ db }: Services,
		{ title, url, ...input }: InsertLike,
	) {
		let post = await measure("Like.create", "Like.create", () =>
			Post.create<LikeMeta>({ db }, { ...input, type: "like", title, url }),
		);

		return new Like({ db }, post);
	}

	static override async update(
		services: Services,
		id: schema.SelectPost["id"],
		input: InsertLike,
	) {
		return measure("Like.update", "Like.update", () =>
			Post.update<LikeMeta>(services, id, {
				...input,
				type: "like",
			}),
		);
	}
}
