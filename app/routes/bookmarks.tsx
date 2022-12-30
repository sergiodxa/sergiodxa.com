import type {
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/cloudflare";

import { useLoaderData } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/services/i18n.server";
import { json } from "~/utils/http";
import { measure } from "~/utils/measure";

export function loader({ request, context }: LoaderArgs) {
	return measure("routes/bookmarks#loader", async () => {
		void context.services.log.http(request);

		return json({
			bookmarks: context.services.airtable.getBookmarks(100),
			async meta() {
				let t = await i18n.getFixedT(request);

				return { title: t("bookmarks.meta.title") };
			},
		});
	});
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return {};
	return data.meta;
};

export default function Bookmarks() {
	let { bookmarks } = useLoaderData<typeof loader>();
	let t = useT();

	return (
		<section className="space-y-2">
			<header>
				<h2 className="text-3xl font-bold">{t("bookmarks.title")}</h2>
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
