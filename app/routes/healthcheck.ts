import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { count } from "drizzle-orm";

import { Tables, database } from "~/services/db.server";

export async function loader({ context }: LoaderFunctionArgs) {
	await database(context.db).select({ value: count() }).from(Tables.posts);
	return new Response("OK", { status: 200 });
}
