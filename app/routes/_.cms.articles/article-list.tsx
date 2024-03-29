import type { loader } from "./route";

import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Button } from "react-aria-components";
import { Trans } from "react-i18next";

import { useT } from "~/helpers/use-i18n.hook";

import { INTENT } from "./types";

export function ArticleList() {
	let { articles } = useLoaderData<typeof loader>();
	return (
		<ol className="rouned-lg divide-y divide-gray-100 bg-white px-5">
			{articles.map((article) => (
				<Item key={article.id} {...article} />
			))}
		</ol>
	);
}

type ItemProps = {
	id: string;
	path: string;
	title: string;
	date: string;
};

function Item(props: ItemProps) {
	let t = useT("cms.articles.list.item");
	let fetcher = useFetcher();

	return (
		<li className="flex items-center justify-between gap-3 gap-x-6 py-5">
			<div className="flex flex-col gap-1">
				<Link to={props.path}>
					<h3 className="text-sm font-semibold leading-6 text-gray-900 underline">
						{props.title}
					</h3>
				</Link>

				<div className="flex items-center gap-x-2 text-xs leading-5 text-gray-500">
					<Trans
						t={t}
						className="whitespace-nowrap"
						parent="time"
						i18nKey="publishedOn"
						values={{ date: props.date }}
					/>
				</div>
			</div>

			<div className="flex flex-shrink-0 gap-0.5">
				<Link
					to={props.id}
					className="block rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 no-underline shadow-sm ring-1 ring-inset ring-gray-300 visited:text-gray-900 hover:bg-gray-50"
				>
					{t("edit")}
				</Link>

				<fetcher.Form method="post">
					<input type="hidden" name="id" value={props.id} />
					<Button
						type="submit"
						name="intent"
						value={INTENT.moveToTutorial}
						className="block rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 no-underline shadow-sm ring-1 ring-inset ring-gray-300 visited:text-gray-900 hover:bg-gray-50"
					>
						{t("moveToTutorial")}
					</Button>
				</fetcher.Form>
			</div>
		</li>
	);
}
