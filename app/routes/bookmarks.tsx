import type {
	LoaderFunctionArgs,
	MetaDescriptor,
	MetaFunction,
} from "@remix-run/cloudflare";

import { useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils/json-hash";

import { PageHeader } from "~/components/page-header";
import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/i18n.server";
import { Bookmark } from "~/models/bookmark.server";
import { Airtable } from "~/services/airtable.server";
import { Cache } from "~/services/cache.server";

export function loader({ request, context }: LoaderFunctionArgs) {
	return context.time("routes/bookmarks#loader", async () => {
		void context.services.log.http(request);

		let airtable = new Airtable(
			context.env.AIRTABLE_API_KEY,
			context.env.AIRTABLE_BASE,
			context.env.AIRTABLE_TABLE_ID,
		);

		let cache = new Cache(context.kv.airtable);

		return jsonHash({
			bookmarks: Bookmark.list({ airtable, cache }),
			async meta(): Promise<MetaDescriptor[]> {
				let t = await i18n.getFixedT(request);

				return [{ title: t("bookmarks.meta.title") }];
			},
		});
	});
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return [];
	return data.meta;
};

export default function Bookmarks() {
	let { bookmarks } = useLoaderData<typeof loader>();
	let t = useT("translation", "bookmarks");

	return (
		<section className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

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
