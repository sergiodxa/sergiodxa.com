import type { LoaderArgs } from "@remix-run/cloudflare";

import { xml } from "remix-utils";

export async function loader({ context }: LoaderArgs) {
	let feed = await context.services.tutorials.rss.perform();
	return xml(feed);
}
