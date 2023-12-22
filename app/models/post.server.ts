import type { Database } from "~/services/db.server";

import { asc, eq } from "drizzle-orm";

import { Tables } from "~/services/db.server";
import { hasMany } from "~/utils/arrays";

export interface PostAttributes {
	readonly id: string;
	readonly slug: string;
	readonly status: string;
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
	readonly slug: string;
	readonly status: string;
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
		this.slug = input.slug;
		this.status = input.status;
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
			slug: this.slug,
			status: this.status,
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
				posts: { with: { meta: true }, orderBy: asc(Tables.posts.slug) },
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
					slug: post.slug,
					status: post.status,
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

	static async show({ db }: Services, slug: Tables.Post["slug"]) {
		let result = await db.query.postTypes.findFirst({
			with: {
				posts: { with: { meta: true }, where: eq(Tables.posts.slug, slug) },
			},
		});

		if (!result || hasMany(result.posts)) {
			throw new Error(`Couldn't find post with slug ${slug}`);
		}

		let post = result.posts.at(0);

		if (!post) throw new Error("Missing post");

		return new Post({
			// Post attributes
			id: post.id,
			slug: post.slug,
			status: post.status,
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

		if (!postType) {
			let result = await db
				.insert(Tables.postTypes)
				.values({ name: type })
				.returning()
				.execute();
			postType = result.at(0);
			if (!postType) throw new Error("Failed to insert post type");
		}

		let [post] = await db
			.insert(Tables.posts)
			.values({
				slug: input.slug,
				status: input.status,
				authorId: input.authorId,
				typeId: postType.id,
				createdAt: input.createdAt,
				updatedAt: input.updatedAt,
			})
			.returning()
			.onConflictDoNothing()
			.execute();

		if (!post) throw new Error("Failed to insert post");

		await Promise.all(
			Object.entries(input.meta).map(async ([key, value]) => {
				await db
					.insert(Tables.postMeta)
					.values({ postId: post.id, key, value })
					.execute();
			}),
		);

		return new Post({ ...post, meta: input.meta });
	}
}
