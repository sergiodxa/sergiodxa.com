import type { LoaderArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { Trans } from "react-i18next";

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

	let [notes, bookmarks] = await Promise.all([
		cn.getLatestNotes(),
		airtable.getBookmarks(10),
	]);

	return json({ notes, bookmarks });
}

export let handle: SDX.Handle = { hydrate: true };

export default function Index() {
	let { notes, bookmarks } = useLoaderData<typeof loader>();
	let t = useT();
	return (
		<main className="mx-auto grid max-w-screen-lg gap-8 divide-y divide-black md:grid-cols-2 md:divide-y-0 md:divide-x">
			<section className="space-y-2 px-0 py-6 md:px-6 md:py-2">
				<header>
					<h2 className="text-xl font-semibold">{t("Latest notes")}</h2>
					<p className="text-sm text-gray-900">
						{t("These are my latests articles")}
					</p>
				</header>

				<ul className="space-y-1">
					{notes.map((note) => {
						return (
							<li key={note.id} className="list-inside list-disc">
								<Link to={note.path}>{note.title}</Link>
							</li>
						);
					})}
				</ul>

				<footer className="text-xs text-gray-900">
					<Trans
						t={t}
						defaults="Want to read them all? <link:articles>Check the full article list</link:articles>"
						components={{
							// eslint-disable-next-line jsx-a11y/anchor-has-content
							"link:articles": <Link to="/articles" className="underline" />,
						}}
					/>
				</footer>
			</section>

			<section className="space-y-2 px-0 py-6 md:px-6 md:py-2">
				<header>
					<h2 className="text-xl font-semibold">{t("Recent bookmarks")}</h2>
					<p className="text-sm text-gray-900">
						{t("The latests links I have bookmarked")}
					</p>
				</header>

				<ul className="space-y-1">
					{bookmarks.map((bookmark) => {
						return (
							<li key={bookmark.id} className="list-inside list-disc">
								<a href={bookmark.url}>{bookmark.title}</a>
							</li>
						);
					})}
				</ul>
			</section>
		</main>
	);
}
