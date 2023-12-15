import type {
	DataFunctionArgs,
	MetaFunction,
	MetaDescriptor,
} from "@remix-run/cloudflare";

import { Link, useLoaderData } from "@remix-run/react";
import { Trans } from "react-i18next";
import { jsonHash } from "remix-utils/json-hash";

import { PageHeader } from "~/components/page-header";
import { SearchForm } from "~/components/search-form";
import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/i18n.server";
import { Tutorial } from "~/models/tutorial.server";
import { Logger } from "~/modules/logger.server";
import { GitHub } from "~/services/github.server";

export function loader(_: DataFunctionArgs) {
	return _.context.time("routes/tutorials#loader", async () => {
		void new Logger(_.context.env.LOGTAIL_SOURCE_TOKEN).http(_.request);

		let url = new URL(_.request.url);

		let query = url.searchParams.get("q") ?? "";
		let page = Number(url.searchParams.get("page") ?? 1);

		let gh = new GitHub(_.context.env.GH_APP_ID, _.context.env.GH_APP_PEM);

		let tutorials = await Tutorial.list(
			{ gh, kv: _.context.kv.tutorials },
			query,
		);

		let headers = new Headers({
			"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
		});

		return jsonHash(
			{
				term: query,
				page,
				tutorials: tutorials.map((tutorial) => {
					return { slug: tutorial.slug, title: tutorial.title };
				}),
				async meta(): Promise<MetaDescriptor[]> {
					let t = await i18n.getFixedT(_.request);

					let meta: MetaDescriptor[] = [];

					if (query === "") {
						meta.push({ title: t("tutorials.meta.title.default") });
					} else {
						meta.push({
							title: t("tutorials.meta.title.search", {
								query: decodeURIComponent(query),
							}),
						});
					}

					return meta;
				},
			},
			{ headers },
		);
	});
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return [];
	return data.meta;
};

export default function Component() {
	let { term } = useLoaderData<typeof loader>();
	let t = useT("translation", "tutorials");

	return (
		<main className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<div className="space-y-4">
				<Subscribe />
				<SearchForm t={t} defaultValue={term} />
				<List />
			</div>
		</main>
	);
}

function List() {
	let { tutorials } = useLoaderData<typeof loader>();
	return (
		<ul className="space-y-2">
			{tutorials.map((tutorial) => (
				<li key={tutorial.slug} className="list-inside list-disc">
					<Link to={`/tutorials/${tutorial.slug}`} prefetch="intent">
						{tutorial.title}
					</Link>
				</li>
			))}
		</ul>
	);
}

function Subscribe() {
	let t = useT("translation", "tutorials.subscribe");
	return (
		<Trans
			t={t}
			parent="p"
			className="text-lg text-gray-800"
			i18nKey="cta"
			components={{
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				rss: <a href="/tutorials.rss" />,
			}}
		/>
	);
}
