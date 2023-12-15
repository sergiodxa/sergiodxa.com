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
		void new Logger(context.env.LOGTAIL_SOURCE_TOKEN).http(request);

		let headers = new Headers({
			"cache-control": "max-age=60, s-maxage=120, stale-while-revalidate",
		});

		return jsonHash(
			{
				async articles() {
					let articles = await Feed.articles(context);
					return articles.map((article) => {
						return {
							id: String(article.path),
							type: "article",
							payload: {
								title: article.title,
								link: `/articles/${article.path}`,
								createdAt: new Date(article.createdAt).getTime(),
							},
						} as const;
					});
				},
				async bookmarks() {
					let bookmarks = await Feed.bookmarks(context);
					return bookmarks.map((bookmark) => {
						return {
							id: String(bookmark.id),
							type: "bookmark",
							payload: {
								title: bookmark.title,
								link: bookmark.url,
								createdAt: new Date(bookmark.createdAt).getTime(),
							},
						} as const;
					});
				},
			},
			{ headers },
		);
	});
}

export default function Index() {
	let { articles, bookmarks } = useLoaderData<typeof loader>();
	let t = useT("translation", "home");

	let feed = [...articles, ...bookmarks].sort(
		(a, b) => b.payload.createdAt - a.payload.createdAt,
	);

	return (
		<main className="mx-auto flex max-w-screen-sm flex-col gap-8">
			<PageHeader t={t} />

			<FeedList t={t} items={feed} />
		</main>
	);
}
