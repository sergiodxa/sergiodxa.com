import type { LoaderArgs, MetaFunction } from "@remix-run/cloudflare";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";

import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";
import { AirtableService } from "~/services/airtable.server";
import { i18n } from "~/services/i18n.server";

export async function loader({ request, context }: LoaderArgs) {
	let airtable = new AirtableService(
		context!.env.AIRTABLE_API_KEY,
		context!.env.AIRTABLE_BASE,
		context!.env.AIRTABLE_TABLE_ID
	);

	let bookmarks = await airtable.getBookmarks();

	let t = await i18n.getFixedT(request);

	let meta = { title: t("Bookmarks of Sergio Xalambrí") };

	return json({ bookmarks, meta });
}

export let meta: MetaFunction = ({ data }) => {
	if (!data) return {};
	let { meta } = data as UseDataFunctionReturn<typeof loader>;
	return meta;
};

export default function Bookmarks() {
	let { bookmarks } = useLoaderData<typeof loader>();
	let t = useT();

	return (
		<section className="space-y-2">
			<header>
				<h2 className="text-3xl font-bold">{t("Bookmarks")}</h2>
			</header>

			<main>
				<ul className="space-y-2">
					{bookmarks.map((bookmark) => (
						<li key={bookmark.url} className="list-inside list-disc">
							<a href={bookmark.url} rel="nofollow noreferer">
								{bookmark.title}
							</a>
						</li>
					))}
				</ul>
			</main>
		</section>
	);
}
