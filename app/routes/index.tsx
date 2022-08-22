import type { LoaderArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { AirtableService } from "~/services/airtable.server";
import { CollectedNotesService } from "~/services/cn.server";

export async function loader({ context }: LoaderArgs) {
	let cn = new CollectedNotesService(
		context!.env.CN_EMAIL,
		context!.env.CN_TOKEN,
		context!.env.CN_SITE
	);

	let airtable = new AirtableService(
		context!.env.AIRTABLE_API_KEY,
		context!.env.AIRTABLE_BASE,
		context!.env.AIRTABLE_TABLE_ID
	);

	let start = Date.now();
	let [latestNotes, bookmarks] = await Promise.all([
		cn.getLatestNotes(),
		airtable.getBookmarks(10),
	]);
	let end = Date.now();

	return json({ diff: end - start, latestNotes, bookmarks });
}

export let handle: SDX.Handle = { hydrate: true };

export default function Index() {
	let { latestNotes, bookmarks } = useLoaderData<typeof loader>();
	return (
		<article className="prose mx-auto my-8">
			<h1>Home</h1>
			<pre>
				<code>{JSON.stringify({ latestNotes }, null, "\t")}</code>
			</pre>
		</article>
	);
}
