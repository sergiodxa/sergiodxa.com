import type { loader } from "./route";
import type { SerializeFrom } from "@remix-run/cloudflare";

import { Link, useLoaderData } from "@remix-run/react";
import { Trans } from "react-i18next";

import { useT } from "~/helpers/use-i18n.hook";

export function TutorialList() {
	let { tutorials } = useLoaderData<typeof loader>();
	return (
		<ol className="rouned-lg divide-y divide-gray-100 bg-white px-5">
			{tutorials.map((tutorial) => (
				<Item key={tutorial.id} {...tutorial} />
			))}
		</ol>
	);
}

type ItemProps = SerializeFrom<typeof loader>["tutorials"][number];

function Item(props: ItemProps) {
	let t = useT("cms.tutorials.list.item");

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
					<svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
						<circle cx="1" cy="1" r="1" />
					</svg>
					<span>Tags:</span>
					<ul className="flex items-center gap-1">
						{props.tags.map((tag) => {
							return (
								<li
									key={tag}
									className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 no-underline visited:text-blue-800"
								>
									{tag}
								</li>
							);
						})}
					</ul>
				</div>
			</div>

			<div className="flex-shrink-0">
				<Link
					to={props.id}
					className="block rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 no-underline shadow-sm ring-1 ring-inset ring-gray-300 visited:text-gray-900 hover:bg-gray-50"
				>
					{t("edit")}
				</Link>
			</div>
		</li>
	);
}
