import type { BaseMeta, PostAttributes } from "~/models/post.server";
import type { Database, Tables } from "~/services/db.server";

import { Post } from "~/models/post.server";

interface Services {
	db: Database;
}

interface LikeMeta extends BaseMeta {
	title: string;
	url: string;
}

type InsertLike = Omit<Tables.InsertPost, "id" | "type"> & LikeMeta;

// @ts-expect-error TS is an idiot
export class Like extends Post<LikeMeta> {
	constructor(input: Post<LikeMeta> | PostAttributes<LikeMeta>) {
		super(input);
	}

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
		let posts = await Post.list<LikeMeta>({ db }, "like");
		return posts.map((post) => new Like(post));
	}

	static override async show({ db }: Services, id: Tables.SelectPost["id"]) {
		let post = await Post.show<LikeMeta>({ db }, id);
		return new Like(post);
	}

	static override async create(
		{ db }: Services,
		{ title, url, ...input }: InsertLike,
	) {
		let post = await Post.create<LikeMeta>(
			{ db },
			{ ...input, type: "like", title, url },
		);

		return new Like(post);
	}

	static override async destroy({ db }: Services, id: Tables.SelectPost["id"]) {
		await super.destroy({ db }, id);
	}
}
