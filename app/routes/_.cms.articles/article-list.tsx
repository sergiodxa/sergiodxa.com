import type { SerializeFrom } from "@remix-run/cloudflare";
import type { UUID } from "~/utils/uuid";
import type { loader } from "./route";

import { useFetcher, useLoaderData } from "@remix-run/react";
import { useId } from "react";
import { Trans } from "react-i18next";

import { useT } from "~/helpers/use-i18n.hook";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";

import { INTENT } from "./types";

export function ArticlesList() {
	let { articles } = useLoaderData<typeof loader>();
	return (
		<ol className="rouned-lg divide-y divide-zinc-100 bg-white px-5 dark:divide-zinc-700 dark:bg-zinc-800">
			{articles.map((article) => (
				<Item key={article.id} {...article} />
			))}
		</ol>
	);
}

type ItemProps = SerializeFrom<typeof loader>["articles"][number];

function Item(props: ItemProps) {
	let t = useT("cms.articles.list.item");
	let id = useId();

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
