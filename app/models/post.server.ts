import { and, desc, eq } from "drizzle-orm";
import type { Database } from "~/db";
import * as schema from "~/db/schema";
import { measure } from "~/middleware/server-timing";
import type { UUID } from "~/utils/uuid";
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
	readonly type: "like" | "tutorial" | "article" | "comment" | "glossary";
	// Relations
	readonly authorId: UUID;
	// Timestamps
	readonly createdAt: Date;
	readonly updatedAt: Date;
	// Meta
	public meta: Meta;

	private authorPromise?: Promise<schema.SelectUser>;

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
				where: eq(schema.users.id, this.authorId),
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
		type?: schema.SelectPost["type"],
	) {
		let posts = await measure("Post.list", () =>
			db.query.posts.findMany({
				with: { meta: true },
				orderBy: desc(schema.posts.createdAt),
				where: type ? eq(schema.posts.type, type) : undefined,
			}),
		);

		if (!posts) throw new Error("There are no post types.");

		return posts.map((post) => {
			assertUUID(post.authorId);
			return new Post(
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
					meta: reduceMeta<Meta>(post.meta),
				},
			);
		});
	}

	static async show<Meta extends BaseMeta>(
		{ db }: Services,
		type: schema.SelectPost["type"],
		id: UUID,
	) {
		let post = await measure("Post.show", () => {
			return db.query.posts.findFirst({
				with: { meta: true },
				where: and(eq(schema.posts.type, type), eq(schema.posts.id, id)),
			});
		});

		if (!post) throw new Error(`Couldn't find post with Id ${id}`);

		assertUUID(post.authorId);

		return new Post(
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
				meta: reduceMeta<Meta>(post.meta),
			},
		);
	}

	static async destroy({ db }: Services, id: UUID) {
		let result = await measure("Post.destroy", () =>
			db.delete(schema.posts).where(eq(schema.posts.id, id)).execute(),
		);

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
		}: Omit<schema.InsertPost, "id"> & Meta,
	) {
		let id = generateUUID();

		let result = await measure("Post.create", () =>
			db
				.insert(schema.posts)
				.values({ id, type, authorId, createdAt, updatedAt })
				.execute(),
		);

		if (!result.success && result.error) throw new Error(result.error);

		await measure("Post.create#meta", () =>
			Promise.all(
				Object.entries(meta).map(async ([key, value]) => {
					return createPostMeta(db, id, key, value);
				}),
			),
		);

		return await measure("Post.create#show", () =>
			Post.show<Meta>({ db }, type, id),
		);
	}

	static async update<Meta extends BaseMeta>(
		{ db }: Services,
		id: UUID,
		{
			authorId,
			type,
			createdAt,
			updatedAt,
			...meta
		}: Omit<schema.InsertPost, "id"> & Meta,
	) {
		let result = await measure("Post.update", () =>
			db
				.update(schema.posts)
				.set({ type, authorId, createdAt, updatedAt })
				.where(eq(schema.posts.id, id))
				.execute(),
		);

		if (!result.success && result.error) throw new Error(result.error);

		await measure("Post.update#meta", () =>
			db
				.delete(schema.postMeta)
				.where(eq(schema.postMeta.postId, id))
				.execute(),
		);

		await measure("Post.update#meta", () =>
			Promise.all(
				Object.entries(meta).map(async ([key, value]) => {
					return createPostMeta(db, id, key, value);
				}),
			),
		);

		return await measure("Post.update#show", () =>
			Post.show<Meta>({ db }, type, id),
		);
	}
}

async function createPostMeta(
	db: Database,
	id: UUID,
	key: string,
	value: unknown,
): Promise<void> {
	if (!value) return;

	if (typeof value === "string") {
		return void (await db
			.insert(schema.postMeta)
			.values({ postId: id, key, value })
			.execute());
	}

	if (typeof value === "boolean" || typeof value === "number") {
		return createPostMeta(db, id, key, value.toString());
	}

	if (typeof value === "symbol") return;

	if (typeof value === "function") return createPostMeta(db, id, key, value());

	if (value instanceof Promise) return createPostMeta(db, id, key, await value);

	if (Array.isArray(value)) {
		return void (await Promise.all(
			value.map((item: unknown) => createPostMeta(db, id, key, item)),
		));
	}
}

function reduceMeta<Meta extends BaseMeta>(
	meta: schema.SelectPostMeta[],
): Meta {
	return meta.reduce((acc, meta) => {
		if (meta.key in acc) {
			let value = acc[meta.key];
			if (Array.isArray(value)) {
				// biome-ignore lint/performance/noAccumulatingSpread: It's fine here
				return { ...acc, [meta.key]: [...value, meta.value] };
			}
			// biome-ignore lint/performance/noAccumulatingSpread: It's fine here
			return { ...acc, [meta.key]: [value, meta.value] };
		}
		// biome-ignore lint/performance/noAccumulatingSpread: It's fine here
		return { ...acc, [meta.key]: meta.value };
	}, {} as Meta);
}
