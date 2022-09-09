import type { ActionArgs } from "@remix-run/cloudflare";

export async function action({ request, context }: ActionArgs) {
	let webhook = context.services.cn.parseWebhookBody(await request.json());
	await context.services.cn.emit(webhook);
}
