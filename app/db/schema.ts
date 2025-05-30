import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import id, { UUID_LENGTH } from "~/db/helpers/id";
import { createdAt, updatedAt } from "~/db/helpers/timestamps";

export let users = sqliteTable("users", {
	id,
	// Timestamps
	createdAt,
	updatedAt,
	// Attributes
	role: text("role", { enum: ["guest", "admin"] })
		.notNull()
		.default("guest"),
	email: text("email", { mode: "text", length: 320 }).notNull(),
	avatar: text("avatar", { mode: "text", length: 2048 }).notNull(),
	username: text("username", { mode: "text", length: 39 }).notNull(),
	displayName: text("display_name", { mode: "text", length: 255 }).notNull(),
});

export let connections = sqliteTable("connections", {
	id,
	// Timestamps
	createdAt,
	updatedAt,
	// Relations
	userId: text("user_id", { mode: "text", length: UUID_LENGTH })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	// Attributes
	providerId: text("provider_id", { mode: "text", length: 255 }).notNull(),
	providerName: text("provider_name", {
		mode: "text",
		length: 255,
	}).notNull(),
});

export let posts = sqliteTable("posts", {
	id,
	// Timestamps
	createdAt,
	updatedAt,
	// Relations
	authorId: text("author_id", { mode: "text", length: UUID_LENGTH })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	// Attributes
	type: text("type", {
		enum: ["like", "tutorial", "article", "comment", "glossary"],
		length: 255,
	}).notNull(),
});

export let postMeta = sqliteTable("post_meta", {
	id,
	// Timestamps
	createdAt,
	updatedAt,
	// Relations
	postId: text("post_id", { mode: "text", length: UUID_LENGTH })
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	// Attribures
	key: text("key", { mode: "text", length: 255 }).notNull(),
	value: text("value", { mode: "text" }).notNull(),
});

export let usersRelation = relations(users, ({ many }) => {
	return {
		connections: many(connections),
		posts: many(posts),
	};
});

export let connectionsRelation = relations(connections, ({ one }) => {
	return {
		user: one(users, {
			fields: [connections.userId],
			references: [users.id],
		}),
	};
});

export let postRelation = relations(posts, ({ one, many }) => {
	return {
		author: one(users, { fields: [posts.authorId], references: [users.id] }),
		meta: many(postMeta),
	};
});

export let postMetaRelation = relations(postMeta, ({ one }) => {
	return {
		post: one(posts, { fields: [postMeta.postId], references: [posts.id] }),
	};
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SelectConnection = typeof connections.$inferSelect;
export type InsertConnection = typeof connections.$inferInsert;

export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export type SelectPostMeta = typeof postMeta.$inferSelect;
export type InsertPostMeta = typeof postMeta.$inferInsert;
