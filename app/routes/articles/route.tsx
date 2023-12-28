import {
	type LoaderFunctionArgs,
	type MetaFunction,
	type MetaDescriptor,
	json,
} from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { Trans } from "react-i18next";
import { z } from "zod";

import { PageHeader } from "~/components/page-header";
import { SearchForm } from "~/components/search-form";
import { useT } from "~/helpers/use-i18n.hook";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";

import { queryArticles } from "./queries";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let url = new URL(request.url);

	let term = z.string().nullable().parse(url.searchParams.get("q"));

	let headers = new Headers({
		"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
	});

	let t = await new I18n().getFixedT(request);

	try {
		let articles = await queryArticles(context, term);

		let meta: MetaDescriptor[] = [];

		if (term === "") {
			meta.push({ title: t("articles.meta.title.default") });
		} else {
			meta.push({ title: t("articles.meta.title.search", { term }) });
		}

		return json({ term: term ?? undefined, meta, articles }, { headers });
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
	let { articles, term } = useLoaderData<typeof loader>();
	let t = useT("articles");

	let count = articles.length;

	if (count === 0) {
		return (
			<main className="mx-auto max-w-screen-sm space-y-4">
				<h2 className="text-3xl font-bold">{t("empty.title")}</h2>
				<p>{t("empty.body", { term })}</p>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<div className="flex flex-col gap-y-4">
				<Subscribe />
				<SearchForm t={t} defaultValue={term} />

				<ul className="space-y-2">
					{articles.map((article) => (
						<li key={article.path} className="list-inside list-disc">
							<Link to={article.path} prefetch="intent">
								{article.title}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</main>
	);
}

function Subscribe() {
	let t = useT("articles.subscribe");
	return (
		<Trans
			t={t}
			parent="p"
			className="text-lg text-gray-800"
			i18nKey="cta"
			components={{
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				rss: <a href="/articles.rss" />,
			}}
		/>
	);
}
