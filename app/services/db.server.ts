import { relations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export namespace Tables {
	let id = text("id", { mode: "text" })
		.primaryKey()
		.unique()
		.notNull()
		.$defaultFn(() => crypto.randomUUID());

	export let users = sqliteTable("users", {
		id,
		displayName: text("displayName", { mode: "text" }).notNull(),
		email: text("email", { mode: "text" }).notNull(),
		role: text("role", { mode: "text" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	});

	export type User = typeof users.$inferSelect;
	export type InsertUser = typeof users.$inferInsert;

	export let usersRelation = relations(users, ({ many }) => {
		return {
			connections: many(connections),
			posts: many(posts),
		};
	});

	export let connections = sqliteTable("connections", {
		id,
		userId: text("user_id", { mode: "text" })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		providerId: text("provider_id", { mode: "text" }).notNull(),
		providerName: text("provider_name", { mode: "text" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	});

	export type Connection = typeof connections.$inferSelect;
	export type InsertConnection = typeof connections.$inferInsert;

	export let connectionsRelation = relations(connections, ({ one }) => {
		return {
			user: one(users, {
				fields: [connections.userId],
				references: [users.id],
			}),
		};
	});

	export let locales = sqliteTable("locales", {
		id,
		name: text("name", { mode: "text" }).notNull(),
		code: text("code", { mode: "text" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	});

	export type Locale = typeof locales.$inferSelect;
	export type InsertLocale = typeof locales.$inferInsert;

	export let postTypes = sqliteTable("post_types", {
		id,
		name: text("name", { mode: "text" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	});

	export type PostType = typeof postTypes.$inferSelect;
	export type InsertPostType = typeof postTypes.$inferInsert;

	export let postTypeRelation = relations(postTypes, ({ many }) => {
		return {
			posts: many(posts),
		};
	});

	export let postMeta = sqliteTable("post_meta", {
		id,
		key: text("key", { mode: "text" }).notNull(),
		value: text("value", { mode: "text" }).notNull(),
		postId: text("post_id", { mode: "text" })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	});

	export type PostMeta = typeof postMeta.$inferSelect;
	export type InsertPostMeta = typeof postMeta.$inferInsert;

	export let postMetaRelation = relations(postMeta, ({ one }) => {
		return {
			post: one(posts, { fields: [postMeta.postId], references: [posts.id] }),
		};
	});

	export let posts = sqliteTable("posts", {
		id,
		authorId: text("author_id", { mode: "text" })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		typeId: text("type_id", { mode: "text" })
			.notNull()
			.references(() => postTypes.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	});

	export type Post = typeof posts.$inferSelect;
	export type InsertPost = typeof posts.$inferInsert;

	export let postRelation = relations(posts, ({ one, many }) => {
		return {
			author: one(users, { fields: [posts.authorId], references: [users.id] }),
			type: one(postTypes, {
				fields: [posts.typeId],
				references: [postTypes.id],
			}),
			meta: many(postMeta),
		};
	});
}

export type Database = ReturnType<typeof database>;

export function database(d1: D1Database) {
	return drizzle(d1, {
		schema: {
			users: Tables.users,
			usersRelation: Tables.usersRelation,
			connections: Tables.connections,
			connectionsRelation: Tables.connectionsRelation,
			locales: Tables.locales,
			postTypes: Tables.postTypes,
			postTypeRelation: Tables.postTypeRelation,
			postMeta: Tables.postMeta,
			postMetaRelation: Tables.postMetaRelation,
			posts: Tables.posts,
			postRelation: Tables.postRelation,
		},
	});
}
