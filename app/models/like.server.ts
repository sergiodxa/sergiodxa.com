import type { Database, Tables } from "~/services/db.server";

import { Post } from "~/models/post.server";

interface Services {
	db: Database;
}

export class Like {
	private post: Post;

	constructor(post: Post) {
		this.post = post instanceof Post ? post : new Post(post);
	}

	get id() {
		return this.post.id;
	}

	get title() {
		return this.post.meta.title;
	}

	get url() {
		return new URL(this.post.meta.url);
	}

	get createdAt() {
		return this.post.createdAt;
	}

	get updatedAt() {
		return this.post.updatedAt;
	}

	toJSON() {
		return {
			...this.post.toJSON(),
			// Like Attributes
			title: this.title,
			url: this.url.toJSON(),
		};
	}

	static async list({ db }: Services) {
		let posts = await Post.list({ db }, "like");
		return posts.map((post) => new Like(post));
	}

	static async show({ db }: Services, id: Tables.SelectPost["id"]) {
		let post = await Post.show({ db }, id);
		return new Like(post);
	}

	static async create(
		{ db }: Services,
		input: Omit<Tables.InsertPost, "type"> & { title: string; url: URL },
	) {
		let post = await Post.create(
			{ db },
			{ ...input, type: "like" },
			{ title: input.title, url: input.url.toString() },
		);

		return new Like(post);
	}

	static async destroy({ db }: Services, id: Tables.SelectPost["id"]) {
		await Post.destroy({ db }, id);
	}
}
