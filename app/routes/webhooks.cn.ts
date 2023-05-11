import type { ActionArgs } from "@remix-run/cloudflare";

export function action({ request, context }: ActionArgs) {
	return context.time("routes/webhooks/cn#action", async () => {
		void context.services.log.http(request);
		await context.services.notes.webhook.perform(await request.json());
		return null;
	});
}
