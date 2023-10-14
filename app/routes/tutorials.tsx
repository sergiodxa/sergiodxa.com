import type {
	DataFunctionArgs,
	MetaFunction,
	MetaDescriptor,
} from "@remix-run/cloudflare";

import { Link, useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils";

import { PageHeader } from "~/components/page-header";
import { SearchForm } from "~/components/search-form";
import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/i18n.server";

export function loader(_: DataFunctionArgs) {
	return _.context.time("routes/tutorials#loader", async () => {
		void _.context.services.log.http(_.request);

		let url = new URL(_.request.url);

		let query = url.searchParams.get("q") ?? "";
		let page = Number(url.searchParams.get("page") ?? 1);

		let headers = new Headers({
			"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
		});

		let tutorials = query
			? _.context.services.tutorials.search({ query, page })
			: _.context.services.tutorials.list({ page });

		return jsonHash(
			{
				term: query,
				page,
				tutorials,
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
	let { tutorials, term, page } = useLoaderData<typeof loader>();
	let t = useT("translation", "tutorials");

	if (tutorials.page.size === 0) {
		return (
			<main className="mx-auto max-w-screen-sm space-y-4">
				<h2 className="text-3xl font-bold">{t("404")}</h2>
				<p>{t("empty", { page })}</p>
			</main>
		);
	}

	let prevLink = term
		? `/tutorials?q=${term}&page=${page - 1}`
		: `/tutorials?page=${page - 1}`;

	let nextLink = term
		? `/tutorials?q=${term}&page=${page + 1}`
		: `/tutorials?page=${page + 1}`;

	return (
		<main className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<div className="space-y-4">
				<SearchForm t={t} defaultValue={term} />

				<ul className="space-y-2">
					{tutorials.items.map((tutorial) => (
						<li key={tutorial.slug} className="list-inside list-disc">
							<Link to={`/tutorials/${tutorial.slug}`} prefetch="intent">
								{tutorial.title}
							</Link>
						</li>
					))}
				</ul>
			</div>

			<footer className="flex w-full justify-evenly">
				{tutorials.page.prev && (
					<>
						<Link to={prevLink} prefetch="intent">
							{t("pagination.prev")}
						</Link>
					</>
				)}
				{tutorials.page.next && (
					<>
						<Link to={nextLink} prefetch="intent">
							{t("pagination.next")}
						</Link>
					</>
				)}
			</footer>
		</main>
	);
}
