import type { ActionFunctionArgs } from "@remix-run/cloudflare";

import { Logger } from "~/modules/logger.server";
import { Cache } from "~/services/cache.server";

import { Schema } from "./schemas";

export function action({ request, context }: ActionFunctionArgs) {
	return context.time("routes/webhooks/cn#action", async () => {
		void new Logger(context.env.LOGTAIL_SOURCE_TOKEN).http(request);

		let cache = new Cache(context.kv.cn);

		let body = await Schema.promise().parse(request.json());

		switch (body.event) {
			case "notes-reordered": {
				return await deleteLatestKeys(cache);
			}
			case "note-updated":
			case "note-created":
			case "note-deleted": {
				let { note } = body.data;
				await cache.delete(`article:${note.path}`);
				await deleteLatestKeys(cache);
				return;
			}
		}
		return null;
	});
}

async function deleteLatestKeys(cache: Cache) {
	let result = await cache.list({ prefix: "latest:" });
	let keys = result.keys.map((key) => key.name);
	await Promise.all(
		keys.map((key) => cache.delete(key)).concat(cache.delete("feed:notes")),
	);
}
