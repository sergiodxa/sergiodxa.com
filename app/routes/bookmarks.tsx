import type {
	LoaderArgs,
	V2_MetaDescriptor,
	V2_MetaFunction,
} from "@remix-run/cloudflare";

import { useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils";

import { PageHeader } from "~/components/page-header";
import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/i18n.server";

export function loader({ request, context }: LoaderArgs) {
	return context.time("routes/bookmarks#loader", async () => {
		void context.services.log.http(request);

		return jsonHash({
			bookmarks: context.services.bookmarks.perform(),
			async meta(): Promise<V2_MetaDescriptor[]> {
				let t = await i18n.getFixedT(request);

				return [{ title: t("bookmarks.meta.title") }];
			},
		});
	});
}

export let meta: V2_MetaFunction<typeof loader> = ({ data }) => {
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
