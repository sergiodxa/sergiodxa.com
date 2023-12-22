import type { Database } from "~/services/db.server";
import type { UUID } from "~/utils/uuid";

import { desc, eq } from "drizzle-orm";

import { Tables } from "~/services/db.server";
import { generateUUID } from "~/utils/uuid";

export interface PostAttributes {
	readonly id: string;
	// Attributes
	readonly type: "like" | "tutorial" | "article";
	// Relations
	readonly authorId: string;
	// Timestamps
	readonly createdAt: Date;
	readonly updatedAt: Date;
	// Meta
	readonly meta: Record<string, string>;
}

interface Services {
	db: Database;
}

export class Post {
	readonly id: string;
	// Attributes
	readonly type: string;
	// Relations
	readonly authorId: string;
	// Timestamps
	readonly createdAt: Date;
	readonly updatedAt: Date;
	// Meta
	public meta: Record<string, string>;

	constructor(input: Post | PostAttributes) {
		this.id = input.id;
		this.authorId = input.authorId;
		this.type = input.type;
		this.createdAt = input.createdAt;
		this.updatedAt = input.updatedAt;
		this.meta = input.meta;
	}

	toJSON() {
		return {
			id: this.id,
			// Attributes
			type: this.type,
			// Relations
			authorId: this.authorId,
			// Timestamps
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	toString() {
		return JSON.stringify(this.toJSON());
	}

	static async list({ db }: Services, type?: Tables.SelectPost["type"]) {
		let posts = await db.query.posts.findMany({
			with: { meta: true },
			orderBy: desc(Tables.posts.createdAt),
			where: type ? eq(Tables.posts.type, type) : undefined,
		});

		if (!posts) throw new Error("There are no post types.");

		return posts.map((post) => {
			return new Post({
				id: post.id,
				// Attributes
				type: post.type,
				// Relations
				authorId: post.authorId,
				// Timestamps
				createdAt: post.createdAt,
				updatedAt: post.updatedAt,
				// Meta
				meta: post.meta.reduce(
					(acc, meta) => {
						acc[meta.key] = meta.value;
						return acc;
					},
					{} as Record<string, string>,
				),
			});
		});
	}

	static async show({ db }: Services, id: UUID) {
		let post = await db.query.posts.findFirst({
			with: { meta: true },
			where: eq(Tables.posts.id, id),
		});

		if (!post) {
			throw new Error(`Couldn't find post with Id ${id}`);
		}

		return new Post({
			id: post.id,
			// Attributes
			type: post.type,
			// Relations
			authorId: post.authorId,
			// Timestamps
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
			// Meta
			meta: post.meta.reduce(
				(acc, meta) => {
					acc[meta.key] = meta.value;
					return acc;
				},
				{} as Record<string, string>,
			),
		});
	}

	static async create(
		{ db }: Services,
		input: Omit<Tables.InsertPost, "id">,
		meta: Record<string, string>,
	) {
		let id = generateUUID();

		let result = await db
			.insert(Tables.posts)
			.values({ ...input, id })
			.execute();

		if (!result.success && result.error) throw new Error(result.error);

		await Promise.all(
			Object.entries(meta).map(async ([key, value]) => {
				await db
					.insert(Tables.postMeta)
					.values({ postId: id, key, value })
					.execute();
			}),
		);

		return await Post.show({ db }, id);
	}

	static async destroy({ db }: Services, id: UUID) {
		let result = await db
			.delete(Tables.posts)
			.where(eq(Tables.posts.id, id))
			.execute();

		if (!result.success && result.error) throw new Error(result.error);
	}
}
