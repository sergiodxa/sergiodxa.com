import { measure } from "~/utils/measure";

export function loader() {
	return measure("routes/rss#loader", async () => {
		let response = await fetch(
			"https://collectednotes.com/sergiodxa/feed/public_site.rss"
		);

		let headers = new Headers(response.headers);

		headers.set("cache-control", "s-maxage=3600, stale-while-revalidate");

		return new Response(response.body, { headers });
	});
}
