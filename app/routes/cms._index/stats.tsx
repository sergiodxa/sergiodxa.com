import type { loader } from "./route";

import { Link, useLoaderData } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";

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
	];

	return (
		<div>
			<h3 className="text-base font-semibold leading-6 text-gray-900">
				{t("title")}
			</h3>
			<dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
				{stats.map((item) => (
					<div
						key={item.name}
						className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
					>
						<dt>
							<p className="truncate text-sm font-medium text-gray-500">
								{item.name}
							</p>
						</dt>
						<dd className="flex items-baseline pb-6 sm:pb-7">
							<p className="text-2xl font-semibold text-gray-900">
								{item.stat}
							</p>
							<div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
								<div className="text-sm">
									<Link
										to={item.path}
										prefetch="intent"
										className="font-medium text-indigo-600 hover:text-indigo-500"
									>
										{t("viewAll")}
									</Link>
								</div>
							</div>
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
