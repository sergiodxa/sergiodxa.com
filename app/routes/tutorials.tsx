import type { LoaderArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";

export async function loader({ request, context }: LoaderArgs) {
	let url = new URL(request.url);

	let query = url.searchParams.get("q") ?? "";
	let page = Number(url.searchParams.get("page") ?? "1");

	let tutorials =
		query.trim().length > 0
			? await context.services.tutorials.search.perform(query, page)
			: await context.services.tutorials.list.perform(
					Number(url.searchParams.get("page") ?? "1")
			  );

	let headers = new Headers();

	if (tutorials.page.next) {
		url.searchParams.set("page", tutorials.page.next.toString());
		headers.append("Link", `<${url.toString()}>; rel="next"`);
	}

	if (tutorials.page.prev) {
		url.searchParams.set("page", tutorials.page.prev.toString());
		headers.append("Link", `<${url.toString()}>; rel="prev"`);
	}

	url.searchParams.set("page", tutorials.page.first.toString());
	headers.append("Link", `<${url.toString()}>; rel="first"`);

	url.searchParams.set("page", tutorials.page.last.toString());
	headers.append("Link", `<${url.toString()}>; rel="last"`);

	return json(tutorials, { headers });
}
