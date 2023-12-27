import type { loader } from "./route";

import { useLoaderData } from "@remix-run/react";
import { Heading } from "react-aria-components";

import { useT } from "~/helpers/use-i18n.hook";

export function LastDaySearch() {
	let { lastDaySearch } = useLoaderData<typeof loader>();
	let t = useT("cms._index.lastDaySearch");

	return (
		<div className="flex flex-col gap-5">
			<Heading className="text-base font-semibold leading-6 text-gray-900">
				{t("title")}
			</Heading>

			<ul className="grid grid-cols-2 gap-2 rounded-lg bg-white px-4 py-5 shadow sm:p-6">
				{lastDaySearch.map((searchTerm) => (
					<li key={searchTerm} className="flex-grow">
						{searchTerm}
					</li>
				))}
			</ul>
		</div>
	);
}
