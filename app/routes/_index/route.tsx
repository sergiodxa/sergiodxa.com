import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils/json-hash";

import { FeedList } from "~/components/feed";
import { PageHeader } from "~/components/page-header";
import { useT } from "~/helpers/use-i18n.hook";
import { Feed } from "~/modules/feed.server";
import { Logger } from "~/modules/logger.server";

export function loader({ request, context }: LoaderFunctionArgs) {
	return context.time("routes/index#loader", async () => {
		void new Logger(context).http(request);

		let headers = new Headers({
			"cache-control": "max-age=60, s-maxage=120, stale-while-revalidate",
		});

		return jsonHash(
			{
				articles: Feed.articles(context),
				bookmarks: Feed.bookmarks(context),
				tutorials: Feed.tutorials(context),
			},
			{ headers },
		);
	});
}

export default function Index() {
	let { articles, bookmarks, tutorials } = useLoaderData<typeof loader>();
	let t = useT("translation", "home");

	let feed = [...articles, ...bookmarks, ...tutorials].sort(
		(a, b) => b.payload.createdAt - a.payload.createdAt,
	);

	return (
		<main className="mx-auto flex max-w-screen-sm flex-col gap-8">
			<PageHeader t={t} />

			<FeedList t={t} items={feed} />
		</main>
	);
}
