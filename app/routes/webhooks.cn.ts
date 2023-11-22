import type { ActionFunctionArgs } from "@remix-run/cloudflare";

export function action({ request, context }: ActionFunctionArgs) {
	return context.time("routes/webhooks/cn#action", async () => {
		void context.services.log.http(request);
		await context.services.notes.webhook.perform(await request.json());
		return null;
	});
}
