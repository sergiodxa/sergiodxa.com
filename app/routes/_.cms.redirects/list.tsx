import type { loader } from "./route";

import { useLoaderData } from "@remix-run/react";
import { GridList, GridListItem } from "react-aria-components";

export function RedirectsList() {
	let { list } = useLoaderData<typeof loader>();

	return (
		<GridList
			aria-label="Redirects"
			selectionMode="multiple"
			className="flex flex-col gap-0.5 rounded-md border border-neutral-300 p-1 data-[focus-visible]:outline-2 data-[focus-visible]:outline-blue-600"
		>
			{list.map((redirect) => {
				return (
					<GridListItem
						key={redirect.from + redirect.to}
						textValue={`From: ${redirect.from} To: ${redirect.to}`}
						className="data-[selected]:bg-grey-100 flex items-center gap-2.5 rounded-md p-1 pl-2 data-[selected]:text-blue-600"
					>
						{/* <StyledCheckbox value={key} /> */}
						From: {redirect.from} - To: {redirect.to}
					</GridListItem>
				);
			})}
		</GridList>
	);
}
