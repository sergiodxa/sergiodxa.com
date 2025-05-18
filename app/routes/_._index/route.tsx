import { useTranslation } from "react-i18next";
import { z } from "zod";
import { PageHeader } from "~/components/page-header";
import { Subscribe } from "~/components/subscribe";
import { ok } from "~/helpers/response";
import { measure } from "~/middleware/server-timing";
import type { Route } from "./+types/route";
import { FeedList } from "./feed";
import {
	queryArticles,
	queryBookmarks,
	queryGlossary,
	queryTutorials,
	sort,
} from "./queries";

export async function loader({ request }: Route.LoaderArgs) {
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
		measure("_._index", "_._index.tsx#queryArticles", () =>
			queryArticles(query),
		),
		measure("_._index", "_._index.tsx#queryBookmarks", () =>
			queryBookmarks(query),
		),
		measure("_._index", "_._index.tsx#queryTutorials", () =>
			queryTutorials(query),
		),
		measure("_._index", "_._index.tsx#queryGlossary", () =>
			queryGlossary(query),
		),
	]);

	return ok(
		{ items: sort([...articles, ...bookmarks, ...tutorials, ...glossary]) },
		{ headers },
	);
}

export default function Component({ loaderData }: Route.ComponentProps) {
	let { t } = useTranslation("translation", { keyPrefix: "home" });

	return (
		<main className="mx-auto flex max-w-screen-sm flex-col gap-8">
			<PageHeader t={t} />

			<div className="flex flex-col gap-y-4">
				<Subscribe t={t} />

				<FeedList t={t} items={loaderData.items} />
			</div>
		</main>
	);
}
