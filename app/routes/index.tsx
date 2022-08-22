import type { LoaderArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";
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
	let [notes, bookmarks] = await Promise.all([
		cn.getLatestNotes(),
		airtable.getBookmarks(10),
	]);
	let end = Date.now();

	return json({
		diff: end - start,
		notes: notes.slice(0, 10),
		bookmarks: bookmarks,
	});
}

export let handle: SDX.Handle = { hydrate: true };

export default function Index() {
	let { notes, bookmarks } = useLoaderData<typeof loader>();
	let t = useT();
	return (
		<main className="mx-auto grid max-w-screen-lg grid-cols-2 gap-8">
			<section className="space-y-2">
				<h2 className="text-lg font-semibold">{t("Latest notes")}</h2>
				<p>{t("These are my latests articles")}</p>

				<ul className="space-y-1">
					{notes.map((note) => {
						return (
							<li key={note.id}>
								<Link
									to={note.path}
									className="text-blue-600 underline visited:text-violet-600"
								>
									{note.title}
								</Link>
							</li>
						);
					})}
				</ul>
			</section>

			<section className="space-y-2">
				<h2 className="text-lg font-semibold">{t("Recent bookmarks")}</h2>
				<p>{t("The latests links I have bookmarked")}</p>

				<ul className="space-y-1">
					{bookmarks.map((bookmark) => {
						return (
							<li key={bookmark.id}>
								<a
									href={bookmark.url}
									className="text-blue-600 underline visited:text-violet-600"
								>
									{bookmark.title}
								</a>
							</li>
						);
					})}
				</ul>
			</section>
		</main>
	);
}
