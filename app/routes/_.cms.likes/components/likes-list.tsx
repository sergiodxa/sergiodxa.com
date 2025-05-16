import { Button } from "react-aria-components";
import { Trans, useTranslation } from "react-i18next";
import { Link, useFetcher } from "react-router";
import type { UUID } from "~/utils/uuid";
import { INTENT } from "../types";

interface Like {
	id: UUID;
	title: string;
	createdAt: string;
	url: URL;
}

interface LikesListProps {
	likes: Array<Like>;
}

export function LikesList({ likes }: LikesListProps) {
	return (
		<ol className="rouned-lg divide-y divide-gray-100 bg-white px-5">
			{likes.map((like) => (
				<Item key={like.id} {...like} />
			))}
		</ol>
	);
}

function Item(props: Like) {
	let { t } = useTranslation("translation", {
		keyPrefix: "cms.likes.list.item",
	});

	return (
		<li className="flex items-center justify-between gap-3 gap-x-6 py-5">
			<div className="flex flex-col gap-1">
				<Link to={props.url.toString()}>
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
	let { t } = useTranslation("translation", {
		keyPrefix: "cms.likes.list.item.delete",
	});

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
