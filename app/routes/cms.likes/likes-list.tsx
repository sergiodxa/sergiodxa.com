import type { loader } from "./route";
import type { SerializeFrom } from "@remix-run/cloudflare";
import type { UUID } from "~/utils/uuid";

import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Button } from "react-aria-components";
import { Trans } from "react-i18next";

import { useT } from "~/helpers/use-i18n.hook";

import { INTENT } from "./types";

export function LikesList() {
	let { likes } = useLoaderData<typeof loader>();
	return (
		<ol className="rouned-lg divide-y divide-gray-100 bg-white px-5">
			{likes.map((like) => (
				<Item key={like.id} {...like} />
			))}
		</ol>
	);
}

type ItemProps = SerializeFrom<typeof loader>["likes"][number];

function Item(props: ItemProps) {
	let t = useT("cms.likes.list.item");

	return (
		<li className="flex items-center justify-between gap-3 gap-x-6 py-5">
			<div className="flex flex-col gap-1">
				<Link to={props.url}>
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
						values={{ date: props.createdAt }}
					/>
				</div>
			</div>

			<div className="flex flex-shrink-0 items-center gap-1">
				<Link
					to={props.id}
					className="block rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 no-underline shadow-sm ring-1 ring-inset ring-gray-300 visited:text-gray-900 hover:bg-gray-50"
				>
					{t("edit")}
				</Link>

				<DeleteButton id={props.id} />
			</div>
		</li>
	);
}

function DeleteButton({ id }: { id: UUID }) {
	let fetcher = useFetcher();
	let t = useT("cms.likes.list.item.delete");

	let isDeleting = fetcher.state !== "idle";

	return (
		<fetcher.Form method="POST">
			<input type="hidden" name="intent" value={INTENT.delete} />
			<input type="hidden" name="id" value={id} />
			<Button
				type="submit"
				className="block rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 no-underline shadow-sm ring-1 ring-inset ring-gray-300 visited:text-gray-900 hover:bg-gray-50"
			>
				{isDeleting ? t("pending") : t("cta")}
			</Button>
		</fetcher.Form>
	);
}
