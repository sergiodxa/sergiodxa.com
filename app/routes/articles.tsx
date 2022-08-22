import type { LoaderArgs, MetaFunction } from "@remix-run/cloudflare";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";

import { json } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";
import { Trans } from "react-i18next";

import { useT } from "~/helpers/use-i18n.hook";
import { CollectedNotesService } from "~/services/cn.server";
import { i18n } from "~/services/i18n.server";

export async function loader({ request, context }: LoaderArgs) {
	let url = new URL(request.url);

	let term = url.searchParams.get("q") ?? "";
	let page = Number(url.searchParams.get("page") ?? 1);

	let cn = new CollectedNotesService(
		context!.env.CN_EMAIL,
		context!.env.CN_TOKEN,
		context!.env.CN_SITE
	);

	let notes = await cn.getNotes(page, term);

	let t = await i18n.getFixedT(request);

	let meta = { title: t("Articles of Sergio Xalambrí") };

	if (term !== "") meta.title = t("Search results for {{term}}", { term });

	return json({ term, page, notes, meta });
}

export let meta: MetaFunction = ({ data }) => {
	if (!data) return {};
	let { meta } = data as UseDataFunctionReturn<typeof loader>;
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
				<h2 className="text-3xl font-bold">{t("404 Not Found")}</h2>
				<p>
					{t(
						"The requested URL /articles?page={{page}} was not found on this server.",
						{ page }
					)}
				</p>
			</main>
		);
	}

	return (
		<main className="space-y-2">
			<header>
				<h2 className="text-3xl font-bold">{t("Articles")}</h2>
				{term ? (
					<p className="text-xl text-gray-900">
						<Trans
							t={t}
							defaults="Showing {{count}} articles for the query <highlight>{{term}}</highlight>"
							values={{ count, term }}
							components={{
								highlight: <em className="quote" />,
							}}
						/>
					</p>
				) : (
					<p className="text-xl text-gray-900">{t("These are my articles.")}</p>
				)}
			</header>

			<div className="space-y-4">
				<Form method="get" role="search" className="p-4">
					<label htmlFor="q" className="block pl-4 text-lg font-semibold">
						{t("Search")}
					</label>
					<div className="flex items-center space-x-4">
						<input
							id="q"
							type="search"
							name="q"
							defaultValue={term}
							className="flex-grow rounded-full py-2 px-4"
							placeholder={t("Remix, SWR, Next, Rails...")}
						/>
						<button
							type="submit"
							className="rounded-full border border-gray-900 bg-gray-800 px-4 py-2 text-white"
						>
							{submission ? t("Searching...") : t("Search")}
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
					<Link to={`/articles?page=${page - 1}`} prefetch="intent">
						Previous page
					</Link>
				)}
				{count === 40 && (
					<Link to={`/articles?page=${page + 1}`} prefetch="intent">
						Next page
					</Link>
				)}
			</footer>
		</main>
	);
}
