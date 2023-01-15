import type { ActionArgs } from "@remix-run/cloudflare";

import { measure } from "~/utils/measure";

export function action({ request, context }: ActionArgs) {
	return measure("routes/webhooks/cn#action", async () => {
		void context.services.log.http(request);
		await context.services.notes.webhook.perform(await request.json());
		return null;
	});
}
