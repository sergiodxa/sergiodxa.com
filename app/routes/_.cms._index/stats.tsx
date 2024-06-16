import type { loader } from "./route";

import { useLoaderData } from "@remix-run/react";
import { Heading } from "react-aria-components";

import { useT } from "~/helpers/use-i18n.hook";
import { Link } from "~/ui/Link";

export function Stats() {
	let loaderData = useLoaderData<typeof loader>();
	let t = useT("cms._index.stats");

	let stats = [
		{
			name: t("total.articles"),
			path: "articles",
			stat: loaderData.stats.articles,
		},
		{ name: t("total.likes"), path: "likes", stat: loaderData.stats.likes },
		{
			name: t("total.tutorials"),
			path: "tutorials",
			stat: loaderData.stats.tutorials,
		},
		{
			name: t("total.glossary"),
			path: "glossary",
			stat: loaderData.stats.glossary,
		},
	] satisfies Array<{ name: string; path: string; stat: number }>;

	return (
		<div className="flex flex-col gap-5">
			<Heading className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
				{t("title")}
			</Heading>

			<dl className="grid grid-cols-1 gap-5 sm:grid-cols-4">
				{stats.map((item) => (
					<div
						key={item.name}
						className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 dark:bg-zinc-600"
					>
						<dt>
							<p className="truncate text-sm font-medium text-zinc-500 dark:text-zinc-300">
								{item.name}
							</p>
						</dt>
						<dd className="flex items-baseline pb-6 sm:pb-7">
							<p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
								{item.stat}
							</p>
							<div className="absolute inset-x-0 bottom-0 bg-zinc-50 px-4 py-4 sm:px-6 dark:bg-zinc-700">
								<Link href={item.path} prefetch="intent">
									{t("viewAll")}
								</Link>
							</div>
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
