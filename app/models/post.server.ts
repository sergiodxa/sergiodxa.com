import type { Database } from "~/services/db.server";

import { asc, eq } from "drizzle-orm";

import { Tables } from "~/services/db.server";
import { hasMany } from "~/utils/arrays";

export interface PostAttributes {
	readonly id: string;
	readonly authorId: string;
	readonly typeId: string;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	readonly meta: Record<string, string>;
}

interface Services {
	db: Database;
}

export class Post {
	readonly id: string;
	// Relations
	readonly authorId: string;
	readonly typeId: string;
	// Timestamps
	readonly createdAt: Date;
	readonly updatedAt: Date;
	// Meta
	public meta: Record<string, string>;

	constructor(input: Post | PostAttributes) {
		this.id = input.id;
		this.authorId = input.authorId;
		this.typeId = input.typeId;
		this.createdAt = input.createdAt;
		this.updatedAt = input.updatedAt;
		this.meta = input.meta;
	}

	toJSON() {
		return {
			// Attributes
			id: this.id,
			// Relations
			authorId: this.authorId,
			typeId: this.typeId,
			// Timestamps
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	toString() {
		return JSON.stringify(this.toJSON());
	}

	static async list({ db }: Services, type?: Tables.PostType["name"]) {
		let result = await db.query.postTypes.findMany({
			with: {
				posts: { with: { meta: true }, orderBy: asc(Tables.posts.createdAt) },
			},
			where: type ? eq(Tables.postTypes.name, type) : undefined,
		});

		if (!result) throw new Error("There are no post types.");

		return result
			.flatMap((type) => type.posts)
			.map((post) => {
				return new Post({
					// Post attributes
					id: post.id,
					authorId: post.authorId,
					typeId: post.typeId,
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

	static async show({ db }: Services, id: Tables.Post["id"]) {
		let result = await db.query.postTypes.findFirst({
			with: {
				posts: { with: { meta: true }, where: eq(Tables.posts.id, id) },
			},
		});

		if (!result || hasMany(result.posts)) {
			throw new Error(`Couldn't find post with Id ${id}`);
		}

		let post = result.posts.at(0);

		if (!post) throw new Error("Missing post");

		return new Post({
			// Post attributes
			id: post.id,
			authorId: post.authorId,
			typeId: post.typeId,
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
		type: Tables.PostType["name"],
		input: Omit<PostAttributes, "id" | "typeId"> &
			Partial<Pick<PostAttributes, "createdAt" | "updatedAt">>,
	) {
		let postType = await db.query.postTypes.findFirst({
			where: eq(Tables.postTypes.name, type),
		});

		if (!postType) throw new Error(`Missing post type ${type}`);

		let id = crypto.randomUUID();

		let result = await db
			.insert(Tables.posts)
			.values({
				id,
				authorId: input.authorId,
				typeId: postType.id,
				createdAt: input.createdAt,
				updatedAt: input.updatedAt,
			})
			.execute();

		if (!result.success && result.error) throw new Error(result.error);

		await Promise.all(
			Object.entries(input.meta).map(async ([key, value]) => {
				await db
					.insert(Tables.postMeta)
					.values({ postId: id, key, value })
					.execute();
			}),
		);

		return await Post.show({ db }, id);
	}

	static async destroy({ db }: Services, id: Tables.Post["id"]) {
		let result = await db
			.delete(Tables.posts)
			.where(eq(Tables.posts.id, id))
			.execute();

		if (!result.success && result.error) throw new Error(result.error);
	}
}
