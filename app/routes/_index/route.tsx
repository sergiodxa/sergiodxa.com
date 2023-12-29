import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Trans } from "react-i18next";
import { z } from "zod";

import { PageHeader } from "~/components/page-header";
import { SearchForm } from "~/components/search-form";
import { useT } from "~/helpers/use-i18n.hook";
import { Logger } from "~/modules/logger.server";

import { FeedList } from "./feed";
import { queryArticles, queryBookmarks, queryTutorials, sort } from "./queries";

export function loader({ request, context }: LoaderFunctionArgs) {
	return context.time("routes/index#loader", async () => {
		void new Logger(context).http(request);

		let headers = new Headers({
			"cache-control": "max-age=60, s-maxage=120, stale-while-revalidate",
		});

		let url = new URL(request.url);
		let query = z
			.string()
			.transform((v) => v.toLowerCase())
			.nullable()
			.parse(url.searchParams.get("q"));

		let [articles, bookmarks, tutorials] = await Promise.all([
			queryArticles(context, query),
			queryBookmarks(context, query),
			queryTutorials(context, query),
		]);

		return json(
			{
				query,
				items: sort(articles, bookmarks, tutorials),
			},
			{ headers },
		);
	});
}

export default function Index() {
	let { items, query } = useLoaderData<typeof loader>();
	let t = useT("home");

	return (
		<main className="mx-auto flex max-w-screen-sm flex-col gap-8">
			<PageHeader t={t} />

			<div className="flex flex-col gap-y-4">
				<Subscribe />
				<SearchForm t={t} defaultValue={query ?? undefined} />

				<FeedList t={t} items={items} />
			</div>
		</main>
	);
}

function Subscribe() {
	let t = useT("home.subscribe");
	return (
		<Trans
			t={t}
			parent="p"
			className="text-sm text-gray-600"
			i18nKey="cta"
			components={{
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				rss: <a href="/rss" className="text-blue-600 underline" />,
			}}
		/>
	);
}
