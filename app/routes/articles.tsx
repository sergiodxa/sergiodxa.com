import type {
	LoaderFunctionArgs,
	MetaFunction,
	MetaDescriptor,
} from "@remix-run/cloudflare";

import { Link, useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils/json-hash";

import { PageHeader } from "~/components/page-header";
import { SearchForm } from "~/components/search-form";
import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/i18n.server";
import { Article } from "~/models/article.server";
import { Cache } from "~/services/cache.server";
import { CollectedNotes } from "~/services/cn.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void context.services.log.http(request);

	let url = new URL(request.url);

	let term = url.searchParams.get("q") ?? "";
	let page = Number(url.searchParams.get("page") ?? 1);

	let headers = new Headers({
		"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
	});

	return jsonHash(
		{
			term,
			page,

			async articles() {
				let cache = new Cache(context.kv.cn);
				let cn = new CollectedNotes(
					context.env.CN_EMAIL,
					context.env.CN_TOKEN,
					context.env.CN_SITE,
				);

				let articles =
					term === ""
						? await Article.list({ cache, cn }, page)
						: await Article.search({ cache, cn }, term, page);

				return articles.map((article) => {
					return { path: article.path, title: article.title };
				});
			},

			async meta(): Promise<MetaDescriptor[]> {
				let t = await i18n.getFixedT(request);

				let meta: MetaDescriptor[] = [];

				if (term === "") {
					meta.push({ title: t("articles.meta.title.default") });
				} else {
					meta.push({ title: t("articles.meta.title.search", { term }) });
				}

				return meta;
			},
		},
		{ headers },
	);
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
				<h2 className="text-3xl font-bold">{t("404")}</h2>
				<p>{t("empty", { page })}</p>
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
