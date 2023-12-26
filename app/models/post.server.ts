import type { Database } from "~/services/db.server";
import type { UUID } from "~/utils/uuid";

import { desc, eq } from "drizzle-orm";

import { Tables } from "~/services/db.server";
import { assertUUID, generateUUID } from "~/utils/uuid";

export interface BaseMeta {
	[key: string]: unknown;
}

export type ModelAttributes<Model> = Model extends {
	toJSON(): infer Attributes;
}
	? Attributes
	: never;

export type PostAttributes<Meta extends BaseMeta> = ModelAttributes<Post<Meta>>;

interface Services {
	db: Database;
}

export class Post<Meta extends BaseMeta> {
	readonly id: UUID;
	// Attributes
	readonly type: "like" | "tutorial" | "article";
	// Relations
	readonly authorId: UUID;
	// Timestamps
	readonly createdAt: Date;
	readonly updatedAt: Date;
	// Meta
	public meta: Meta;

	private authorPromise?: Promise<Tables.SelectUser>;

	constructor(
		protected services: Services,
		input: Post<Meta> | PostAttributes<Meta>,
	) {
		this.id = input.id;
		this.authorId = input.authorId;
		this.type = input.type;
		this.createdAt = input.createdAt;
		this.updatedAt = input.updatedAt;
		this.meta = input.meta;
	}

	get author() {
		if (this.authorPromise) return this.authorPromise;
		this.authorPromise = this.services.db.query.users
			.findFirst({
				where: eq(Tables.users.id, this.authorId),
			})
			.then((author) => {
				if (author) return author;
				throw new Error(
					`Couldn't find author with id ${this.authorId} on post ${this.id}.`,
				);
			});
		return this.authorPromise;
	}

	get cacheKey() {
		return `post:${this.id}`;
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
			// Meta
			meta: this.meta,
		};
	}

	toString() {
		return JSON.stringify(this.toJSON());
	}

	static async list<Meta extends BaseMeta>(
		{ db }: Services,
		type?: Tables.SelectPost["type"],
	) {
		let posts = await db.query.posts.findMany({
			with: { meta: true },
			orderBy: desc(Tables.posts.createdAt),
			where: type ? eq(Tables.posts.type, type) : undefined,
		});

		if (!posts) throw new Error("There are no post types.");

		return posts.map((post) => {
			assertUUID(post.authorId);
			return new this(
				{ db },
				{
					id: post.id,
					// Attributes
					type: post.type,
					// Relations
					authorId: post.authorId,
					// Timestamps
					createdAt: post.createdAt,
					updatedAt: post.updatedAt,
					// Meta
					meta: post.meta.reduce((acc, meta) => {
						return { ...acc, [meta.key]: meta.value };
					}, {} as Meta),
				},
			);
		});
	}

	static async show<Meta extends BaseMeta>({ db }: Services, id: UUID) {
		let post = await db.query.posts.findFirst({
			with: { meta: true },
			where: eq(Tables.posts.id, id),
		});

		if (!post) {
			throw new Error(`Couldn't find post with Id ${id}`);
		}

		assertUUID(post.authorId);

		return new this(
			{ db },
			{
				id: post.id,
				// Attributes
				type: post.type,
				// Relations
				authorId: post.authorId,
				// Timestamps
				createdAt: post.createdAt,
				updatedAt: post.updatedAt,
				// Meta
				meta: post.meta.reduce((acc, meta) => {
					return { ...acc, [meta.key]: meta.value };
				}, {} as Meta),
			},
		);
	}

	static async destroy({ db }: Services, id: UUID) {
		let result = await db
			.delete(Tables.posts)
			.where(eq(Tables.posts.id, id))
			.execute();

		if (!result.success && result.error) throw new Error(result.error);
	}

	static async create<Meta extends BaseMeta>(
		{ db }: Services,
		{
			authorId,
			type,
			createdAt,
			updatedAt,
			...meta
		}: Omit<Tables.InsertPost, "id"> & Meta,
	) {
		let id = generateUUID();

		let result = await db
			.insert(Tables.posts)
			.values({ id, type, authorId, createdAt, updatedAt })
			.execute();

		if (!result.success && result.error) throw new Error(result.error);

		await Promise.all(
			Object.entries(meta).map(async ([key, value]) => {
				if (!value) return;
				await db
					.insert(Tables.postMeta)
					.values({ postId: id, key, value })
					.execute();
			}),
		);

		return await Post.show<Meta>({ db }, id);
	}
}
