import type { PostAttributes } from "~/models/post.server";
import type { Database, Tables } from "~/services/db.server";

import { Post } from "~/models/post.server";

interface Services {
	db: Database;
}

interface LikeAttributes extends PostAttributes {
	readonly title: string;
	readonly url: URL;
}

export class Like {
	private post: Post;

	constructor(post: Post | PostAttributes) {
		this.post = post instanceof Post ? post : new Post(post);
	}

	get id() {
		return this.post.id;
	}

	get slug() {
		return this.post.slug;
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
		let posts = await Post.list({ db }, "likes");
		return posts.map((post) => new Like(post));
	}

	static async show({ db }: Services, slug: Tables.Post["slug"]) {
		let post = await Post.show({ db }, slug);
		return new Like(post);
	}

	static async create(
		{ db }: Services,
		input: Omit<LikeAttributes, "id" | "meta" | "typeId">,
	) {
		let post = await Post.create({ db }, "likes", {
			...input,
			meta: { title: input.title, url: input.url.toString() },
		});

		return new Like(post);
	}
}
