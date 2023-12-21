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

	export let connections = sqliteTable("connections", {
		id,
		userId: text("user_id", { mode: "text" }).notNull(),
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
}

export type Database = ReturnType<typeof database>;

export function database(d1: D1Database) {
	return drizzle(d1, {
		schema: {
			users: Tables.users,
			connections: Tables.connections,
			connectionsRelation: Tables.connectionsRelation,
		},
	});
}
