import { integer } from "drizzle-orm/sqlite-core";

export const createdAt = integer("created_at", { mode: "timestamp_ms" })
	.notNull()
	.$defaultFn(() => new Date());

export const updatedAt = integer("updated_at", { mode: "timestamp_ms" })
	.notNull()
	.$defaultFn(() => new Date());
