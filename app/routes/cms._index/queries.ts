import type { AppLoadContext } from "@remix-run/cloudflare";

import { count, eq } from "drizzle-orm";

import { Tables, database } from "~/services/db.server";

export async function queryStats(context: AppLoadContext) {
	let db = database(context.db);

	let [articles, likes, tutorials] = await Promise.all([
		db
			.select({ value: count() })
			.from(Tables.posts)
			.where(eq(Tables.posts.type, "article"))
			.then((result) => result.at(0)?.value ?? 0),

		db
			.select({ value: count() })
			.from(Tables.posts)
			.where(eq(Tables.posts.type, "like"))
			.then((result) => result.at(0)?.value ?? 0),

		db
			.select({ value: count() })
			.from(Tables.posts)
			.where(eq(Tables.posts.type, "tutorial"))
			.then((result) => result.at(0)?.value ?? 0),
	]);

	return { articles, likes, tutorials };
}
