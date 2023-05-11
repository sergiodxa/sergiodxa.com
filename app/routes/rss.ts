import type { DataFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ context }: DataFunctionArgs) {
	let response = await context.time("getFeed", () => {
		return fetch("https://collectednotes.com/sergiodxa/feed/public_site.rss");
	});

	let headers = new Headers(response.headers);

	headers.set("cache-control", "s-maxage=3600, stale-while-revalidate");

	return new Response(response.body, { headers });
}
