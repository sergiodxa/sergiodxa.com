import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Database = ReturnType<typeof database>;

export default function database(d1: D1Database) {
	return drizzle(d1, { schema });
}
