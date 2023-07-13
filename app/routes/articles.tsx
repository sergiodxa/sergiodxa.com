import type {
	LoaderArgs,
	V2_MetaFunction,
	V2_MetaDescriptor,
} from "@remix-run/cloudflare";

import { Link, useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils";

import { PageHeader } from "~/components/page-header";
import { SearchForm } from "~/components/search-form";
import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/i18n.server";

export function loader({ request, context }: LoaderArgs) {
	return context.time("routes/articles#loader", async () => {
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
				notes: context.services.archive.perform(page, term),
				async meta(): Promise<V2_MetaDescriptor[]> {
					let t = await i18n.getFixedT(request);

					let meta: V2_MetaDescriptor[] = [];

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
	});
}

export let meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return [];
	return data.meta;
};

export default function Articles() {
	let { notes, term, page } = useLoaderData<typeof loader>();
	let t = useT("translation", "articles");

	let count = notes.length;

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
					{notes.map((note) => (
						<li key={note.id} className="list-inside list-disc">
							<Link to={`/articles/${note.path}`} prefetch="intent">
								{note.title}
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
