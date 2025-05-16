import { useId } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";
import { Tag, TagGroup } from "~/ui/TagGroup";
import type { UUID } from "~/utils/uuid";
import { INTENT } from "../types";

interface Tutorial {
	id: UUID;
	title: string;
	path: string;
	date: string;
	tags: string[];
}

export function TutorialList({ tutorials }: { tutorials: Tutorial[] }) {
	return (
		<ol className="rouned-lg divide-y divide-zinc-100 bg-white px-5 dark:divide-zinc-700 dark:bg-zinc-800">
			{tutorials.map((tutorial) => (
				<Item key={tutorial.id} {...tutorial} />
			))}
		</ol>
	);
}

function Item(props: Tutorial) {
	let { t } = useTranslation("translation", {
		keyPrefix: "cms.tutorials.list.item",
	});
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
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: This is ok */}
					<svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
						<circle cx="1" cy="1" r="1" />
					</svg>

					<span id={id}>Tags:</span>

					<TagGroup aria-labelledby={id} className="flex-row" color="blue">
						{props.tags.map((tag) => {
							return <Tag key={tag}>{tag}</Tag>;
						})}
					</TagGroup>
				</div>
			</div>

			<div className="flex flex-shrink-0 items-center gap-2">
				<Form method="get" action={`/cms/tutorials/${props.id}`}>
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
	return (
		<Form navigate={false} method="POST">
			<input type="hidden" name="intent" value={INTENT.delete} />
			<input type="hidden" name="id" value={id} />
			<Button type="submit" variant="destructive">
				Delete
			</Button>
		</Form>
	);
}
