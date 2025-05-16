import { Trans, useTranslation } from "react-i18next";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";
import type { UUID } from "~/utils/uuid";
import type { action } from "../route";

import { useFetcher } from "react-router";
import { INTENT } from "../types";

interface Article {
	id: UUID;
	title: string;
	path: string;
	date: string;
}

export function ArticlesList({ articles }: { articles: Article[] }) {
	return (
		<ol className="rouned-lg divide-y divide-zinc-100 bg-white px-5 dark:divide-zinc-700 dark:bg-zinc-800">
			{articles.map((article) => (
				<Item key={article.id} {...article} />
			))}
		</ol>
	);
}

function Item(props: Article) {
	let { t } = useTranslation("translation", {
		keyPrefix: "cms.articles.list.item",
	});
	let fetcher = useFetcher<typeof action>();

	return (
		<li className="flex items-center justify-between gap-3 gap-x-6 py-5">
			<div className="flex flex-col gap-1">
				<Link href={props.path}>
					<h3 className="text-sm font-semibold leading-6 text-zinc-900 underline dark:text-zinc-50">
						{props.title}
					</h3>
				</Link>

				<div className="flex items-baseline gap-x-2 text-xs leading-5 text-zinc-500 dark:text-zinc-300">
					<Trans
						t={t}
						className="whitespace-nowrap"
						parent="time"
						i18nKey="publishedOn"
						values={{ date: props.date }}
					/>
				</div>
			</div>

			<div className="flex flex-shrink-0 items-center gap-2">
				<Form method="get" action={`/cms/articles/${props.id}`}>
					<Button type="submit" variant="primary">
						{t("edit")}
					</Button>
				</Form>

				<fetcher.Form method="post">
					<input type="hidden" name="id" value={props.id} />
					<Button
						type="submit"
						name="intent"
						value={INTENT.moveToTutorial}
						variant="secondary"
					>
						{t("moveToTutorial")}
					</Button>
				</fetcher.Form>

				<DeleteButton id={props.id} />
			</div>
		</li>
	);
}

function DeleteButton({ id }: { id: UUID }) {
	let fetcher = useFetcher();

	return (
		<fetcher.Form method="POST">
			<input type="hidden" name="intent" value={INTENT.delete} />
			<input type="hidden" name="id" value={id} />
			<Button type="submit" variant="destructive">
				Delete
			</Button>
		</fetcher.Form>
	);
}
