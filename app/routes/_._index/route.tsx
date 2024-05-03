import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";

import { PageHeader } from "~/components/page-header";
import { Subscribe } from "~/components/subscribe";
import { useT } from "~/helpers/use-i18n.hook";
import { Logger } from "~/modules/logger.server";

import { FeedList } from "./feed";
import {
	queryArticles,
	queryBookmarks,
	queryGlossary,
	queryTutorials,
	sort,
} from "./queries";

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

		let [articles, bookmarks, tutorials, glossary] = await Promise.all([
			queryArticles(context, query),
			queryBookmarks(context, query),
			queryTutorials(context, query),
			queryGlossary(context, query),
		]);

		return json(
			{ items: sort([...articles, ...bookmarks, ...tutorials, ...glossary]) },
			{ headers },
		);
	});
}

export default function Index() {
	let { items } = useLoaderData<typeof loader>();
	let t = useT("home");

	return (
		<main className="mx-auto flex max-w-screen-sm flex-col gap-8">
			<PageHeader t={t} />

			<div className="flex flex-col gap-y-4">
				<Subscribe t={t} />

				<FeedList t={t} items={items} />
			</div>
		</main>
	);
}
