import { text } from "drizzle-orm/sqlite-core";
import type { UUID } from "~/utils/uuid";
import { generateUUID } from "~/utils/uuid";

export const UUID_LENGTH = 36;

export default text("id", { mode: "text", length: UUID_LENGTH })
	.$type<UUID>()
	.primaryKey()
	.unique()
	.notNull()
	.$defaultFn(() => generateUUID());
