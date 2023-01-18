import type {
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/cloudflare";

import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";
import { Trans } from "react-i18next";
import { jsonHash } from "remix-utils";

import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/i18n.server";
import { measure } from "~/utils/measure";

export function loader({ request, context }: LoaderArgs) {
	return measure("routes/articles#loader", async () => {
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
				async meta() {
					let t = await i18n.getFixedT(request);

					let meta = { title: t("articles.meta.title.default") };

					if (term !== "") {
						meta.title = t("articles.meta.title.search", { term });
					}

					return meta;
				},
			},
			{ headers }
		);
	});
}

export let meta: MetaFunction = ({ data }) => {
	if (!data) return {};
	let { meta } = data as SerializeFrom<typeof loader>;
	return meta;
};

export default function Articles() {
	let { notes, term, page } = useLoaderData<typeof loader>();
	let { submission } = useTransition();
	let t = useT();

	let count = notes.length;

	if (count === 0) {
		return (
			<main className="space-y-4">
				<h2 className="text-3xl font-bold">{t("articles.404")}</h2>
				<p>{t("articles.empty", { page })}</p>
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
		<main className="space-y-2">
			<header>
				<h2 className="text-3xl font-bold">{t("articles.title")}</h2>
				{term ? (
					<p className="text-xl text-gray-900">
						<Trans
							t={t}
							i18nKey="articles.description.search"
							values={{ count, term }}
							components={{ highlight: <em className="quote" /> }}
						/>
					</p>
				) : (
					<p className="text-xl text-gray-900">
						{t("articles.description.default")}
					</p>
				)}
			</header>

			<div className="space-y-4">
				<Form method="get" role="search" className="p-4">
					<label htmlFor="q" className="block pl-4 text-lg font-semibold">
						{t("articles.search.title")}
					</label>
					<div className="flex items-center space-x-4">
						<input
							id="q"
							type="search"
							name="q"
							defaultValue={term}
							className="flex-grow rounded-full py-2 px-4"
							placeholder={t("articles.search.placeholder") as string}
						/>
						<button
							type="submit"
							className="rounded-full border border-gray-900 bg-gray-800 px-4 py-2 text-white"
						>
							{submission
								? t("articles.search.button.progress")
								: t("articles.search.button.default")}
						</button>
					</div>
				</Form>

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
							{t("articles.nav.prev")}
						</Link>
					</>
				)}
				{count === 40 && (
					<>
						<Link to={nextLink} prefetch="intent">
							{t("articles.nav.next")}
						</Link>
					</>
				)}
			</footer>
		</main>
	);
}
