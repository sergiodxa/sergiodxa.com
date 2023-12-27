import type {
	MetaFunction,
	MetaDescriptor,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { Link, useLoaderData } from "@remix-run/react";
import { Trans } from "react-i18next";
import { jsonHash } from "remix-utils/json-hash";

import { PageHeader } from "~/components/page-header";
import { SearchForm } from "~/components/search-form";
import { useT } from "~/helpers/use-i18n.hook";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";

import { queryTutorials } from "./queries";

export function loader({ request, context }: LoaderFunctionArgs) {
	return context.time("routes/tutorials#loader", async () => {
		void new Logger(context).http(request);

		let url = new URL(request.url);

		let query = url.searchParams.get("q") ?? "";

		let tutorials = await queryTutorials(context, query);

		let headers = new Headers({
			"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
		});

		return jsonHash(
			{
				term: query,
				tutorials: tutorials.map((tutorial) => {
					return {
						path: tutorial.path,
						title: tutorial.title,
					};
				}),
				async meta(): Promise<MetaDescriptor[]> {
					let t = await new I18n().getFixedT(request);

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
	let t = useT("tutorials");

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
				<li key={tutorial.path} className="list-inside list-disc">
					<Link to={tutorial.path} prefetch="intent">
						{tutorial.title}
					</Link>
				</li>
			))}
		</ul>
	);
}

function Subscribe() {
	let t = useT("tutorials.subscribe");
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
