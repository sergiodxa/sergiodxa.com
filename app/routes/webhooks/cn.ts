import type { ActionArgs } from "@remix-run/cloudflare";

import { measure } from "~/utils/measure";

export function action({ request, context }: ActionArgs) {
	return measure("routes/webhooks/cn#action", async () => {
		void context.services.log.http(request);
		let webhook = context.services.cn.parseWebhookBody(await request.json());
		await context.services.cn.emit(webhook);
		return null;
	});
}
