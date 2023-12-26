import {
	type LoaderFunctionArgs,
	type MetaFunction,
	type MetaDescriptor,
	json,
} from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";

import { PageHeader } from "~/components/page-header";
import { SearchForm } from "~/components/search-form";
import { useT } from "~/helpers/use-i18n.hook";
import { Article } from "~/models/article.server";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { Cache } from "~/services/cache.server";
import { CollectedNotes } from "~/services/cn.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let url = new URL(request.url);

	let term = url.searchParams.get("q") ?? "";
	let page = Number(url.searchParams.get("page") ?? 1);

	let headers = new Headers({
		"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
	});

	let cache = new Cache(context.kv.cn);
	let cn = new CollectedNotes(
		context.env.CN_EMAIL,
		context.env.CN_TOKEN,
		context.env.CN_SITE,
	);

	let t = await new I18n().getFixedT(request);

	try {
		let articles =
			term === ""
				? await Article.list({ cache, cn }, page)
				: await Article.search({ cache, cn }, term, page);

		let meta: MetaDescriptor[] = [];

		if (term === "") {
			meta.push({ title: t("articles.meta.title.default") });
		} else {
			meta.push({ title: t("articles.meta.title.search", { term }) });
		}

		return json(
			{
				term,
				page,
				meta,
				articles: articles.map((article) => {
					return { path: article.path, title: article.title };
				}),
			},
			{ headers },
		);
	} catch (error) {
		if (error instanceof Error) {
			throw json({ message: error.message }, 500);
		}
		throw error;
	}
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return [];
	return data.meta;
};

export default function Articles() {
	let { articles, term, page } = useLoaderData<typeof loader>();
	let t = useT("translation", "articles");

	let count = articles.length;

	if (count === 0) {
		return (
			<main className="mx-auto max-w-screen-sm space-y-4">
				<h2 className="text-3xl font-bold">{t("empty.title")}</h2>
				<p>{t("empty.body", { term })}</p>
			</main>
		);
	}

	let prevLink = term
		? `/articles?q=${term}&page=${page - 1}`
		: `/articles?page=${page - 1}`;

	let nextLink = term
		? `/articles?q=${term}&page=${page + 1}`
		: `/articles?page=${page + 1}`;

	return (
		<main className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<div className="space-y-4">
				<SearchForm t={t} defaultValue={term} />

				<ul className="space-y-2">
					{articles.map((article) => (
						<li key={article.path} className="list-inside list-disc">
							<Link to={`/articles/${article.path}`} prefetch="intent">
								{article.title}
							</Link>
						</li>
					))}
				</ul>
			</div>

			<footer className="flex w-full justify-evenly">
				{page > 1 && (
					<>
						<Link to={prevLink} prefetch="intent">
							{t("nav.prev")}
						</Link>
					</>
				)}
				{count === 40 && (
					<>
						<Link to={nextLink} prefetch="intent">
							{t("nav.next")}
						</Link>
					</>
				)}
			</footer>
		</main>
	);
}
