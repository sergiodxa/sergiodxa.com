import type { AppLoadContext } from "@remix-run/cloudflare";

import { count, eq } from "drizzle-orm";

import { Tables, database } from "~/services/db.server";

export async function queryStats(context: AppLoadContext) {
	let db = database(context.db);

	let [articles, likes, tutorials] = await Promise.all(
		["article" as const, "like" as const, "tutorial" as const].map(
			async (type) => {
				let results = await db
					.select({ value: count() })
					.from(Tables.posts)
					.where(eq(Tables.posts.type, type));
				return results.at(0)?.value ?? 0;
			},
		),
	);

	return { articles, likes, tutorials };
}
